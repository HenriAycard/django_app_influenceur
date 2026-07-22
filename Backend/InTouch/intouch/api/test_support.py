"""Shared fixtures for both test layers.

`tests.py` (fine-grained regression suite) and the Gherkin step definitions
(`features/steps/`) build the same brand / influencer / venue / offer graph,
so the world-building lives here once and is imported by both.
"""
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


def make_brand(email='brand@test.io'):
    return make_user(email, company=True)


def make_influencer(email='influencer@test.io', *, followers=5000):
    return make_user(email, influencer=True, instagram='@flo',
                     instagram_followers=followers)


def make_venue(brand, name='Test Venue'):
    return Venue.objects.create(user=brand, name_venue=name)


def make_offer(venue, *, name='Test Offer', **extra):
    return Offer.objects.create(
        venue=venue, name=name, content='x', conditions='x', tags='x', **extra)


class ApiWorldMixin:
    """The standard brand / influencer / venue / offer graph plus the request
    helpers (`as_user`, `application`) shared by the API tests and the BDD
    step definitions.

    Used both as a `TestCase` base (in `tests.py`) and as a plain state holder
    (in the Gherkin steps): every helper operates on `self`, so the two callers
    build an identical graph.
    """

    def build_world(self):
        self.brand = make_brand()
        self.influencer = make_influencer()
        self.venue = make_venue(self.brand)
        self.offer = make_offer(self.venue)
        self.client = APIClient()

    def as_user(self, user):
        self.client.force_authenticate(user=user)
        return self.client

    def application(self, status=0):
        return Reservation.objects.create(
            user=self.influencer, offer=self.offer, status=status,
            date_reservation=timezone.now() + timezone.timedelta(days=3),
        )
