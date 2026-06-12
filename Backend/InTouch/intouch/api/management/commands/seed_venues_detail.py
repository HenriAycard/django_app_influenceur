import os
import time
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from intouch.api.models import Venue, imgVenue, Opening

# (id_day 0=Monday … 6=Sunday)
DAYS = [
    (0, "Monday"),
    (1, "Tuesday"),
    (2, "Wednesday"),
    (3, "Thursday"),
    (4, "Friday"),
    (5, "Saturday"),
    (6, "Sunday"),
]

def schedule(open_h, close_h, *, closed_days=(), break_start="", break_end=""):
    """Return a 7-entry list of day dicts."""
    rows = []
    for id_day, day in DAYS:
        is_closed = id_day in closed_days
        rows.append({
            "id_day": id_day,
            "day": day,
            "is_open": not is_closed,
            "open_hour":   "" if is_closed else open_h,
            "close_hour":  "" if is_closed else close_h,
            "break_start": "" if is_closed else break_start,
            "break_end":   "" if is_closed else break_end,
        })
    return rows


# ── Opening schedules per venue ──────────────────────────────────────────────
SCHEDULES = {
    # Restaurants — closed Monday, lunch break
    "La Habichuela Downtown":       schedule("13:00", "23:00", closed_days=(0,), break_start="16:00", break_end="18:30"),
    "La Parrilla Centro":           schedule("12:00", "23:30", closed_days=()),
    "La Parrilla Zona Hotelera":    schedule("12:00", "23:30", closed_days=()),
    "Contramar":                    schedule("13:00", "18:00", closed_days=(0,)),  # lunch only, closed Mon
    "El Rey del Cabrito Centro":    schedule("12:00", "22:00", closed_days=(0,)),
    "El Rey del Cabrito San Pedro": schedule("12:00", "22:00", closed_days=(0,)),

    # Coffee shops — 7 days
    "Sip Coffee Cancún":  schedule("07:30", "21:00", closed_days=()),
    "Buna 47 Polanco":    schedule("08:00", "21:00", closed_days=(6,)),  # closed Sunday
    "Buna 47 Roma Norte": schedule("08:00", "21:00", closed_days=()),
    "Gordo Coffee":       schedule("08:00", "20:00", closed_days=(6,)),

    # Spa — closed Monday
    "Kinan Spa": schedule("09:00", "20:00", closed_days=(0,)),

    # Hotel — 24/7
    "Hotel Carlota": schedule("00:00", "23:59", closed_days=()),

    # Art Gallery — closed Monday & Sunday
    "OMR Gallery": schedule("10:00", "19:00", closed_days=(0, 6)),

    # Clothing store — closed Monday
    "Coqueta Boutique Roma": schedule("10:30", "20:00", closed_days=(0,)),

    # Fitness center — 7 days, shorter Sunday
    "CrossFit Regio": [
        {"id_day": 0, "day": "Monday",    "is_open": True, "open_hour": "06:00", "close_hour": "22:00", "break_start": "", "break_end": ""},
        {"id_day": 1, "day": "Tuesday",   "is_open": True, "open_hour": "06:00", "close_hour": "22:00", "break_start": "", "break_end": ""},
        {"id_day": 2, "day": "Wednesday", "is_open": True, "open_hour": "06:00", "close_hour": "22:00", "break_start": "", "break_end": ""},
        {"id_day": 3, "day": "Thursday",  "is_open": True, "open_hour": "06:00", "close_hour": "22:00", "break_start": "", "break_end": ""},
        {"id_day": 4, "day": "Friday",    "is_open": True, "open_hour": "06:00", "close_hour": "22:00", "break_start": "", "break_end": ""},
        {"id_day": 5, "day": "Saturday",  "is_open": True, "open_hour": "08:00", "close_hour": "14:00", "break_start": "", "break_end": ""},
        {"id_day": 6, "day": "Sunday",    "is_open": True, "open_hour": "08:00", "close_hour": "12:00", "break_start": "", "break_end": ""},
    ],
}

# ── Images per venue: (keyword_for_loremflickr, lock_int) ───────────────────
IMAGES = {
    "La Habichuela Downtown": [
        ("restaurant,tropical,garden,mexico", 11),
        ("mexican,food,dinner,plate",         12),
    ],
    "La Parrilla Centro": [
        ("mexican,grill,taco,restaurant",     21),
        ("mariachi,restaurant,mexico,night",  22),
    ],
    "La Parrilla Zona Hotelera": [
        ("beach,terrace,restaurant,cancun",   31),
        ("seafood,grill,tropical,food",       32),
    ],
    "Sip Coffee Cancún": [
        ("specialty,coffee,cafe,barista",     41),
        ("coffee,latte,art,cup",              42),
    ],
    "Kinan Spa": [
        ("spa,massage,wellness,relax",        51),
        ("temazcal,steam,ritual,wellness",    52),
    ],
    "Contramar": [
        ("seafood,restaurant,tuna,mexico",    61),
        ("fish,tostada,plate,elegant",        62),
    ],
    "Buna 47 Polanco": [
        ("coffee,specialty,modern,cafe",      71),
        ("espresso,barista,coffeeshop",       72),
    ],
    "Buna 47 Roma Norte": [
        ("cafe,terrace,plants,brunch",        81),
        ("coffee,pastry,morning,cozy",        82),
    ],
    "Hotel Carlota": [
        ("boutique,hotel,rooftop,pool",       91),
        ("modern,hotel,design,room",          92),
    ],
    "OMR Gallery": [
        ("art,gallery,contemporary,exhibit", 101),
        ("painting,installation,museum,art", 102),
    ],
    "Coqueta Boutique Roma": [
        ("fashion,boutique,clothing,store",  111),
        ("dress,style,women,fashion",        112),
    ],
    "El Rey del Cabrito Centro": [
        ("grill,roasted,meat,mexican",       121),
        ("restaurant,norteño,dinner,mexico", 122),
    ],
    "El Rey del Cabrito San Pedro": [
        ("restaurant,modern,grill,lunch",    131),
        ("cabrito,mexican,food,plate",       132),
    ],
    "Gordo Coffee": [
        ("coffee,roastery,beans,specialty",  141),
        ("coffeeshop,brew,filter,barista",   142),
    ],
    "CrossFit Regio": [
        ("crossfit,gym,workout,fitness",     151),
        ("barbell,training,athlete,box",     152),
    ],
}


def download_image(keywords, lock):
    url = f"https://loremflickr.com/900/600/{keywords}?lock={lock}"
    resp = requests.get(url, timeout=20, allow_redirects=True)
    resp.raise_for_status()
    content_type = resp.headers.get("content-type", "image/jpeg")
    ext = "jpg" if "jpeg" in content_type or "jpg" in content_type else "png"
    return resp.content, ext


class Command(BaseCommand):
    help = "Add opening hours and photos to all seeded venues"

    def handle(self, *args, **options):
        venues = Venue.objects.filter(
            name_venue__in=list(SCHEDULES.keys())
        ).select_related("user")

        for venue in venues:
            name = venue.name_venue
            self._seed_schedule(venue, name)
            self._seed_images(venue, name)

        self.stdout.write(self.style.SUCCESS("\nDone."))

    # ── Opening hours ─────────────────────────────────────────────────────────
    def _seed_schedule(self, venue, name):
        if Opening.objects.filter(venue=venue).exists():
            self.stdout.write(f"  schedule skip (exists): {name}")
            return

        days = SCHEDULES.get(name, [])
        for d in days:
            Opening.objects.create(
                venue=venue,
                id_day=d["id_day"],
                day=d["day"],
                is_open=d["is_open"],
                open_hour=d["open_hour"],
                close_hour=d["close_hour"],
                break_start=d["break_start"],
                break_end=d["break_end"],
            )
        self.stdout.write(f"  schedule OK: {name}")

    # ── Images ────────────────────────────────────────────────────────────────
    def _seed_images(self, venue, name):
        if imgVenue.objects.filter(venue=venue).exists():
            self.stdout.write(f"  images  skip (exists): {name}")
            return

        specs = IMAGES.get(name, [])
        for i, (keywords, lock) in enumerate(specs):
            is_principal = (i == 0)
            try:
                content, ext = download_image(keywords, lock)
                filename = f"seed_{venue.id}_{lock}.{ext}"
                img = imgVenue(venue=venue, is_principal=is_principal)
                img.file.save(filename, ContentFile(content), save=True)
                self.stdout.write(f"  image   OK: {name} [{lock}]")
                time.sleep(0.5)  # be polite to the API
            except Exception as e:
                self.stderr.write(f"  image  ERR: {name} [{lock}] — {e}")
