"""Deterministic seed for the isolated E2E database (intouch_e2e).

Run by e2e/backend.sh via `manage.py shell < e2e/seed.py`. Wipes the app rows
and recreates the known actors/fixtures the scenarios rely on. Never point this
at a real database — it deletes every non-superuser user, venue, offer,
reservation.

Each journey gets its own offer (and, when needed, its own influencer) so the
scenarios stay order-independent: what one scenario mutates, no other scenario
reads.
"""
from django.utils import timezone

from intouch.api.models import User, Venue, Offer, Reservation, imgVenue

PW = 'E2e-Pass-123!'

Reservation.objects.all().delete()
Offer.objects.all().delete()
Venue.objects.all().delete()
User.objects.filter(is_superuser=False).delete()


def make_user(email, first, last, **flags):
    user = User.objects.create_user(email, first, last, PW)
    user.is_active = True
    for field, value in flags.items():
        setattr(user, field, value)
    user.save()
    return user


def make_influencer(email, first, last):
    return make_user(email, first, last, is_influencer=True,
                     instagram=f'@{first.lower()}', instagram_followers=5000)


def make_offer(name, **extra):
    return Offer.objects.create(venue=venue, name=name, content='Come visit us',
                                conditions='Post one story', tags='food', **extra)


brand = make_user('e2e-brand@intouch.test', 'Bea', 'Brand', is_company=True)
ivy = make_influencer('e2e-influencer@intouch.test', 'Ivy', 'Influ')
noa = make_influencer('e2e-noa@intouch.test', 'Noa', 'Applicant')
mia = make_influencer('e2e-mia@intouch.test', 'Mia', 'Valid')
leo = make_influencer('e2e-leo@intouch.test', 'Leo', 'Ghost')

venue = Venue.objects.create(user=brand, name_venue='E2E Test Venue')
# The influencer calendar template reads venue.imgVenue[0].file — give the
# venue one (empty-file) image row so the card renders on an imageless seed.
imgVenue.objects.create(venue=venue, is_principal=True)

# -2 days, not -1: the calendar buckets by *local* (CET) calendar day while
# the server clock is UTC. Between 22:00 UTC and midnight UTC, "now - 1 day"
# still lands on today's local date and the collaboration shows up in
# "Coming soon" instead of "Last collaborations".
past = timezone.now() - timezone.timedelta(days=2)
future = timezone.now() + timezone.timedelta(days=3)

# One offer per journey:
make_offer('E2E Welcome Offer')                                  # Ivy applies (UI)
make_offer('E2E Gated Offer', min_followers_instagram=10_000)    # follower gate rejects Ivy
accept_offer = make_offer('E2E Accept Offer')                    # brand accepts Noa
post_offer = make_offer('E2E Post Offer')                        # Ivy submits her post link
validate_offer = make_offer('E2E Validate Offer')                # brand validates Mia
noshow_offer = make_offer('E2E NoShow Offer')                    # brand reports Leo
frozen_offer = make_offer('E2E Frozen Offer')                    # frozen by Mia's application
make_offer('E2E Archive Offer')                                  # brand archives it
make_offer('E2E Duplicate Offer')                                # brand duplicates it

Reservation.objects.create(user=noa, offer=accept_offer, status=0, date_reservation=future)
Reservation.objects.create(user=ivy, offer=post_offer, status=1, date_reservation=past)
Reservation.objects.create(user=mia, offer=validate_offer, status=1, date_reservation=past)
Reservation.objects.create(user=leo, offer=noshow_offer, status=1, date_reservation=past)
Reservation.objects.create(user=mia, offer=frozen_offer, status=0, date_reservation=future)

print('e2e seed ready')
