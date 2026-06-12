import json
from pathlib import Path
from django.core.management.base import BaseCommand
from intouch.api.models import User, Venue, Address, TypeVenue


class Command(BaseCommand):
    help = "Import seed data from seed_data.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--json",
            default=str(Path(__file__).resolve().parents[6] / "seed_data.json"),
            help="Path to the JSON seed file",
        )

    def handle(self, *args, **options):
        path = Path(options["json"])
        if not path.exists():
            self.stderr.write(f"File not found: {path}")
            return

        data = json.loads(path.read_text())

        created_companies = 0
        created_venues = 0
        created_influencers = 0

        for company in data.get("companies", []):
            email = company["email"]
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"  skip (exists): {email}")
                continue

            user = User.objects.create_user(
                email=email,
                firstname=company["firstname"],
                lastname=company["lastname"],
                password=company["password"],
            )
            user.is_company = True
            user.is_active = company.get("is_active", True)
            user.save()
            created_companies += 1
            self.stdout.write(f"  company: {email}")

            for v in company.get("venues", []):
                type_venue = TypeVenue.objects.filter(id=v["type_venue_id"]).first()

                addr_data = v.get("address", {})
                address = Address.objects.create(
                    address_principal=addr_data.get("address_principal", ""),
                    address_secondary=addr_data.get("address_secondary", ""),
                    city=addr_data.get("city", ""),
                    state=addr_data.get("state", ""),
                    country=addr_data.get("country", "Mexico"),
                    zip_code=addr_data.get("zip_code", "00000"),
                    latitude=addr_data.get("latitude"),
                    longitude=addr_data.get("longitude"),
                )

                Venue.objects.create(
                    user=user,
                    name_venue=v["name_venue"],
                    type_venue=type_venue,
                    is_takeaway=v.get("is_takeaway", False),
                    is_onsit=v.get("is_onsit", True),
                    description=v.get("description", ""),
                    instagram=v.get("instagram", ""),
                    tiktok=v.get("tiktok", ""),
                    facebook=v.get("facebook", ""),
                    address=address,
                    is_actif=True,
                )
                created_venues += 1
                self.stdout.write(f"    venue: {v['name_venue']}")

        for inf in data.get("influencers", []):
            email = inf["email"]
            if User.objects.filter(email=email).exists():
                self.stdout.write(f"  skip (exists): {email}")
                continue

            user = User.objects.create_user(
                email=email,
                firstname=inf["firstname"],
                lastname=inf["lastname"],
                password=inf["password"],
            )
            user.is_influencer = True
            user.is_active = inf.get("is_active", True)
            user.instagram = inf.get("instagram", "")
            user.instagram_followers = inf.get("instagram_followers")
            user.tiktok = inf.get("tiktok", "")
            user.tiktok_followers = inf.get("tiktok_followers")
            user.save()
            created_influencers += 1
            self.stdout.write(f"  influencer: {email}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone — {created_companies} companies, {created_venues} venues, {created_influencers} influencers created."
        ))
