"""Deterministic seed for the isolated E2E database (intouch_e2e).

Run by e2e/backend.sh via `manage.py shell < e2e/seed.py`. Wipes the app rows
and recreates the known actors the scenarios sign in as. Never point this at a
real database — it deletes every non-superuser user, venue, offer, reservation.
"""
from intouch.api.models import User, Venue, Offer, Reservation

PW = 'E2e-Pass-123!'

Reservation.objects.all().delete()
Offer.objects.all().delete()
Venue.objects.all().delete()
User.objects.filter(is_superuser=False).delete()


def make(email, first, last, **flags):
    user = User.objects.create_user(email, first, last, PW)
    user.is_active = True
    for field, value in flags.items():
        setattr(user, field, value)
    user.save()
    return user


brand = make('e2e-brand@intouch.test', 'Bea', 'Brand', is_company=True)
make('e2e-influencer@intouch.test', 'Ivy', 'Influ',
     is_influencer=True, instagram='@ivy', instagram_followers=5000)
venue = Venue.objects.create(user=brand, name_venue='E2E Test Venue')
Offer.objects.create(venue=venue, name='E2E Welcome Offer',
                     content='Come visit us', conditions='Post one story', tags='food')

print('e2e seed ready')
