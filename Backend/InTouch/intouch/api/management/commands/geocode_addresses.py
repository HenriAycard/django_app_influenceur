import time
from django.core.management.base import BaseCommand
from intouch.api.models import Address
from intouch.api.views import _geocode


class Command(BaseCommand):
    help = 'Geocode all addresses that are missing lat/lng (calls Nominatim, rate-limited to 1 req/s).'

    def add_arguments(self, parser):
        parser.add_argument('--force', action='store_true',
                            help='Re-geocode even addresses that already have coordinates.')

    def handle(self, *args, **options):
        qs = Address.objects.filter(venue__isnull=False)
        if not options['force']:
            qs = qs.filter(latitude__isnull=True)

        total = qs.count()
        self.stdout.write(f'Geocoding {total} address(es)…')
        ok = 0
        for addr in qs.iterator():
            _geocode(addr)
            if addr.latitude is not None:
                addr.save(update_fields=['latitude', 'longitude'])
                ok += 1
            time.sleep(1)  # Nominatim rate limit: 1 req/s

        self.stdout.write(self.style.SUCCESS(f'Done: {ok}/{total} geocoded.'))
