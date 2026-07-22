"""API authorization and validation tests.

These lock in the security batch of 2026-06-10 (role-bound transitions,
venue-ownership guards, read-only role flags) and the application rules
(active-duplicate prevention, follower gate, clean 400s on bad input).

Run with: python manage.py test intouch.api
"""
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone

from .models import Offer, Reservation, User
from .test_support import ApiWorldMixin, make_user


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
