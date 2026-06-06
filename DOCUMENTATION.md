# InTouch — Project Documentation

## What is InTouch?

InTouch is an influencer marketplace. **Brands (venues)** post offers; **influencers** browse and reserve them. Both sides have dedicated mobile-first UIs built in Ionic/Angular. Push notifications (Firebase FCM) keep both parties informed.

---

## Infrastructure

### Server
| Property | Value |
|---|---|
| Provider | OVH VPS |
| Hostname | `vps-17211daf.vps.ovh.net` |
| Public IP | `51.75.20.230` |
| OS | Ubuntu |
| User | `ubuntu` |

### Subdomains & Live URLs

| URL | Routes to | Purpose |
|---|---|---|
| `https://frontend.intouch.ovh` | nginx → `127.0.0.1:8100` | Ionic dev server (PM2) |
| `https://backend.intouch.ovh` | nginx → `127.0.0.1:8001` | Django REST API |
| `https://intouch.ovh` | nginx → `127.0.0.1:3100` | (other service on server) |
| `https://holiday.intouch.ovh` | nginx → port 4000/5173 | Holiday Tracker app |
| `https://chat.intouch.ovh` | nginx → `127.0.0.1:4173` | Ollama chat UI |

All HTTPS is terminated by nginx with **Let's Encrypt certificates** (auto-renewed by certbot). Django and the Ionic dev server run as plain HTTP on localhost — nginx handles SSL.

### nginx
- Config files: `/etc/nginx/sites-available/`
- Active sites: `intouch`, `intouch-backend`, `intouch-frontend`, `holiday`, `holiday-tracker`, `ollama`
- Reload: `sudo systemctl reload nginx`

### SSL Certificates
| Domain | Certificate path |
|---|---|
| `intouch.ovh` | `/etc/letsencrypt/live/intouch.ovh/` |
| `backend.intouch.ovh` | `/etc/letsencrypt/live/backend.intouch.ovh/` |
| `frontend.intouch.ovh` | `/etc/letsencrypt/live/frontend.intouch.ovh/` |

---

## Backend

### Stack
- **Python** 3.12
- **Django** 5.0
- **Django REST Framework** with JWT authentication
- **PostgreSQL** (local)
- **Firebase Admin SDK** — FCM push notifications
- **django-filter**, **django-extensions**, **django-cors-headers**

### Location & Commands
```
/home/ubuntu/django_app_influenceur/Backend/InTouch/
```

```bash
# Activate virtualenv
source env/bin/activate

# Run (nginx proxies port 8000 → this)
python manage.py runserver 127.0.0.1:8001

# Migrations
python manage.py migrate
python manage.py makemigrations
```

### Key Configuration — `.env`
```
/home/ubuntu/django_app_influenceur/Backend/InTouch/.env
```
| Variable | Purpose |
|---|---|
| `DJANGO_ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins |
| `DJANGO_SECRET_KEY` | Django secret key |
| `DJANGO_DEBUG` | `True` in current environment |
| `PG_DBNAME` / `PG_USERNAME` | PostgreSQL connection |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account JSON |
| `ENVIRONMENT_NAME` | `prod` |

> **When you add a new frontend URL**, add it to both `CORS_ALLOWED_ORIGINS` and `DJANGO_ALLOWED_HOSTS`, then restart Django.

### Database
- Engine: PostgreSQL
- Database: `intouch`
- User: `ubuntu`
- Host: `localhost`

### Key Django Settings
- `USE_TZ = True` — all datetimes must be timezone-aware
- `SECURE_SSL_REDIRECT = True` + `SECURE_PROXY_SSL_HEADER` — Django knows it's behind nginx HTTPS
- `DEFAULT_PAGINATION_CLASS` = `PageNumberPagination`, `PAGE_SIZE = 20`
- `TypeCompanyView` has `pagination_class = None` (small static reference list)

### API Endpoints

| Endpoint | View | Notes |
|---|---|---|
| `/api/company/` | `CompanyCreateView` | List (paginated) + create |
| `/api/company/{id}/` | `CompanyDetail` | Retrieve / update / delete |
| `/api/company/search/` | `CompanySearchView` | Full-text search (PostgreSQL) |
| `/api/typeCompany/` | `TypeCompanyView` | Category reference list — **not paginated** |
| `/api/offer/` | `OfferCreateView` | List by `?company=<id>` + create |
| `/api/offer/{id}/` | `OfferDetail` | Retrieve / update / delete |
| `/api/reservation/` | `ReservationListCreate` | List (filterable by status, date range) + create |
| `/api/reservation/{id}/` | `ReservationDetail` | Retrieve / update / delete |
| `/api/imgCompany/` | `ImgCompanyListCreateView` | Company images |
| `/api/address/` | `AddressCreate` | Create address |
| `/api/address/{id}/` | `AddressDetail` | Retrieve / update |
| `/api/opening/` | `OpeningCreate` | Create opening hours |
| `/api/opening/{id}/` | `OpeningDetail` | Retrieve / update |
| `/api/fcmtoken/` | `SaveFCMTokenView` | Save device FCM token |

Reservation date filters: `?from_date=YYYY-MM-DD&to_date=YYYY-MM-DD`

### Firebase
- Service account JSON: `/home/ubuntu/intouch-11c77-firebase-adminsdk-fbsvc-ff7d4c4bf7.json`
- Used for: sending push notifications to influencers and brands

---

## Frontend

### Stack
- **Angular 19** — standalone components, signal-based stores
- **Ionic 8** — mobile UI components
- **Capacitor** — native iOS/Android bridge
- **Firebase JS SDK** — FCM foreground notifications

### Location & Commands
```
/home/ubuntu/django_app_influenceur/Frontend/InTouch/
```

```bash
# Dev server (managed by PM2 in production)
ionic serve --host 127.0.0.1 --port 8100 --no-open

# Production build
ionic build --prod
```

### Process Manager — PM2
The Ionic dev server runs permanently via PM2:

```bash
pm2 status                        # see all processes
pm2 logs intouch-frontend         # live logs
pm2 restart intouch-frontend      # restart after code changes
pm2 save                          # persist process list across reboots
```

PM2 is configured to start on system boot via systemd (`pm2-ubuntu.service`).

### Key Config File
```
src/app/config/constant.ts
```
```ts
export const domainConfig = {
  virtual_host: 'https://backend.intouch.ovh/',
  domainApp:    'https://backend.intouch.ovh/',
  staticStorage: 'static/storage/',
  apiPrefix: 'api'
}
```

### Architecture Patterns
- **Standalone components** throughout — no NgModules
- **Signal stores** (`DiscoveryStore`, `VenueStore`) for reactive state
- **JWT** tokens stored client-side; `AuthService` handles login/logout/redirection
- `ApiService` base class extended by all API services
- Paginated API responses are unwrapped via `.pipe(map(r => r.results ?? r))` in services

### User Roles
- **Brand** (`is_influencer = 0`): creates companies, posts offers, manages reservations
- **Influencer** (`is_influencer = 1`): browses venues, reserves offers

### Routing
- `/login` — login page
- `/brand/...` — brand-side routes
- `/influencer/...` — influencer-side routes (tabs)
- `/influencer/home` — discovery feed with category grid + venue cards

### Push Notifications (FCM)
- Permission is requested in `login.page.ts → onSubmit()` (must be inside a user gesture)
- On app init, `app.component.ts` only registers the foreground listener if permission is already granted
- FCM token is sent to `/api/fcmtoken/` after login

---

## Git

| Property | Value |
|---|---|
| Repository | `github.com/HenriAycard/django_app_influenceur` |
| Main branch | `main` |
| Active branch | `feat/influencer-discovery-feed` |

```bash
git push origin feat/influencer-discovery-feed
```

> **Note on npm vulnerabilities:** Do not run `npm audit fix` on this project — it upgrades `@angular/*` packages individually, breaking internal API compatibility. Angular packages must be upgraded together using `ng update`.

---

## Starting Everything After a Reboot

PM2 auto-restarts the frontend on boot. Django does **not** — start it manually:

```bash
cd /home/ubuntu/django_app_influenceur/Backend/InTouch
source env/bin/activate
nohup python manage.py runserver 127.0.0.1:8001 > /tmp/django.log 2>&1 &
```

nginx starts automatically via systemd.
