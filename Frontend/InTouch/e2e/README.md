# E2E tests (Playwright + playwright-bdd)

End-to-end scenarios that drive the **real Ionic UI** against a **real Django
backend**, written in Gherkin (`.feature`) like the backend BDD suite.

## How it works

Everything runs locally and isolated — nothing touches production:

- **Backend**: `e2e/backend.sh` creates/migrates/seeds a dedicated `intouch_e2e`
  Postgres database and serves it over HTTPS on `127.0.0.1:8010` (self-signed
  cert already in `Backend/InTouch/`, so `SECURE_SSL_REDIRECT` is satisfied
  without a settings change). Seed data: `e2e/seed.py`.
- **Frontend**: `ng serve` on `127.0.0.1:8110`. The app is pointed at the local
  backend by `e2e/steps/fixtures.ts`, which sets `window.__API_BASE__` before
  the app boots (`src/app/config/constant.ts` reads it, falling back to the
  deployed backend for normal builds).
- Playwright's `webServer` starts the frontend automatically (or reuses a local
  `ng serve`), and **always boots a fresh backend** so `intouch_e2e` is re-seeded
  to a known slate every run — scenarios that write (apply, register) stay
  idempotent. Ports `8010`/`8110` are dedicated so they never collide with the
  live services on the VPS (`:8001` gunicorn, `:8100` PM2 ng serve).

## Run

From `Frontend/InTouch/`:

```bash
# one-time: install the browser (downloads Chromium to ~/.cache)
npx playwright install chromium

npm run e2e
```

`npm run e2e` regenerates the test files from the `.feature` files (`bddgen`)
then runs them. Playwright boots the two servers on first run (first `ng serve`
compile takes a while — the webServer timeout allows for it).

## Scenarios

- `login.feature` — influencer and brand sign in and land on their role home
- `registration.feature` — an influencer applies for an account
- `application.feature` — an influencer browses from the feed to an offer and applies
- `brand_venue.feature` — a brand sees an offer listed on its venue

## Layout

- `features/*.feature` — scenarios in Gherkin
- `steps/*.ts` — step definitions (`fixtures.ts` wires the `__API_BASE__` seam,
  `helpers.ts` holds the seeded actors + `signIn`)
- `backend.sh` / `seed.py` — the isolated E2E backend
- `playwright.config.ts` — servers, ports, timeouts

## Not in CI yet

Kept out of CI for now (needs Postgres + a browser + two servers). Stabilise
locally first; wire into a dedicated CI job later.
