# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start        # Start dev server (ionic serve with live reload)
pnpm build        # Production build (output: www/)
pnpm test         # Run unit tests (Karma)
pnpm lint         # Run ESLint
pnpm e2e          # Run end-to-end tests (Protractor)
```

Single test file: `pnpm ng test --include='**/foo.spec.ts'`

## Architecture

This is a personal data-journaling **hybrid mobile app** (web + mobile) built with **Angular + Ionic 8 + Firebase**.

### Tech Stack
- **Angular** (standalone-free, NgModule-based) with lazy-loaded feature modules
- **Ionic** for mobile UI components and native-like navigation
- **Firebase** (Auth + Firestore) as the backend — all user data is stored under `users/{userId}/` Firestore collections
- **AngularFire** (`@angular/fire`) for reactive Firestore bindings
- **Highcharts** (`highcharts-angular`) for blood-result data visualization
- **Google Maps / Google Places** (`@angular/google-maps`) for trip map views and location autocomplete

### Module / Feature Map

| Route | Module | Purpose |
|-------|--------|---------|
| `/trips` | `trips/` | Travel records — list, add, edit |
| `/addresses` | `addresses/` | Historical address records |
| `/bloodresults` | `bloodresults/` | Health metrics — CRUD + Highcharts charts |
| `/map` | `trips-mapchart/` | Geographic map view of trips |
| `/auth` | `auth/` | Login / signup / password reset (email + social providers) |

Shared utilities live in `common/` (CSV export, string tools).
The `autocomplete/` and `places/` modules provide location autocomplete backed by Google Places.

### Routing & Auth Guards
- Default route redirects to `/trips`
- **HomeGuard** (`guard/home.guard.ts`) protects authenticated routes; reads user from localStorage
- **AuthGuard** currently always returns `true` (effectively disabled)
- All feature modules are lazy-loaded with `PreloadAllModules` strategy

### Service Pattern
Services follow a consistent reactive pattern:
- `BehaviorSubject` for local state
- Firestore `snapshotChanges()` for real-time sync
- User-scoped queries: data always filtered by authenticated `userId`

Key services: `AuthService`, `TripsService`, `AddressService`, `BioService`, `BioMetadataService`, `CsvTools` (static utility).

### Build Outputs & Environments
- Build output: `www/`
- Environment files: `src/environments/environment.ts` (dev) and `environment.prod.ts` (prod, not committed)
- Firebase project: `trips-journal-1` (see `.firebaserc`, `firebase.json`, `firestore.rules`)
- Bundle budget: 2 MB warning / 5 MB error for initial chunk
