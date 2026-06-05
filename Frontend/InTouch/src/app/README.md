# InTouch frontend — application structure

This app is mid-migration from a flat `pages / modal / services / models` layout
to a **feature-first** structure. The target layout below is being introduced
wave by wave; today only `shared/models` is populated.

```
src/app/
  core/        # app-wide singletons: auth, http (interceptors), config, notifications
  shared/
    models/    # domain types + enums (populated — import from 'src/app/shared/models')
    ui/        # reusable presentational components (OnPush): cards, chips, empty states
    util/      # pure helpers (date, http params, etc.)
  features/    # one folder per feature: discovery, offers, applications, venues, profile
               # each owns its pages, feature-local ui, and a signal-based *.store.ts
```

## Migration conventions

- **Models live in `shared/models`.** The legacy `src/app/models/*` files are now
  thin re-export **shims** so existing imports keep working. New code should import
  from `src/app/shared/models`. The shims are removed once all importers are repointed.
- **Ubiquitous language** (in progress): `Deal`/`Contract` → `Offer`,
  `Booking`/`Reservation` → `Application` (accepted → `Collaboration`),
  request state → `ApplicationStatus` enum.
- **State** moves into per-feature signal stores (`features/*/*.store.ts`), replacing
  ad-hoc component state, `ReloadService`, and the `setTimeout` refresh hacks.

See the P1 refactor map for the full wave-by-wave plan.
