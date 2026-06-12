from datetime import date
from django.core.management.base import BaseCommand
from intouch.api.models import Offer, Venue

OFFERS = [
    # ── Cancún ────────────────────────────────────────────────────────────────
    {
        "venue_name": "La Habichuela Downtown",
        "name": "Dinner for Two – Garden Table",
        "content": "Full dinner for 2 in the iconic tropical garden: 3-course tasting menu with cochinita pibil, catch-of-the-day seafood and dessert. Includes non-alcoholic beverages and a welcome cocktail.",
        "conditions": "Publish 1 Instagram Reel and 1 Feed post showcasing the ambiance and dishes. Tag @lahabichuela_cancun and use #LaHabichuela #CancunFood. Content must be published within 7 days of the visit.",
        "quantity": 3,
        "tags": "#LaHabichuela #CancunFood #MexicanCuisine #CancunRestaurant",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 9, 30),
        "publishing_deadline": 7,
        "guests": 1,
        "min_followers_instagram": 20000,
        "require_post_proof": True,
        "contact_approver": "Rodrigo Domínguez",
    },

    # ── La Parrilla ──────────────────────────────────────────────────────────
    {
        "venue_name": "La Parrilla Centro",
        "name": "Grilled Dinner + Mariachi Night",
        "content": "Dinner for 2 featuring the full grill menu: tacos al pastor, grilled meats platter and guacamole. Includes 2 drinks and front-row seats to the nightly mariachi show.",
        "conditions": "1 TikTok video and 1 Instagram Reel of the experience (food + mariachi). Tag @laparrilla_cancun. Post within 5 days. Stories allowed but at least one permanent post required.",
        "quantity": 4,
        "tags": "#LaParrilla #CancunVibes #TacoNight #Mariachi",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 10, 31),
        "publishing_deadline": 5,
        "guests": 1,
        "min_followers_instagram": 15000,
        "min_followers_tiktok": 10000,
        "require_post_proof": True,
        "contact_approver": "Patricia Méndez",
    },
    {
        "venue_name": "La Parrilla Zona Hotelera",
        "name": "Beachside Dinner Experience",
        "content": "Dinner for 2 on the Hotel Zone terrace with ocean views: surf & turf combo, guacamole, churros and 2 cocktails of your choice.",
        "conditions": "1 Instagram Reel featuring the ocean view and the food. Tag @laparrilla_cancun and #ZonaHotelera. Publish within 7 days of visit.",
        "quantity": 3,
        "tags": "#LaParrillaHotelZone #CancunBeach #ZonaHotelera #SunsetDinner",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 10, 31),
        "publishing_deadline": 7,
        "guests": 1,
        "min_followers_instagram": 20000,
        "require_post_proof": True,
        "contact_approver": "Patricia Méndez",
    },

    # ── Sip Coffee ───────────────────────────────────────────────────────────
    {
        "venue_name": "Sip Coffee Cancún",
        "name": "Specialty Coffee Tasting Session",
        "content": "Private 45-minute guided tasting of 3 single-origin Mexican coffees (espresso, pour-over and cold brew format) with the head barista. Includes 1 drink of your choice and 2 pastries.",
        "conditions": "1 Instagram Reel or TikTok showing the tasting process and café ambiance. Tag @sipcancun and use #SipCancun #SpecialtyCoffee. Publish within 7 days.",
        "quantity": 5,
        "tags": "#SipCancun #SpecialtyCoffee #CafeCancun #CoffeeLovers",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 12, 31),
        "publishing_deadline": 7,
        "guests": 0,
        "min_followers_instagram": 10000,
        "require_post_proof": True,
        "contact_approver": "Andrea Fuentes",
    },

    # ── Kinan Spa ────────────────────────────────────────────────────────────
    {
        "venue_name": "Kinan Spa",
        "name": "Mayan Ritual Spa Day",
        "content": "Full spa day for 1: 60-min deep tissue or hot stone massage, 45-min chocolate body wrap, access to hydrotherapy circuit (sauna, steam room, cold plunge) and herbal tea service.",
        "conditions": "1 Instagram Reel and 2 Stories documenting the experience (before/after feel). Tag @kinanspa and use #KinanSpa #WellnessCancun. Do not film other guests. Post within 7 days.",
        "quantity": 2,
        "tags": "#KinanSpa #WellnessCancun #MayanRitual #SpaDay",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 10, 31),
        "publishing_deadline": 7,
        "guests": 0,
        "min_followers_instagram": 25000,
        "require_post_proof": True,
        "contact_approver": "Valeria Solís",
    },
    {
        "venue_name": "Kinan Spa",
        "name": "Temazcal Ceremony for Two",
        "content": "Traditional Mayan temazcal (sweat lodge) ceremony for 2, led by a certified shaman. Includes pre-ceremony herbal tea ritual and a post-ceremony light meal.",
        "conditions": "1 Instagram carousel post (3-5 photos) or Reel of the ceremony and setting. Tag @kinanspa. No filming inside the temazcal itself — exterior and preparation scenes only. Post within 10 days.",
        "quantity": 2,
        "tags": "#Temazcal #KinanSpa #MayanHealing #CancunWellness",
        "start_date": date(2026, 7, 1),
        "end_date": date(2026, 11, 30),
        "publishing_deadline": 10,
        "guests": 1,
        "min_followers_instagram": 30000,
        "require_post_proof": True,
        "contact_approver": "Valeria Solís",
    },

    # ── Mexico City ───────────────────────────────────────────────────────────
    {
        "venue_name": "Contramar",
        "name": "Signature Seafood Lunch for Two",
        "content": "Lunch for 2 featuring Contramar's iconic dishes: tuna tostadas, tuna al pastor, one main seafood course and dessert. Includes 2 glasses of house white wine.",
        "conditions": "1 high-quality Instagram Reel or carousel (min 4 photos) of the dishes and dining room. Tag @contramarmx and use #Contramar #RomaNorte. Content must feel authentic, not overly commercial. Publish within 7 days.",
        "quantity": 2,
        "tags": "#Contramar #RomaNorte #CDMXFood #SeafoodMexico",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 9, 30),
        "publishing_deadline": 7,
        "guests": 1,
        "min_followers_instagram": 50000,
        "require_post_proof": True,
        "contact_approver": "Gabriela Cámara",
    },

    # ── Buna 47 ───────────────────────────────────────────────────────────────
    {
        "venue_name": "Buna 47 Polanco",
        "name": "Morning Coffee Content Session",
        "content": "Private 1-hour morning session (before opening) for photo/video content creation in the café. Includes a full coffee menu tasting (espresso, cortado, filter) and 2 pastries.",
        "conditions": "1 Instagram Reel and 1 Feed post featuring the café space and coffee. Tag @buna47 and use #Buna47 #PolancoVibes. Publish within 5 days. Story swipe-up with location tag required if over 10k followers.",
        "quantity": 3,
        "tags": "#Buna47 #Polanco #CDMXCoffee #SpecialtyCoffee",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 12, 31),
        "publishing_deadline": 5,
        "guests": 0,
        "min_followers_instagram": 15000,
        "require_post_proof": True,
        "contact_approver": "Ignacio Parra",
    },
    {
        "venue_name": "Buna 47 Roma Norte",
        "name": "Brunch & Coffee Experience",
        "content": "Brunch for 2 on the Roma Norte terrace: full brunch menu (avocado toast, eggs, granola bowl) plus 2 specialty coffees and 1 fresh juice each.",
        "conditions": "1 TikTok or Instagram Reel of the brunch and terrace. Tag @buna47. Use #Buna47Roma #CDMXBrunch. Publish within 7 days of visit.",
        "quantity": 3,
        "tags": "#Buna47Roma #CDMXBrunch #RomaNorte #BrunchMexico",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 12, 31),
        "publishing_deadline": 7,
        "guests": 1,
        "min_followers_instagram": 15000,
        "require_post_proof": True,
        "contact_approver": "Ignacio Parra",
    },

    # ── Hotel Carlota ─────────────────────────────────────────────────────────
    {
        "venue_name": "Hotel Carlota",
        "name": "One-Night Stay + Rooftop Pool Access",
        "content": "1-night stay in a Superior room, full access to the iconic rooftop pool, complimentary breakfast for 2 at the in-house restaurant, and a welcome drink on arrival.",
        "conditions": "1 Instagram Reel (min 30s) showcasing the hotel design, room and rooftop pool. 1 Feed post. Tag @hotelcarlota. Use #HotelCarlota #CDMXHotel. Publish within 7 days. Collab tag required.",
        "quantity": 2,
        "tags": "#HotelCarlota #CDMXHotel #BoutiqueHotel #MexicoCityDesign",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 11, 30),
        "publishing_deadline": 7,
        "guests": 1,
        "min_followers_instagram": 40000,
        "require_post_proof": True,
        "contact_approver": "Tomás Arriaga",
    },
    {
        "venue_name": "Hotel Carlota",
        "name": "Pool Day Pass + Lunch",
        "content": "Full-day rooftop pool access for 2, including a 2-course lunch at the poolside restaurant and 2 cocktails.",
        "conditions": "3 Instagram Stories (location tagged) + 1 Reel or Feed post. Tag @hotelcarlota and use #HotelCarlota. Publish within 5 days.",
        "quantity": 3,
        "tags": "#HotelCarlota #PoolDay #CDMXLifestyle #MexicoCityHotel",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 10, 31),
        "publishing_deadline": 5,
        "guests": 1,
        "min_followers_instagram": 20000,
        "require_post_proof": True,
        "contact_approver": "Tomás Arriaga",
    },

    # ── OMR Gallery ───────────────────────────────────────────────────────────
    {
        "venue_name": "OMR Gallery",
        "name": "Private Opening Night + Curator Tour",
        "content": "2 invitations to the next private exhibition opening, including a 30-min guided tour with the gallery curator before the public preview, wine and canapés.",
        "conditions": "1 Instagram carousel (min 5 photos of the artworks and opening atmosphere). Tag @omrgallery and the featured artist if applicable. Use #OMRGallery #ContemporaryArt #CDMXArt. Publish within 3 days of the opening.",
        "quantity": 3,
        "tags": "#OMRGallery #ContemporaryArt #CDMXArt #ArteMexicano",
        "start_date": date(2026, 7, 1),
        "end_date": date(2026, 12, 31),
        "publishing_deadline": 3,
        "guests": 1,
        "min_followers_instagram": 20000,
        "require_post_proof": True,
        "contact_approver": "Pablo Ortiz Monasterio",
    },

    # ── Coqueta Boutique ──────────────────────────────────────────────────────
    {
        "venue_name": "Coqueta Boutique Roma",
        "name": "Personal Styling Session + MXN 1,500 Gift Card",
        "content": "60-minute one-on-one styling session with the boutique's in-house stylist. Try-on of the current collection and a MXN 1,500 store credit to keep a piece of your choice.",
        "conditions": "1 Instagram Reel and 1 Feed post (outfit of the day format). Tag @coquetastore and the brand of any featured item. Use #CoquetaStore #MexicanFashion #RomaNorte. Publish within 5 days of visit.",
        "quantity": 4,
        "tags": "#CoquetaStore #MexicanFashion #RomaNorte #OOTD",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 12, 31),
        "publishing_deadline": 5,
        "guests": 0,
        "min_followers_instagram": 15000,
        "require_post_proof": True,
        "contact_approver": "Daniela Ríos",
    },

    # ── Monterrey ─────────────────────────────────────────────────────────────
    {
        "venue_name": "El Rey del Cabrito Centro",
        "name": "Traditional Norteño Dinner for Two",
        "content": "Dinner for 2 at the legendary original location: whole roasted cabrito (half portion), machacado con huevo starter, frijoles charros, tortillas de maíz and 2 beers or aguas frescas.",
        "conditions": "1 Instagram Reel and 1 Feed post showing the cabrito and the restaurant atmosphere. Tag @reydelcabrito. Use #ReyDelCabrito #Monterrey #CabritoMTY. Publish within 7 days.",
        "quantity": 3,
        "tags": "#ReyDelCabrito #Monterrey #CabritoMTY #ComidasNorteñas",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 10, 31),
        "publishing_deadline": 7,
        "guests": 1,
        "min_followers_instagram": 15000,
        "require_post_proof": True,
        "contact_approver": "Jorge Garza",
    },
    {
        "venue_name": "El Rey del Cabrito San Pedro",
        "name": "Business Lunch Experience",
        "content": "Lunch for 2 at the San Pedro branch: cabrito taco platter, queso fundido, guacamole and 2 drinks. Complimentary dessert included.",
        "conditions": "1 Instagram post or Reel. Tag @reydelcabrito. Use #ReyDelCabrito #SanPedroGG. Publish within 7 days.",
        "quantity": 3,
        "tags": "#ReyDelCabrito #SanPedroGG #MonterreyFood #ComidasNorteñas",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 10, 31),
        "publishing_deadline": 7,
        "guests": 1,
        "min_followers_instagram": 10000,
        "require_post_proof": True,
        "contact_approver": "Jorge Garza",
    },

    # ── Gordo Coffee ──────────────────────────────────────────────────────────
    {
        "venue_name": "Gordo Coffee",
        "name": "Behind the Roast – Coffee Experience",
        "content": "1-hour behind-the-scenes roastery visit with the head roaster: see the roasting process, cup 4 single-origin coffees and take home a 250g bag of fresh-roasted beans.",
        "conditions": "1 TikTok or Reel (min 30s) of the roastery visit and cupping session. Tag @gordocoffee. Use #GordoCoffee #MonterreyCafe #SpecialtyCoffee. Publish within 5 days.",
        "quantity": 4,
        "tags": "#GordoCoffee #MonterreyCafe #SpecialtyCoffee #CafeMexicano",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 12, 31),
        "publishing_deadline": 5,
        "guests": 0,
        "min_followers_instagram": 10000,
        "require_post_proof": True,
        "contact_approver": "Fernanda Leal",
    },

    # ── CrossFit Regio ────────────────────────────────────────────────────────
    {
        "venue_name": "CrossFit Regio",
        "name": "1-Month Unlimited Membership + WOD Session",
        "content": "1 full calendar month of unlimited CrossFit classes plus a personalised 1-on-1 WOD (Workout of the Day) session with a certified coach to introduce the programme.",
        "conditions": "1 Instagram Reel of a class or training session. 1 Feed post (before/after or transformation angle). Tag @crossfitregio. Use #CrossFitRegio #MTYFit #MonterreyFitness. Publish within 10 days of the first session.",
        "quantity": 3,
        "tags": "#CrossFitRegio #MTYFit #MonterreyFitness #CrossFit",
        "start_date": date(2026, 6, 15),
        "end_date": date(2026, 12, 31),
        "publishing_deadline": 10,
        "guests": 0,
        "min_followers_instagram": 10000,
        "require_post_proof": True,
        "contact_approver": "Eduardo Treviño",
    },
]


class Command(BaseCommand):
    help = "Seed offers for all seeded venues"

    def handle(self, *args, **options):
        created = 0
        skipped = 0

        for o in OFFERS:
            venue = Venue.objects.filter(name_venue=o["venue_name"]).first()
            if not venue:
                self.stderr.write(f"  venue not found: {o['venue_name']}")
                skipped += 1
                continue

            if Offer.objects.filter(venue=venue, name=o["name"]).exists():
                self.stdout.write(f"  skip (exists): {o['name']}")
                skipped += 1
                continue

            Offer.objects.create(
                venue=venue,
                name=o["name"],
                start_date=o.get("start_date", date.today()),
                end_date=o.get("end_date"),
                content=o["content"],
                conditions=o["conditions"],
                quantity=o.get("quantity"),
                tags=o.get("tags", ""),
                publishing_deadline=o.get("publishing_deadline"),
                guests=o.get("guests"),
                contact_approver=o.get("contact_approver", ""),
                min_followers_instagram=o.get("min_followers_instagram"),
                min_followers_tiktok=o.get("min_followers_tiktok"),
                min_followers_youtube=o.get("min_followers_youtube"),
                require_post_proof=o.get("require_post_proof", False),
            )
            created += 1
            self.stdout.write(f"  offer: {o['name']} → {o['venue_name']}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone — {created} offers created, {skipped} skipped."
        ))
