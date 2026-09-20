# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm start            # Dev server (ionic serve with live reload) on http://localhost:8100
ionic build --prod    # Production build (output: www/browser/)
firebase deploy       # Deploy www/browser to Hosting, plus Firestore rules and indexes
```

`pnpm build` runs plain `ng build` with no configuration. Use `ionic build --prod` for anything you deploy.

`pnpm test` runs vitest through `@angular/build:unit-test`; `pnpm lint` uses `eslint.config.js` (flat config). Both pass — treat a failure as something your change caused.

Tests cover pure logic only (`CsvTools`, date helpers, the trip-origin logic, presence and address-history reports, CSV import). There are no component tests, so anything touching Firestore or Ionic still needs `ionic build --prod` plus a look in the dev server.

## Architecture

This is a personal data-journaling **hybrid mobile app** (web + mobile) built with **Angular 22 + Ionic 9 + Firebase**.

### Tech Stack
- **Angular** (NgModule-based, not standalone) with lazy-loaded feature modules, bootstrapped via `bootstrapModule(AppModule)`
- **Ionic** for mobile UI components and native-like navigation. `IonicModule` is imported from `@ionic/angular/lazy`, which is deprecated; a future Ionic major will require a standalone migration
- **Firebase** (Auth + Firestore) as the backend — all user data is stored under `users/{userId}/` Firestore collections
- **AngularFire** (`@angular/fire`) — the data services use the **compat** API (`@angular/fire/compat/firestore`, `AngularFirestore`); `AuthService` uses the modular API (`@angular/fire/auth`). `AppModule` initializes both
- **Highcharts** (`highcharts-angular`) for blood-result data visualization
- **Google Maps / Google Places** (`@angular/google-maps`) for trip map views and location autocomplete

### Module / Feature Map

| Route | Module | Purpose |
|-------|--------|---------|
| `/trips` | `trips/` | Travel records — list, add, edit |
| `/addresses` | `addresses/` | Historical address records |
| `/bloodresults` | `bloodresults/` | Health metrics — CRUD + Highcharts charts |
| `/map` | `trips-mapchart/` | Geographic map view of trips |
| `/reports` | `reports/` | Time-away totals, address-history gaps/overlaps, range and full-backup exports |
| `/auth` | `auth/` | Login / signup / password reset (email + social providers) |

Shared utilities live in `common/` (CSV read/write, date helpers, string tools, `StateProvider`, and `UserCollectionService`, the base class every per-user Firestore collection extends).
The `autocomplete/` and `places/` modules provide location autocomplete backed by Google Places.

### Routing & Auth Guards
- Default route redirects to `/trips`
- The signed-in user's id and email are cached in `localStorage` under `user` (see `auth/stored-user.ts`); Firebase keeps the real credentials in its own storage. Guards read that cache; **services do not** — they take the uid from `afAuth.authState`
- **HomeGuard** (`guard/home.guard.ts`) redirects to `/auth/login` when no user is cached. It guards `trips/list`, `addresses/list`, `/bloodresults`, `/map` and `/reports`
- **AuthGuard** (`auth/auth.guard.ts`) guards the `/auth/*` pages and redirects already-logged-in users to `/trips`
- All feature modules are lazy-loaded with `PreloadAllModules` strategy

### Service Pattern
`TripsService`, `AddressService` and `BioService` all extend `UserCollectionService<T>` (`common/user-collection.service.ts`), which owns the shared behaviour:
- One stable `BehaviorSubject` and an observable that is never reassigned
- One live Firestore `snapshotChanges()` listener, replaced on refresh
- The user id comes from `afAuth.authState`, so a logout or account switch re-queries; nothing is held while signed out
- `search()` filters what is already loaded rather than re-querying

A subclass supplies only its collection path, sort field, document mapping (`toRecord`) and search rule (`matches`).

Other services: `AuthService`, `BioMetadataService`, `CsvTools` (static utility).

### Build Outputs & Environments
- Build output: `www/browser/` (this is Firebase Hosting's `public` dir). Never commit `www/`
- Environment files `src/environments/environment.ts` and `environment.prod.ts` are gitignored and exist only locally. They hold the Firebase config
- Firebase project: `trips-journal-1` (see `.firebaserc`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`)
- Bundle budget: 2 MB warning / 5 MB error for initial chunk

## Dependencies

- Package manager is pnpm, pinned via `packageManager` in `package.json`; pnpm switches to that version automatically. Always run pnpm with `CI=true` in non-interactive shells
- pnpm settings live in `pnpm-workspace.yaml`, not `package.json`: `overrides`, `allowBuilds`/`onlyBuiltDependencies`, `peerDependencyRules`, `minimumReleaseAgeExclude`
- Transitive-dependency CVE fixes are `>=X` floors in `overrides`. pnpm won't re-resolve a package that already satisfies its floor, so when an audit flags one, raise the floor. Bound it below the next major (`'>=X <N'`) when that major would break the parent
- **TypeScript is pinned** to whatever `@angular/compiler-cli`'s `peerDependencies.typescript` allows (currently `>=6.0 <6.1`, so `6.0.3`). `ncu -u` ignores this and proposes TS 7, which breaks `ionic serve`/`build`
- `@angular/fire` is `21.0.0-rc.0` and declares Angular 21 peers, so `pnpm install` reports unmet peers against Angular 22. This is expected and harmless
- The routine update flow is the `/update-deps` skill (`ncu -u` → install → serve → build → commit → deploy)
