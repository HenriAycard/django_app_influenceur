"""API authorization and validation tests.

These lock in the security batch of 2026-06-10 (role-bound transitions,
venue-ownership guards, read-only role flags) and the application rules
(active-duplicate prevention, follower gate, clean 400s on bad input).

Run with: python manage.py test intouch.api
"""
from unittest.mock import patch

from django.conf import settings
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone

from .models import (Address, Conversation, FCMToken, Message, Offer, Opening,
                     Reservation, TypeVenue, User, Venue, VenueView, imgVenue)
from .test_support import ApiWorldMixin, make_brand, make_influencer, make_user


@override_settings(SECURE_SSL_REDIRECT=False)  # the test client speaks plain http
class ApiTestCase(ApiWorldMixin, TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in the cache
        self.build_world()


class ReservationAuthorizationTests(ApiTestCase):

    def test_influencer_cannot_self_accept(self):
        reservation = self.application()
        response = self.as_user(self.influencer).patch(
            f'/api/reservation/{reservation.id}', {'status': 1}, format='json')
        self.assertEqual(response.status_code, 403)
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 0)

    def test_owner_can_accept(self):
        reservation = self.application()
        response = self.as_user(self.brand).patch(
            f'/api/reservation/{reservation.id}', {'status': 1}, format='json')
        self.assertEqual(response.status_code, 200)
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, 1)

    def test_no_transition_back_to_pending(self):
        reservation = self.application(status=1)
        response = self.as_user(self.brand).patch(
            f'/api/reservation/{reservation.id}', {'status': 0}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_offer_is_immutable_after_applying(self):
        other_offer = Offer.objects.create(
            venue=self.venue, name='Other', content='x', conditions='x', tags='x')
        reservation = self.application()
        response = self.as_user(self.influencer).patch(
            f'/api/reservation/{reservation.id}', {'offer_id': other_offer.id}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_stranger_cannot_touch_reservation(self):
        stranger = make_user('stranger@test.io', influencer=True)
        reservation = self.application()
        response = self.as_user(stranger).patch(
            f'/api/reservation/{reservation.id}', {'status': 2}, format='json')
        self.assertEqual(response.status_code, 403)


class VenueOwnershipTests(ApiTestCase):

    def test_cannot_create_offer_on_foreign_venue(self):
        response = self.as_user(self.influencer).post('/api/offer/', {
            'venue': self.venue.id, 'name': 'Hack', 'content': 'x',
            'conditions': 'x', 'tags': 'x',
        }, format='json')
        self.assertEqual(response.status_code, 403)

    def test_owner_can_create_offer(self):
        response = self.as_user(self.brand).post('/api/offer/', {
            'venue': self.venue.id, 'name': 'Legit', 'content': 'x',
            'conditions': 'x', 'tags': 'x',
        }, format='json')
        self.assertEqual(response.status_code, 201)

    def test_role_flags_are_read_only(self):
        response = self.as_user(self.influencer).patch(
            f'/api/user/{self.influencer.id}',
            {'is_influencer': False, 'is_company': True}, format='json')
        self.assertEqual(response.status_code, 200)
        self.influencer.refresh_from_db()
        self.assertTrue(self.influencer.is_influencer)
        self.assertFalse(self.influencer.is_company)


class ApplicationRulesTests(ApiTestCase):

    def apply(self):
        return self.as_user(self.influencer).post('/api/reservation/', {
            'offer_id': self.offer.id,
            'date_reservation': (timezone.now() + timezone.timedelta(days=3)).isoformat(),
        }, format='json')

    def test_duplicate_pending_application_rejected(self):
        self.assertEqual(self.apply().status_code, 201)
        response = self.apply()
        self.assertEqual(response.status_code, 400)
        self.assertIn('pending application', response.json()['detail'])

    def test_blocked_while_collaboration_is_upcoming(self):
        Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=1,
            date_reservation=timezone.now() + timezone.timedelta(days=2),
        )
        self.assertEqual(self.apply().status_code, 400)

    def test_reapply_after_decline_is_allowed(self):
        self.assertEqual(self.apply().status_code, 201)
        Reservation.objects.filter(user=self.influencer, offer=self.offer).update(status=2)
        self.assertEqual(self.apply().status_code, 201)

    def test_reapply_after_completed_collaboration_is_allowed(self):
        # The venue validated a past collaboration (status stays Accepted);
        # the influencer must be able to apply again — Henri's review case.
        Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=1,
            date_reservation=timezone.now() - timezone.timedelta(days=7),
            completed_at=timezone.now() - timezone.timedelta(days=6),
        )
        self.assertEqual(self.apply().status_code, 201)

    def test_reapply_after_past_unvalidated_collaboration_is_allowed(self):
        # The venue never validated: a stale past collaboration must not
        # lock the influencer out either.
        Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=1,
            date_reservation=timezone.now() - timezone.timedelta(days=7),
        )
        self.assertEqual(self.apply().status_code, 201)

    def test_follower_gate(self):
        self.offer.min_followers_instagram = 10_000  # influencer has 5 000
        self.offer.save()
        response = self.apply()
        self.assertEqual(response.status_code, 400)
        self.assertIn('Instagram', response.json()['detail'])


class CleanValidationTests(ApiTestCase):

    def test_reservation_list_rejects_bad_date(self):
        response = self.as_user(self.influencer).get('/api/reservation/?from_date=hello')
        self.assertEqual(response.status_code, 400)

    def test_reservation_list_rejects_bad_status(self):
        response = self.as_user(self.influencer).get('/api/reservation/?status=abc')
        self.assertEqual(response.status_code, 400)

    def test_search_requires_param(self):
        response = self.as_user(self.influencer).get('/api/venue/search/')
        self.assertEqual(response.status_code, 400)

    def test_search_survives_garbage_input(self):
        response = self.as_user(self.influencer).get(
            "/api/venue/search/?search=%22%27%26%7C!%20(deluxe")
        self.assertEqual(response.status_code, 200)

    def test_offer_list_requires_venue_param(self):
        response = self.as_user(self.brand).get('/api/offer/')
        self.assertEqual(response.status_code, 400)


class LifecycleTests(ApiTestCase):

    def past_accepted(self):
        return Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=1,
            date_reservation=timezone.now() - timezone.timedelta(days=1),
        )

    def test_influencer_submits_post_link(self):
        reservation = self.past_accepted()
        response = self.as_user(self.influencer).post(
            f'/api/reservation/{reservation.id}/post-link',
            {'url': 'https://instagram.com/p/abc'}, format='json')
        self.assertEqual(response.status_code, 200)
        reservation.refresh_from_db()
        self.assertEqual(reservation.post_url, 'https://instagram.com/p/abc')
        self.assertIsNotNone(reservation.post_submitted_at)

    def test_post_link_rejected_before_the_visit(self):
        reservation = self.application(status=1)  # future date
        response = self.as_user(self.influencer).post(
            f'/api/reservation/{reservation.id}/post-link',
            {'url': 'https://instagram.com/p/abc'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_owner_validates_collaboration(self):
        reservation = self.past_accepted()
        response = self.as_user(self.brand).post(
            f'/api/reservation/{reservation.id}/complete', {}, format='json')
        self.assertEqual(response.status_code, 200)
        reservation.refresh_from_db()
        self.assertIsNotNone(reservation.completed_at)

    def test_influencer_cannot_validate(self):
        reservation = self.past_accepted()
        response = self.as_user(self.influencer).post(
            f'/api/reservation/{reservation.id}/complete', {}, format='json')
        self.assertEqual(response.status_code, 403)

    def test_no_show_blocked_after_validation(self):
        reservation = self.past_accepted()
        reservation.completed_at = timezone.now()
        reservation.save()
        response = self.as_user(self.brand).post(
            f'/api/reservation/{reservation.id}/no-show', {}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_owner_reports_no_show(self):
        reservation = self.past_accepted()
        response = self.as_user(self.brand).post(
            f'/api/reservation/{reservation.id}/no-show', {}, format='json')
        self.assertEqual(response.status_code, 200)
        reservation.refresh_from_db()
        self.assertIsNotNone(reservation.no_show_at)


class InfluencerStatsTests(ApiTestCase):
    """The reservation detail carries the applying influencer's track record
    (realized collaborations + no-shows) — for the venue owner only."""

    def past_collab(self, *, no_show=False, days_ago=5):
        return Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=1,
            date_reservation=timezone.now() - timezone.timedelta(days=days_ago),
            no_show_at=timezone.now() if no_show else None,
        )

    def test_owner_sees_track_record(self):
        self.past_collab(days_ago=10)
        self.past_collab(days_ago=8)
        self.past_collab(no_show=True, days_ago=5)
        application = self.application()
        response = self.as_user(self.brand).get(f'/api/reservation/{application.id}')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['influencerStats'],
                         {'completed': 2, 'noShows': 1})

    def test_pending_and_upcoming_do_not_count(self):
        self.application()  # pending
        upcoming = self.application(status=1)  # accepted, future date
        response = self.as_user(self.brand).get(f'/api/reservation/{upcoming.id}')
        self.assertEqual(response.json()['influencerStats'],
                         {'completed': 0, 'noShows': 0})

    def test_influencer_does_not_receive_stats(self):
        self.past_collab(no_show=True)
        application = self.application()
        response = self.as_user(self.influencer).get(f'/api/reservation/{application.id}')
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(response.json()['influencerStats'])


class RegistrationTests(ApiTestCase):

    def test_influencer_needs_a_social_handle(self):
        response = self.client.post('/api/register/', {
            'email': 'new@test.io', 'firstname': 'New', 'lastname': 'One',
            'role': 'influencer',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_application_creates_inactive_account_without_password(self):
        response = self.client.post('/api/register/', {
            'email': 'new@test.io', 'firstname': 'New', 'lastname': 'One',
            'role': 'influencer', 'instagram': '@new',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email='new@test.io')
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())
        self.assertTrue(user.is_influencer)

    def test_duplicate_email_rejected(self):
        response = self.client.post('/api/register/', {
            'email': self.influencer.email, 'firstname': 'X', 'lastname': 'Y',
            'role': 'venue',
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_anonymous_cannot_list_reservations(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/reservation/')
        self.assertEqual(response.status_code, 401)


class OfferArchiveTests(ApiTestCase):
    """Offers are the contract of record for their reservations: DELETE
    archives them instead of destroying (offer-archive chantier A)."""

    def archive(self):
        return self.as_user(self.brand).delete(f'/api/offer/{self.offer.id}')

    def listed_offer_ids(self, user):
        response = self.as_user(user).get(f'/api/offer/?venue={self.venue.id}')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        items = data['results'] if isinstance(data, dict) else data
        return [offer['id'] for offer in items]

    def test_delete_archives_instead_of_destroying(self):
        reservation = self.application(status=1)
        response = self.archive()
        self.assertEqual(response.status_code, 204)
        self.offer.refresh_from_db()
        self.assertIsNotNone(self.offer.archived_at)
        reservation.refresh_from_db()  # the collaboration survives

    def test_archive_is_idempotent(self):
        self.archive()
        self.offer.refresh_from_db()
        first = self.offer.archived_at
        self.archive()
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.archived_at, first)

    def test_influencer_cannot_archive(self):
        response = self.as_user(self.influencer).delete(f'/api/offer/{self.offer.id}')
        self.assertEqual(response.status_code, 403)
        self.offer.refresh_from_db()
        self.assertIsNone(self.offer.archived_at)

    def test_archived_offer_hidden_from_influencer_listing(self):
        self.archive()
        self.assertNotIn(self.offer.id, self.listed_offer_ids(self.influencer))

    def test_archived_offer_still_listed_for_owner(self):
        self.archive()
        self.assertIn(self.offer.id, self.listed_offer_ids(self.brand))

    def test_apply_to_archived_offer_rejected(self):
        self.archive()
        response = self.as_user(self.influencer).post(
            '/api/reservation/', {'offer_id': self.offer.id}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_invite_on_archived_offer_rejected(self):
        self.archive()
        response = self.as_user(self.brand).post('/api/reservation/invite/', {
            'offer_id': self.offer.id, 'influencer_id': str(self.influencer.id),
        }, format='json')
        self.assertEqual(response.status_code, 400)

    def test_patch_cannot_unarchive(self):
        self.archive()
        response = self.as_user(self.brand).patch(
            f'/api/offer/{self.offer.id}', {'archivedAt': None}, format='json')
        self.assertEqual(response.status_code, 400)  # archived offers are read-only
        self.offer.refresh_from_db()
        self.assertIsNotNone(self.offer.archived_at)

    def test_reservation_still_exposes_archived_offer(self):
        # Calendar path: the influencer keeps seeing the offer of an accepted
        # collaboration even after the brand archives it.
        self.application(status=1)
        self.archive()
        response = self.as_user(self.influencer).get('/api/reservation/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]['offer']['id'], self.offer.id)


class OfferFreezeTests(ApiTestCase):
    """The offer is the contract shown to applicants: once any non-declined
    reservation exists, its terms are frozen for good (offer-archive chantier B)."""

    def rename(self):
        return self.as_user(self.brand).patch(
            f'/api/offer/{self.offer.id}', {'name': 'Renamed'}, format='json')

    def test_editable_before_any_application(self):
        response = self.rename()
        self.assertEqual(response.status_code, 200)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.name, 'Renamed')

    def test_frozen_once_application_exists(self):
        self.application()  # pending
        response = self.rename()
        self.assertEqual(response.status_code, 400)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.name, 'Test Offer')

    def test_declined_application_does_not_freeze(self):
        self.application(status=2)
        self.assertEqual(self.rename().status_code, 200)

    def test_invitation_freezes(self):
        Reservation.objects.create(user=self.influencer, offer=self.offer, status=3)
        self.assertEqual(self.rename().status_code, 400)

    def test_past_collaboration_keeps_terms_frozen(self):
        # Even a finished collaboration must keep its contract intact:
        # the PDF renders live from the offer row.
        Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=1,
            date_reservation=timezone.now() - timezone.timedelta(days=30),
        )
        self.assertEqual(self.rename().status_code, 400)

    def test_is_editable_flag(self):
        def flag():
            response = self.as_user(self.brand).get(f'/api/offer/?venue={self.venue.id}')
            data = response.json()
            items = data['results'] if isinstance(data, dict) else data
            return next(o['isEditable'] for o in items if o['id'] == self.offer.id)

        self.assertTrue(flag())
        self.application()
        self.assertFalse(flag())


class OfferDuplicateTests(ApiTestCase):
    """Duplicating is the way to "modify" a frozen offer: the copy starts
    fresh and editable (offer-archive chantier C)."""

    def duplicate(self, user=None):
        return self.as_user(user or self.brand).post(f'/api/offer/{self.offer.id}/duplicate')

    def test_owner_duplicates_offer(self):
        self.offer.payment_amount = 150
        self.offer.save()
        response = self.duplicate()
        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertNotEqual(body['id'], self.offer.id)
        self.assertEqual(body['name'], 'Test Offer (copy)')
        self.assertEqual(body['venue'], self.venue.id)
        self.assertEqual(float(body['paymentAmount']), 150.0)
        self.assertTrue(body['isEditable'])

    def test_copy_of_archived_offer_is_not_archived(self):
        self.as_user(self.brand).delete(f'/api/offer/{self.offer.id}')
        response = self.duplicate()
        self.assertEqual(response.status_code, 201)
        self.assertIsNone(response.json()['archivedAt'])

    def test_stranger_cannot_duplicate(self):
        response = self.duplicate(user=self.influencer)
        self.assertEqual(response.status_code, 403)

    def test_copy_is_editable_while_original_stays_frozen(self):
        self.application()  # freezes the original
        copy_id = self.duplicate().json()['id']
        response = self.as_user(self.brand).patch(
            f'/api/offer/{copy_id}', {'name': 'Adjusted terms'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.name, 'Test Offer')


# The password make_user() gives every fixture account; needed to exercise the
# real login endpoint (force_authenticate bypasses it).
FIXTURE_PASSWORD = 'Str0ng-Pass-42!'


class JwtCookieAuthTests(ApiTestCase):
    """The refresh token lives only in an httpOnly cookie; the access token is
    returned in the body. Locks the security contract of the httpOnly-refresh
    batch: rotation on every refresh, blacklist on logout, and no refresh token
    reachable from JavaScript-readable storage."""

    LOGIN = '/auth/jwt/create/'
    REFRESH = '/auth/jwt/refresh/'
    LOGOUT = '/auth/jwt/logout/'

    def login(self):
        return self.client.post(
            self.LOGIN,
            {'email': self.influencer.email, 'password': FIXTURE_PASSWORD},
            format='json',
        )

    def test_login_sets_httponly_refresh_cookie(self):
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        cookie = response.cookies.get(settings.REFRESH_COOKIE_NAME)
        self.assertIsNotNone(cookie)
        self.assertTrue(cookie['httponly'])
        self.assertEqual(cookie['path'], settings.REFRESH_COOKIE_PATH)

    def test_login_body_still_carries_refresh_for_portal_sso(self):
        # The SSO portal mints tokens server-side and reads `refresh` from the
        # body to build its redirect — that contract must stay intact.
        self.assertIn('refresh', self.login().data)

    def test_refresh_uses_cookie_and_rotates_it(self):
        old_cookie = self.login().cookies[settings.REFRESH_COOKIE_NAME].value
        response = self.client.post(self.REFRESH, {}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        # A rotated refresh token is written back, different from the old one...
        new_cookie = response.cookies[settings.REFRESH_COOKIE_NAME].value
        self.assertNotEqual(old_cookie, new_cookie)
        # ...and the refresh token is never leaked in the JSON body here.
        self.assertNotIn('refresh', response.data)

    def test_refresh_without_cookie_is_401(self):
        response = self.client.post(self.REFRESH, {}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_logout_blacklists_the_refresh_token(self):
        self.login()
        self.assertEqual(self.client.post(self.LOGOUT).status_code, 205)
        # The now-blacklisted cookie can no longer be refreshed.
        self.assertEqual(
            self.client.post(self.REFRESH, {}, format='json').status_code, 401)

    def test_rotated_refresh_token_cannot_be_replayed(self):
        # BLACKLIST_AFTER_ROTATION: the pre-rotation token dies once it is used.
        original = self.login().cookies[settings.REFRESH_COOKIE_NAME].value
        self.client.post(self.REFRESH, {}, format='json')  # rotates the cookie
        self.client.cookies[settings.REFRESH_COOKIE_NAME] = original  # replay it
        self.assertEqual(
            self.client.post(self.REFRESH, {}, format='json').status_code, 401)


class ExportOwnershipTests(ApiTestCase):
    """Contract PDF and calendar ICS are restricted to the two parties of an
    accepted collaboration; the media kit is the authenticated influencer's own.
    These lock the ownership/authorization gates (the happy paths also confirm
    the WeasyPrint / icalendar pipelines still render)."""

    def setUp(self):
        super().setUp()
        self.accepted = self.application(status=1)
        self.stranger = make_user('stranger@test.io', influencer=True,
                                   instagram='@x', instagram_followers=100)

    def contract(self, pk):
        return f'/api/reservation/{pk}/contract.pdf'

    def ics(self, pk):
        return f'/api/reservation/{pk}/calendar.ics'

    MEDIA_KIT = '/api/influencer/media-kit.pdf'

    # --- contract PDF ---
    def test_contract_available_to_the_influencer(self):
        r = self.as_user(self.influencer).get(self.contract(self.accepted.id))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['Content-Type'], 'application/pdf')

    def test_contract_available_to_the_brand(self):
        r = self.as_user(self.brand).get(self.contract(self.accepted.id))
        self.assertEqual(r.status_code, 200)

    def test_contract_denied_to_a_stranger(self):
        r = self.as_user(self.stranger).get(self.contract(self.accepted.id))
        self.assertEqual(r.status_code, 403)

    def test_contract_requires_authentication(self):
        r = self.client.get(self.contract(self.accepted.id))
        self.assertEqual(r.status_code, 401)

    def test_contract_unavailable_before_acceptance(self):
        pending = self.application(status=0)
        r = self.as_user(self.influencer).get(self.contract(pending.id))
        self.assertEqual(r.status_code, 400)

    # --- calendar ICS ---
    def test_ics_available_to_a_party(self):
        r = self.as_user(self.brand).get(self.ics(self.accepted.id))
        self.assertEqual(r.status_code, 200)
        self.assertIn('text/calendar', r['Content-Type'])
        self.assertIn(b'BEGIN:VCALENDAR', r.content)

    def test_ics_denied_to_a_stranger(self):
        r = self.as_user(self.stranger).get(self.ics(self.accepted.id))
        self.assertEqual(r.status_code, 403)

    def test_ics_requires_authentication(self):
        r = self.client.get(self.ics(self.accepted.id))
        self.assertEqual(r.status_code, 401)

    def test_ics_unavailable_before_acceptance(self):
        pending = self.application(status=0)
        r = self.as_user(self.brand).get(self.ics(pending.id))
        self.assertEqual(r.status_code, 400)

    # --- media kit PDF ---
    def test_media_kit_for_the_influencer(self):
        r = self.as_user(self.influencer).get(self.MEDIA_KIT)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r['Content-Type'], 'application/pdf')

    def test_media_kit_denied_to_a_brand(self):
        r = self.as_user(self.brand).get(self.MEDIA_KIT)
        self.assertEqual(r.status_code, 403)

    def test_media_kit_requires_authentication(self):
        r = self.client.get(self.MEDIA_KIT)
        self.assertEqual(r.status_code, 401)


class MessagingTests(ApiTestCase):
    """A conversation is a thread between an influencer and a venue; only the two
    parties (the influencer and the venue's owner) may read or post. Locks the
    isolation guarantees plus the read-receipt / unread-count behavior. The two
    parties of the standard world are self.influencer and self.brand (who owns
    self.venue)."""

    CONV = '/api/conversations/'
    UNREAD = '/api/conversations/unread-count/'

    def setUp(self):
        super().setUp()
        self.other_influencer = make_influencer('other@test.io')
        self.stranger = make_brand('stranger-brand@test.io')  # owns no venue here

    def messages_url(self, conv_id):
        return f'/api/conversations/{conv_id}/messages/'

    def open_thread(self, actor, **body):
        return self.as_user(actor).post(self.CONV, body, format='json')

    def thread(self):
        """The canonical thread between self.influencer and self.venue."""
        return Conversation.objects.create(influencer=self.influencer, venue=self.venue)

    # --- opening a thread ---
    def test_open_requires_venue_id(self):
        self.assertEqual(
            self.as_user(self.influencer).post(self.CONV, {}, format='json').status_code, 400)

    def test_influencer_opens_a_thread(self):
        r = self.open_thread(self.influencer, venue_id=self.venue.id)
        self.assertEqual(r.status_code, 200)
        conv = Conversation.objects.get(id=r.json()['id'])
        self.assertEqual((conv.influencer_id, conv.venue_id), (self.influencer.id, self.venue.id))

    def test_brand_must_name_the_influencer(self):
        # Opening from the venue side needs to say which influencer it's with.
        r = self.open_thread(self.brand, venue_id=self.venue.id)
        self.assertEqual(r.status_code, 400)

    def test_brand_opens_a_thread_for_an_influencer(self):
        r = self.open_thread(self.brand, venue_id=self.venue.id, user_id=str(self.influencer.id))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Conversation.objects.get(id=r.json()['id']).influencer_id, self.influencer.id)

    def test_opening_the_same_thread_is_idempotent(self):
        first = self.open_thread(self.influencer, venue_id=self.venue.id).json()['id']
        second = self.open_thread(self.influencer, venue_id=self.venue.id).json()['id']
        self.assertEqual(first, second)
        self.assertEqual(Conversation.objects.count(), 1)

    # --- listing / isolation ---
    def test_list_returns_only_my_threads(self):
        mine = self.thread()
        Conversation.objects.create(influencer=self.other_influencer, venue=self.venue)
        r = self.as_user(self.influencer).get(self.CONV)
        self.assertEqual([c['id'] for c in r.json()], [mine.id])

    def test_brand_sees_threads_on_its_venue(self):
        conv = self.thread()
        r = self.as_user(self.brand).get(self.CONV)
        self.assertEqual([c['id'] for c in r.json()], [conv.id])

    def test_stranger_sees_no_threads(self):
        self.thread()
        self.assertEqual(self.as_user(self.stranger).get(self.CONV).json(), [])

    # --- messages: access control ---
    def test_party_posts_and_the_other_lists_it(self):
        conv = self.thread()
        post = self.as_user(self.influencer).post(
            self.messages_url(conv.id), {'body': 'Hello'}, format='json')
        self.assertEqual(post.status_code, 201)
        listing = self.as_user(self.brand).get(self.messages_url(conv.id))
        self.assertEqual(listing.status_code, 200)
        self.assertEqual([m['body'] for m in listing.json()], ['Hello'])

    def test_stranger_cannot_read_messages(self):
        conv = self.thread()
        self.assertEqual(
            self.as_user(self.stranger).get(self.messages_url(conv.id)).status_code, 403)

    def test_stranger_cannot_post_messages(self):
        conv = self.thread()
        r = self.as_user(self.stranger).post(
            self.messages_url(conv.id), {'body': 'hi'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_blank_body_rejected(self):
        conv = self.thread()
        r = self.as_user(self.influencer).post(
            self.messages_url(conv.id), {'body': '   '}, format='json')
        self.assertEqual(r.status_code, 400)

    # --- read receipts / unread count ---
    def test_fetching_marks_the_other_partys_message_read(self):
        conv = self.thread()
        self.as_user(self.influencer).post(self.messages_url(conv.id), {'body': 'ping'}, format='json')
        self.as_user(self.brand).get(self.messages_url(conv.id))  # brand opens the thread
        self.assertIsNotNone(conv.messages.get().read_at)

    def test_unread_count_excludes_my_own_and_counts_the_rest(self):
        conv = self.thread()
        for body in ('a', 'b'):
            self.as_user(self.influencer).post(self.messages_url(conv.id), {'body': body}, format='json')
        self.assertEqual(self.as_user(self.brand).get(self.UNREAD).json()['count'], 2)
        self.assertEqual(self.as_user(self.influencer).get(self.UNREAD).json()['count'], 0)

    def test_unread_count_drops_after_reading(self):
        conv = self.thread()
        self.as_user(self.influencer).post(self.messages_url(conv.id), {'body': 'a'}, format='json')
        self.as_user(self.brand).get(self.messages_url(conv.id))  # read
        self.assertEqual(self.as_user(self.brand).get(self.UNREAD).json()['count'], 0)

    def test_since_filter_returns_only_newer_messages(self):
        conv = self.thread()
        old = Message.objects.create(conversation=conv, sender=self.influencer, body='old')
        Message.objects.filter(pk=old.pk).update(
            created_at=timezone.now() - timezone.timedelta(hours=1))
        Message.objects.create(conversation=conv, sender=self.influencer, body='new')
        since = (timezone.now() - timezone.timedelta(minutes=30)).isoformat()
        r = self.as_user(self.brand).get(self.messages_url(conv.id), {'since': since})
        self.assertEqual([m['body'] for m in r.json()], ['new'])

    def test_messaging_endpoints_require_authentication(self):
        conv = self.thread()
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(self.CONV).status_code, 401)
        self.assertEqual(self.client.get(self.UNREAD).status_code, 401)
        self.assertEqual(self.client.get(self.messages_url(conv.id)).status_code, 401)


class ReviewTests(ApiTestCase):
    """A review is left after a completed collaboration (an accepted reservation
    whose date has passed); direction is inferred from the author. Locks the
    'completed only', 'party only', 'once only', in-range-rating rules and the
    viewer-directed listing (?venue= = influencer→venue, ?influencer= = brand→
    influencer)."""

    REVIEW = '/api/review/'

    def setUp(self):
        super().setUp()
        self.stranger = make_influencer('stranger-inf@test.io')

    def completed(self):
        return Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=1,
            date_reservation=timezone.now() - timezone.timedelta(days=1))

    def post_review(self, actor, reservation, rating=5, comment='Great'):
        return self.as_user(actor).post(
            self.REVIEW,
            {'rating': rating, 'comment': comment, 'reservation_id': reservation.id},
            format='json')

    # --- creation ---
    def test_influencer_reviews_the_venue(self):
        self.assertEqual(self.post_review(self.influencer, self.completed()).status_code, 201)

    def test_brand_reviews_the_influencer(self):
        self.assertEqual(self.post_review(self.brand, self.completed()).status_code, 201)

    def test_cannot_review_a_foreign_collaboration(self):
        self.assertEqual(self.post_review(self.stranger, self.completed()).status_code, 403)

    def test_cannot_review_before_completion(self):
        upcoming = self.application(status=1)  # accepted but its date is in the future
        self.assertEqual(self.post_review(self.influencer, upcoming).status_code, 400)

    def test_cannot_review_twice(self):
        collab = self.completed()
        self.assertEqual(self.post_review(self.influencer, collab).status_code, 201)
        self.assertEqual(self.post_review(self.influencer, collab).status_code, 400)

    def test_rating_must_be_within_range(self):
        self.assertEqual(
            self.post_review(self.influencer, self.completed(), rating=6).status_code, 400)

    def test_review_requires_authentication(self):
        collab = self.completed()
        self.client.force_authenticate(user=None)
        r = self.client.post(
            self.REVIEW, {'rating': 5, 'reservation_id': collab.id}, format='json')
        self.assertEqual(r.status_code, 401)

    # --- listing (viewer-directed) ---
    def test_venue_listing_returns_influencer_authored_reviews(self):
        self.post_review(self.influencer, self.completed(), comment='Loved it')
        r = self.as_user(self.brand).get(self.REVIEW, {'venue': self.venue.id})
        self.assertEqual([rv['comment'] for rv in r.json()], ['Loved it'])

    def test_influencer_listing_returns_brand_authored_reviews(self):
        self.post_review(self.brand, self.completed(), comment='Reliable')
        r = self.as_user(self.brand).get(self.REVIEW, {'influencer': str(self.influencer.id)})
        self.assertEqual([rv['comment'] for rv in r.json()], ['Reliable'])

    def test_listing_without_a_filter_is_empty(self):
        self.post_review(self.influencer, self.completed())
        self.assertEqual(self.as_user(self.brand).get(self.REVIEW).json(), [])


class AnalyticsTests(ApiTestCase):
    """Per-venue analytics belong to the owning brand; the influencer funnel to
    the influencer. Venue page views are logged for influencer visitors only
    (the owner's own visits never inflate the count)."""

    INF_ANALYTICS = '/api/influencer/analytics'

    def setUp(self):
        super().setUp()
        self.visitor = make_influencer('visitor@test.io')

    def venue_analytics(self, pk):
        return f'/api/venue/{pk}/analytics'

    def venue_view(self, pk):
        return f'/api/venue/{pk}/view'

    def completed_for(self, user):
        return Reservation.objects.create(
            user=user, offer=self.offer, status=1,
            date_reservation=timezone.now() - timezone.timedelta(days=1))

    # --- venue analytics ---
    def test_owner_sees_venue_analytics(self):
        self.completed_for(self.influencer)  # one realized partnership
        Reservation.objects.create(  # one pending application
            user=self.visitor, offer=self.offer, status=0,
            date_reservation=timezone.now() + timezone.timedelta(days=2))
        data = self.as_user(self.brand).get(self.venue_analytics(self.venue.id)).json()
        self.assertEqual(data['applicationsTotal'], 2)
        self.assertEqual(data['pending'], 1)
        self.assertEqual(data['accepted'], 1)
        self.assertEqual(data['partnershipsCompleted'], 1)
        self.assertEqual(data['influencersReceived'], 1)

    def test_venue_analytics_denied_to_non_owner(self):
        self.assertEqual(
            self.as_user(self.visitor).get(self.venue_analytics(self.venue.id)).status_code, 403)

    def test_venue_analytics_requires_authentication(self):
        self.assertEqual(self.client.get(self.venue_analytics(self.venue.id)).status_code, 401)

    # --- influencer analytics ---
    def test_influencer_sees_own_analytics(self):
        self.completed_for(self.influencer)
        data = self.as_user(self.influencer).get(self.INF_ANALYTICS).json()
        self.assertEqual(data['collaborationsRealized'], 1)

    def test_influencer_analytics_denied_to_brand(self):
        self.assertEqual(self.as_user(self.brand).get(self.INF_ANALYTICS).status_code, 403)

    def test_influencer_analytics_requires_authentication(self):
        self.assertEqual(self.client.get(self.INF_ANALYTICS).status_code, 401)

    # --- venue view logging ---
    def test_visit_is_logged(self):
        r = self.as_user(self.visitor).post(self.venue_view(self.venue.id))
        self.assertEqual(r.status_code, 204)
        self.assertEqual(
            VenueView.objects.filter(venue=self.venue, user=self.visitor).count(), 1)

    def test_owner_visit_is_not_logged(self):
        r = self.as_user(self.brand).post(self.venue_view(self.venue.id))
        self.assertEqual(r.status_code, 204)
        self.assertEqual(VenueView.objects.filter(venue=self.venue).count(), 0)

    def test_page_views_reflected_in_analytics(self):
        self.as_user(self.visitor).post(self.venue_view(self.venue.id))
        self.as_user(self.visitor).post(self.venue_view(self.venue.id))
        data = self.as_user(self.brand).get(self.venue_analytics(self.venue.id)).json()
        self.assertEqual(data['pageViews'], 2)
        self.assertEqual(data['uniqueVisitors'], 1)  # same visitor twice

    def test_view_log_requires_authentication(self):
        self.assertEqual(self.client.post(self.venue_view(self.venue.id)).status_code, 401)


class SubResourceOwnershipTests(ApiTestCase):
    """Openings and images may only be attached to (or edited on) a venue the
    requester owns — `_require_own_venue` on create, `IsRelatedToVenueOwner` on
    detail."""

    OPENING = '/api/opening/'
    IMG = '/api/imgVenue/'

    def setUp(self):
        super().setUp()
        self.other_brand = make_brand('other-brand@test.io')
        self.other_venue = Venue.objects.create(user=self.other_brand, name_venue='Rival')

    # --- opening create ---
    def test_owner_sets_opening_hours(self):
        r = self.as_user(self.brand).post(
            self.OPENING, {'venue': self.venue.id, 'id_day': 1, 'day': 'Monday', 'is_open': True}, format='json')
        self.assertEqual(r.status_code, 201)

    def test_cannot_set_opening_on_a_foreign_venue(self):
        r = self.as_user(self.brand).post(
            self.OPENING, {'venue': self.other_venue.id, 'id_day': 1, 'day': 'Monday'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_cannot_edit_an_opening_on_a_foreign_venue(self):
        opening = Opening.objects.create(venue=self.other_venue, id_day=1, day='Monday')
        r = self.as_user(self.brand).patch(
            f'{self.OPENING}{opening.id}', {'day': 'Tuesday'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_owner_edits_its_own_opening(self):
        opening = Opening.objects.create(venue=self.venue, id_day=1, day='Monday')
        r = self.as_user(self.brand).patch(
            f'{self.OPENING}{opening.id}', {'day': 'Tuesday'}, format='json')
        self.assertEqual(r.status_code, 200)

    # --- image create (file is optional; the actual field is `file`) ---
    def test_owner_uploads_an_image_row(self):
        r = self.as_user(self.brand).post(
            self.IMG, {'venue': self.venue.id, 'is_principal': True}, format='multipart')
        self.assertEqual(r.status_code, 201)

    def test_cannot_upload_to_a_foreign_venue(self):
        r = self.as_user(self.brand).post(
            self.IMG, {'venue': self.other_venue.id}, format='multipart')
        self.assertEqual(r.status_code, 403)

    def test_cannot_delete_an_image_on_a_foreign_venue(self):
        img = imgVenue.objects.create(venue=self.other_venue)
        r = self.as_user(self.brand).delete(f'{self.IMG}{img.id}')
        self.assertEqual(r.status_code, 403)


class AddressTests(ApiTestCase):
    """Address create geocodes (a network call — mocked here); AddressDetail
    edits are gated to the owner of the venue the address belongs to."""

    ADDRESS = '/api/address/'

    def setUp(self):
        super().setUp()
        self.stranger = make_brand('addr-stranger@test.io')
        self.address = Address.objects.create(address_principal='1 Main', city='Cancún')
        self.venue.address = self.address  # links the reverse `address.venue`
        self.venue.save()

    @patch('intouch.api.views._geocode')
    def test_create_address(self, _geo):
        r = self.as_user(self.brand).post(
            self.ADDRESS, {'address_principal': '2 Side', 'city': 'CDMX'}, format='json')
        self.assertEqual(r.status_code, 201)
        _geo.assert_called_once()

    @patch('intouch.api.views._geocode')
    def test_owner_edits_the_venue_address(self, _geo):
        r = self.as_user(self.brand).patch(
            f'{self.ADDRESS}{self.address.id}', {'city': 'Monterrey'}, format='json')
        self.assertEqual(r.status_code, 200)

    @patch('intouch.api.views._geocode')
    def test_stranger_cannot_edit_the_venue_address(self, _geo):
        r = self.as_user(self.stranger).patch(
            f'{self.ADDRESS}{self.address.id}', {'city': 'Hacked'}, format='json')
        self.assertEqual(r.status_code, 403)

    def test_address_create_requires_authentication(self):
        r = self.client.post(self.ADDRESS, {'city': 'CDMX'}, format='json')
        self.assertEqual(r.status_code, 401)


class FcmTokenTests(ApiTestCase):
    """Saving a device token attaches it to the caller; a token already tied to
    another device row is moved, never duplicated (the unique token constraint)."""

    FCM = '/api/save-fcm-token/'

    def test_saving_attaches_the_token_to_me(self):
        r = self.as_user(self.influencer).patch(self.FCM, {'token': 'device-A'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(FCMToken.objects.get(token='device-A').user_id, self.influencer.id)

    def test_token_is_required(self):
        r = self.as_user(self.influencer).patch(self.FCM, {}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_reused_token_moves_to_the_new_owner(self):
        self.as_user(self.influencer).patch(self.FCM, {'token': 'shared'}, format='json')
        self.as_user(self.brand).patch(self.FCM, {'token': 'shared'}, format='json')
        self.assertEqual(FCMToken.objects.get(token='shared').user_id, self.brand.id)
        self.assertEqual(FCMToken.objects.filter(user=self.influencer).count(), 0)

    def test_fcm_requires_authentication(self):
        r = self.client.patch(self.FCM, {'token': 'x'}, format='json')
        self.assertEqual(r.status_code, 401)


class VenueDiscoveryTests(ApiTestCase):
    """Public discovery lists: distinct cities and the geocoded map, both scoped
    to active venues and behind authentication."""

    CITIES = '/api/venue/cities/'
    MAP = '/api/venue/map/'
    TYPES = '/api/typeVenue/'

    def setUp(self):
        super().setUp()
        addr = Address.objects.create(city='Cancún', latitude=21.16, longitude=-86.85)
        self.venue.address = addr
        self.venue.save()
        # An inactive venue must not surface in either list.
        hidden_addr = Address.objects.create(city='Tulum', latitude=20.2, longitude=-87.4)
        Venue.objects.create(user=self.brand, name_venue='Closed', address=hidden_addr, is_actif=False)

    def test_cities_lists_active_venue_cities(self):
        r = self.as_user(self.influencer).get(self.CITIES)
        self.assertEqual(r.json(), ['Cancún'])

    def test_map_lists_geocoded_active_venues(self):
        r = self.as_user(self.influencer).get(self.MAP)
        names = [v['nameVenue'] for v in r.json()]
        self.assertEqual(names, [self.venue.name_venue])

    def test_type_venue_list(self):
        TypeVenue.objects.create(name='Restaurant')
        r = self.as_user(self.influencer).get(self.TYPES)
        self.assertIn('Restaurant', [t['name'] for t in r.json()])

    def test_cities_requires_authentication(self):
        self.assertEqual(self.client.get(self.CITIES).status_code, 401)

    def test_map_requires_authentication(self):
        self.assertEqual(self.client.get(self.MAP).status_code, 401)
