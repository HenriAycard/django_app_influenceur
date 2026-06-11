"""API authorization and validation tests.

These lock in the security batch of 2026-06-10 (role-bound transitions,
venue-ownership guards, read-only role flags) and the application rules
(active-duplicate prevention, follower gate, clean 400s on bad input).

Run with: python manage.py test intouch.api
"""
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Offer, Reservation, User, Venue


def make_user(email, *, influencer=False, company=False, **extra):
    user = User.objects.create_user(email, 'Test', 'User', 'Str0ng-Pass-42!')
    user.is_active = True
    user.is_influencer = influencer
    user.is_company = company
    for field, value in extra.items():
        setattr(user, field, value)
    user.save()
    return user


@override_settings(SECURE_SSL_REDIRECT=False)  # the test client speaks plain http
class ApiTestCase(TestCase):
    def setUp(self):
        cache.clear()  # throttle counters live in the cache
        self.brand = make_user('brand@test.io', company=True)
        self.influencer = make_user('influencer@test.io', influencer=True,
                                    instagram='@flo', instagram_followers=5000)
        self.venue = Venue.objects.create(user=self.brand, name_venue='Test Venue')
        self.offer = Offer.objects.create(
            venue=self.venue, name='Test Offer', content='x', conditions='x', tags='x',
        )
        self.client = APIClient()

    def as_user(self, user):
        self.client.force_authenticate(user=user)
        return self.client

    def application(self, status=0):
        return Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=status,
            date_reservation=timezone.now() + timezone.timedelta(days=3),
        )


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
