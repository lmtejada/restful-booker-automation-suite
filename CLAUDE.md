# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                          # setup (Node v22.22.3 — see .nvmrc)
cp .env.example .env.dev             # then fill in API_URL, ADMIN_USERNAME, ADMIN_PASSWORD

npx playwright test                  # run the whole suite
npx playwright test path/to.spec.ts  # run a single file
npx playwright test -g "test title"  # run by title substring
npm run test:smoke                   # --grep @smoke
npm run test:regression              # --grep @regression
npm run test:api                     # --grep @api
npm run test:issues                  # --grep @issues (known-bug tests, see below)
npm run test:integration             # --grep @integration (cross-endpoint serial flows)
npm run test:ci                      # single-worker run

npm run lint / lint:fix
npm run typecheck                    # tsc --noEmit
npm run format                       # prettier --write .

npm run newman:run                   # run the Postman collection via Newman CLI
npm run allure:report                # generate + open the Allure report
```

There is no build step and no browser install — this is an API-only Playwright suite (`request` fixture, `APIRequestContext`), so `npx playwright install` is never needed.

Always run `lint`, `typecheck`, and the relevant spec file(s) after touching `src/` or `tests/` — CI (`on-branch-push.yml`) gates on lint + typecheck + `@smoke` on every push, and `api-pipeline.yml` runs Newman, then the full Playwright suite, then generates and publishes an Allure report, on push to `main`.

## Architecture

### Target: a shared, mutating public API

All tests hit the live public instance at `https://restful-booker.herokuapp.com` (no local server, no per-run reset). Because it's shared with everyone else practicing against it, booking ids and total counts drift constantly between runs from other people's concurrent activity. Tests are written to check for the presence of a just-created fixture (`toContain(fixtureBookingId)`), never absolute counts or fixed ids — follow that pattern for any new test that needs to verify a record exists.

### The known-bug pattern (central to this codebase)

Restful Booker has real, confirmed defects (see `docs/4. DEFECT-LOG.md`). Rather than skip or weaken assertions around them, tests assert the **correct** expected behavior and wrap the call in `test.fail(true, 'Known bug — see docs/4. DEFECT-LOG.md (BUG-XXX)')`. This keeps the suite green (a `test.fail()` test failing is itself a "pass") while keeping the assertion honest — if the bug is ever fixed upstream, that test starts unexpectedly passing, which is the signal to flip `knownBug` back off (or delete the `test.fail()` wrapper) and update the defect log entry's status.

When adding a new test that exposes API misbehavior:

1. Verify actual behavior first (a quick `curl` against the real endpoint), don't assume.
2. Assert the behavior a well-built API _should_ have, not the buggy one.
3. Wrap in `test.fail()` with a comment pointing at the `BUG-XXX` id.
4. Add/extend the defect entry in `docs/4. DEFECT-LOG.md`.
5. Add/extend the corresponding `TC-XXX` entry in `docs/3. TEST-CASES.md`.

These three docs cross-reference each other by id (`DEFECT-LOG`'s "Linked TC" column names `TC-XXX`, and TC entries' "Actual result"/"Notes" name `BUG-XXX`) — keep that sync intact when editing any of them. `docs/1. API-OVERVIEW.md` §5 ("Looks like a bug, isn't a bug") is the other half of this: behaviors that looked suspicious but were investigated and confirmed as intentional/correct — check there before assuming something new is a defect.

### Data-driven field validation

`src/test-data/factories/booking-data.factory.ts` exports `VALIDATION_SCENARIOS`, an array of `{ description, overrides, expectedStatus, knownBug? }`. `tests/api/functional/booking-validation.spec.ts` splits this into known-bug vs. valid scenarios and loops over each into its own `test()` — this is how ~20 field-level edge cases (missing/null/wrong-type/wrong-range values) stay in one small file instead of one test function per case. Add a new field-validation scenario here rather than writing a standalone test, unless it needs an assertion shape the loop can't express (e.g. checking a response header, or a raw malformed request body) — those live as individual tests in the relevant endpoint's spec file instead (see `booking-create.spec.ts` for examples: malformed JSON syntax, a fully absent body, extra-field handling).

### API clients: Service Object pattern

`src/clients/booking.client.ts` (`BookingClient`) and `src/clients/auth.client.ts` (`AuthClient`) wrap every call to `/booking` and `/auth`. Don't call `request.post('/booking', ...)` or hardcode an endpoint path in a new test — go through the client. Each client exposes two kinds of method:

- A typed, semantic method for the common case: `create(data: Booking)`, `getAll`/`getById`, `update`/`partialUpdate`/`delete` (all take an optional `authToken`), `login(credentials)`. These build headers for you and only accept well-formed data.
- A matching `*WithOptions` escape hatch (`createWithOptions`, `updateWithOptions`, `partialUpdateWithOptions`, `loginWithOptions`) that takes a raw Playwright request-options object. Reach for this whenever a test needs something a typed method can't express: malformed JSON, an XML body, a custom or combined header set (Basic Auth, a fake `Authorization` alongside a valid `Cookie`), an empty `{}` payload, or extra fields that would fail TypeScript's excess-property check on the typed signature.

A GET request testing an endpoint that only makes sense as a resource path (e.g. asserting `GET /auth` isn't supported) doesn't belong on `AuthClient` — that one case still uses the raw `request` fixture with the `AUTH_PATH`/`BOOKING_PATH` constants from `src/utils/constants.ts`, so the path string still isn't duplicated.

### Fixture composition: mergeTests, not one big file

`src/fixtures/index.fixture.ts` is the fixture import for every spec (`import { test, expect } from '@fixtures/index.fixture'`). It combines two independently-defined fixture files with Playwright's `mergeTests`, neither of which imports the other:

- `src/fixtures/api-clients.fixture.ts` — test-scoped `bookingClient`/`authClient`.
- `src/fixtures/auth.fixture.ts` — the worker-scoped `authToken` (see below).

Fixtures resolve lazily regardless of how they were composed: a test that only destructures `{ bookingClient }` never triggers the `/auth` call `authToken` would make, even though both come from the same merged `test`. When adding a new fixture, prefer a new file merged in here over extending an existing fixture file directly — it keeps each fixture's concern independent and avoids one file depending on another's internals.

### Auth: worker-scoped fixture, not per-test

`src/fixtures/auth.fixture.ts` extends Playwright's `test`/`expect` with a worker-scoped `authToken` fixture that authenticates once per worker (via its own `APIRequestContext`, independent of the per-test `request` fixture) and retries once on failure. Specs that need auth (`booking-update.spec.ts`, `booking-delete.spec.ts`) destructure `authToken` alongside `bookingClient` from the shared `@fixtures/index.fixture` import. Don't call `POST /auth` directly in a new test unless you have a reason to bypass the shared token or `AuthClient`.

Credentials (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) come from env vars everywhere — never hardcode in a spec.

### Test folder layout

- `tests/api/functional/` — one spec file per endpoint (`auth`, `booking-create`, `booking-retrieve`, `booking-update`, `booking-delete`) plus the data-driven `booking-validation` spec above.
- `tests/api/integration/` — cross-endpoint flows: `booking-crud.spec.ts` is a `test.describe.serial` end-to-end lifecycle (auth → create → read → update → delete) sharing state across its 5 steps; `schema-validation.spec.ts` is a placeholder, not yet implemented.
- `tests/sanity.spec.ts` — framework/environment smoke check, tagged `@smoke` at the describe level (separate from the per-endpoint `[Smoke]`-prefixed tests, which are tagged `@smoke` individually).

### Conventions worth knowing before adding a test

- Path aliases (`@fixtures/*`, `@clients/*`, `@utils/*`, `@test-data/*`, `@app-types/*`, `@enums/*`, `@pages/*`) resolve to `src/*` subfolders — no relative `../../../` imports.
- Tags (`@smoke`, `@regression`, `@api`, `@issues`, `@integration`) map to `npm run test:*` scripts via `--grep`; a test can carry multiple (`{ tag: ['@api', '@regression'] }`).
- `Nullable<T>` (`src/types/app.ts`) is the override type for negative-test payloads (every field also accepts `null`/`undefined`); `generateBookingData()`'s param type is widened to `Nullable<Booking> | Record<string, unknown>` to also allow deliberately wrong-typed values (e.g. `totalprice: 'one-hundred'`) for type-validation scenarios.
- ESLint enforces explicit function return types, import ordering/grouping, no hard waits, web-first assertions, and no `console`/`test.only` — run `npm run lint` before considering a change done.

### Writing documentation

Keep everything under `docs/` and in `README.md` simple and scannable:

- Use short sentences and plain words. Avoid fancy vocabulary.
- One idea per line or bullet. Don't stack clauses.
- Short paragraphs. Long walls of text are hard to scan.
- Prefer a table or bullet list over a paragraph when comparing options or values.
- Avoid jargon words like "idempotent" or "inert." Use an everyday word instead (e.g. "safe to repeat," "harmless").

The goal: someone skimming the doc for 10 seconds should find what they need.
