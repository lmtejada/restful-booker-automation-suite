# Restful Booker API Suite & Contract Testing

An end-to-end API testing suite built against [Restful Booker](https://restful-booker.herokuapp.com/) ([API docs](https://restful-booker.herokuapp.com/apidoc/index.html)), a hotel booking API purpose-built for API testing practice — token-based auth, full CRUD, query filtering, and intentional design flaws that mimic an unpredictable production backend.

This project layers four testing approaches on top of a shared TypeScript/CI foundation: a Postman/Newman collection for fast manual and CLI validation, a Playwright API automation suite for high-coverage CRUD and schema testing, Pact consumer-driven contract tests, and a GitHub Actions pipeline that runs all three and publishes an Allure report.

**Stack:** Postman · Newman · Playwright (`APIRequestContext`) · Pact JS · TypeScript · ESLint + Prettier · Husky + lint-staged + commitlint · GitHub Actions · Allure Report

---

## Project Goals

What this suite is targeting, by deliverable:

| #   | Deliverable                                                                                                                                                                         | Status                                                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Postman Collection & Newman Layer** — organized collection with environment-driven auth token handling, exported to [src/collections/](src/collections/), runnable via Newman CLI | ✅ Collection, environment, and Newman scripts in place                                                                                                                |
| 2   | **Playwright API Automation Suite** — strict TypeScript specs covering auth, full booking CRUD, query filtering, and data-driven field validation, with no browser involved         | ✅ 75 tests across 8 spec files — see [tests/api/](tests/api/) and [docs/3. TEST-CASES.md](docs/3.%20TEST-CASES.md)                                                    |
| 3   | **Pact Consumer Contract Validation** — `@pact-foundation/pact` consumer specs defining expected backend payload shapes, producing a `.json` pact file                              | 🔲 Not started                                                                                                                                                         |
| 4   | **Bugs & Inconsistencies Log** — a QA findings doc cataloguing Restful Booker's intentional design flaws (bad status codes, missing payload constraints, etc.)                      | ✅ 11 confirmed defects in [docs/4. DEFECT-LOG.md](docs/4.%20DEFECT-LOG.md), cross-referenced with test cases and [docs/1. API-OVERVIEW.md](docs/1.%20API-OVERVIEW.md) |
| 5   | **Multi-Stage CI/CD Pipeline** — a single GitHub Actions workflow running Newman, Playwright, and Pact verification, publishing Allure results                                      | 🔲 Still pending — `api-pipeline.yml` exists but is empty; lint/typecheck/smoke and full-suite runs are live via separate workflows (see [CI/CD](#cicd))               |

---

## At a Glance

| Aspect Details      | Description                                                                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Testing layers**  | Postman/Newman collection, Playwright `APIRequestContext` suite (no browser, 75 tests), Pact consumer contracts (not started) — see [Project Goals](#project-goals)                                                                              |
| **CI**              | `on-branch-push.yml` (lint + typecheck + `@smoke`) and `playwright.yml` (full suite) are live; `api-pipeline.yml` (Newman + Playwright + Pact) is scaffolded but empty — see [CI/CD](#cicd)                                                      |
| **Git conventions** | Conventional Commits + `feat/`/`fix/`/`release/`/`epic/` branch prefixes, enforced via Husky hooks (see [Code Quality](#code-quality))                                                                                                           |
| **Path aliases**    | `@pages`, `@fixtures`, `@utils`, `@enums`, `@test-data`, `@app-types` — no relative `../../../` imports                                                                                                                                          |
| **Env config**      | `.env.<name>` files, selected via `ENVIRONMENT` (defaults to `dev`); CI supplies vars through workflow `env:` blocks instead                                                                                                                     |
| **Docs**            | [docs/1. API-OVERVIEW.md](docs/1.%20API-OVERVIEW.md) (app behavior + known-defect catalog), [docs/2. TEST-FRAMEWORK.md](docs/2.%20TEST-FRAMEWORK.md) (suite structure + rationale), [docs/3. TEST-CASES.md](docs/3.%20TEST-CASES.md) (every TC), [docs/4. DEFECT-LOG.md](docs/4.%20DEFECT-LOG.md) (repro steps) — the last three cross-referenced by id |

---

## Getting Started

### Prerequisites

- Node.js `v22.22.3` (see `.nvmrc`; run `nvm use`)

### Setup

```bash
npm install
cp .env.example .env.dev   # fill in API_URL and any credentials the suite needs
```

No `npx playwright install` step — this is an API-only suite (see [At a Glance](#at-a-glance)), so Playwright never launches a browser binary and none need to be downloaded.

Environment files are selected by the `ENVIRONMENT` variable (defaults to `dev`, loading `.env.dev`):

```bash
ENVIRONMENT=staging npx playwright test
```

---

## Folder Structure

```
restful-booker-automation-suite/
├── .github/
│   └── workflows/
│       ├── api-pipeline.yml     # Push/PR: intended to run Newman, Playwright, and Pact (not yet configured)
│       ├── on-branch-push.yml   # Any push: lint + typecheck + @smoke (artifact-only report)
│       ├── playwright.yml       # Push to main: full suite, publishes HTML report history to gh-pages
│       └── pr-summary.yml       # PR opened/updated: third-party bot auto-describes the PR (not a test runner)
├── .husky/
│   ├── pre-commit                # Runs lint-staged before each commit
│   ├── commit-msg                 # Runs commitlint against Conventional Commits format
│   └── pre-push                   # Blocks pushing from a branch without a feat/fix/release/epic prefix
├── reports/                       # All generated test/report output — git-ignored as a whole
│   ├── allure-results/            # Raw Allure result JSON (from allure-playwright, later newman-reporter-allure too)
│   ├── allure-report/             # Static HTML report generated via `allure generate`
│   ├── newman/                    # HTML report from `npm run newman:html`
│   └── test-results/              # Playwright trace/screenshot/video artifacts (outputDir)
├── docs/
│   ├── 1. API-OVERVIEW.md        # What the app does, its data/auth model, known defects, "looks like a bug" log
│   ├── 2. TEST-FRAMEWORK.md      # Suite structure, conventions, and the rationale behind them
│   ├── 3. TEST-CASES.md          # Every test case (TC-001–TC-030), grouped by module, with test data tables
│   └── 4. DEFECT-LOG.md          # Full repro steps for each confirmed defect, cross-linked to TC ids
├── src/
│   ├── collections/
│   │   ├── restful-booker.postman_collection.json  # Postman collection — auth, CRUD, filtering
│   │   ├── environment.json                          # Local environment values (git-ignored)
│   │   └── environment.template.json                 # Template to copy for a new environment
│   ├── contracts/                # Pact consumer/provider specs + generated pact files (not yet created)
│   │   ├── specs/
│   │   └── pacts/
│   ├── enums/                    # Shared enums (empty — add as needed)
│   ├── fixtures/
│   │   └── auth.fixture.ts       # Worker-scoped `authToken` fixture (one login per worker, not per test)
│   ├── pages/                    # Page object models (empty — unused for an API-only suite)
│   ├── types/
│   │   └── app.ts                # `Booking` interface + `Nullable<T>` (negative-test override type)
│   ├── utils/
│   │   ├── auth.ts               # `getAuthToken`, `DEFAULT_CREDENTIALS` (from env vars)
│   │   └── config.ts             # Env var helpers (e.g. getEnv)
│   └── test-data/
│       └── factories/
│           └── booking-data.factory.ts  # `DEFAULT_BOOKING_DATA`, `VALIDATION_SCENARIOS` data table
├── tests/
│   ├── api/
│   │   ├── functional/           # One spec per endpoint (auth, booking create/retrieve/update/delete) +
│   │   │                         # data-driven `booking-validation.spec.ts`
│   │   └── integration/          # Cross-endpoint `booking-crud.spec.ts` lifecycle; `schema-validation.spec.ts`
│   │                             # is a placeholder, not yet implemented
│   └── sanity.spec.ts            # Framework/environment smoke check
├── .env.example                  # Template for required environment variables
├── .env.dev                      # Local env file (git-ignored; copy from .env.example)
├── commitlint.config.js          # Conventional Commits rules, enforced by the commit-msg hook
├── eslint.config.mts             # Flat ESLint config (TypeScript + Playwright + Prettier + import order rules)
├── playwright.config.ts          # Playwright projects, reporters, timeouts, storage state setup
├── tsconfig.json                 # TypeScript compiler options + @alias path mappings
└── package.json                  # Scripts and dependencies
```

**Path aliases:** `@fixtures/*`, `@enums/*`, `@test-data/*`, `@utils/*`, `@pages/*`, `@app-types/*` all resolve to their matching `src/` subfolder — no relative `../../../` imports needed. These work in both Playwright (native `tsconfig.json` support, no extra loader) and ESLint (via `eslint-import-resolver-typescript`).

---

## Available Scripts

| Command                                                     | Description                                                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `npm test`                                                  | Run the full suite                                                                                                       |
| `npm run test:ci`                                           | Single-worker run — not currently wired to any CI workflow; `playwright.yml` runs `npx playwright test` directly instead |
| `npm run test:smoke`                                        | Run tests tagged `@smoke`                                                                                                |
| `npm run test:regression`                                   | Run tests tagged `@regression`                                                                                           |
| `npm run test:api`                                          | Run tests tagged `@api`                                                                                                  |
| `npm run test:issues`                                       | Run tests tagged `@issues` — the known-bug `test.fail()` scenarios documented in `docs/4. DEFECT-LOG.md`                 |
| `npm run test:debug`                                        | Run in Playwright's debug/inspector mode                                                                                 |
| `npm run report`                                            | Open the last HTML report                                                                                                |
| `npm run lint` / `lint:fix`                                 | Lint (and auto-fix) the codebase                                                                                         |
| `npm run typecheck`                                         | Type-check with `tsc --noEmit` (no build output)                                                                         |
| `npm run format`                                            | Format the codebase with Prettier                                                                                        |
| `npm run newman:run`                                        | Run the Postman collection via Newman CLI                                                                                |
| `npm run newman:verbose`                                    | Run with `--verbose` — detailed CLI output, including raw request/response bodies, headers, and cookies for every call   |
| `npm run newman:bail`                                       | Run with `--bail` — stops at the first test failure instead of continuing through the whole collection                   |
| `npm run newman:html`                                       | Run and generate an HTML report via `newman-reporter-htmlextra`, written to `reports/newman/report.html`                 |
| `npm run allure:generate` / `allure:open` / `allure:report` | Generate and/or open the Allure HTML report from `reports/allure-results/`                                               |

This is an API-only suite (no `page`/browser fixture), so there are no per-browser scripts (`test:chromium`, etc.) — every test runs against the single `restful-booker-api` project in `playwright.config.ts`. Tag-based scripts rely on `@tag` annotations passed as a test's/describe's `{ tag: ... }` option, not string suffixes in the title. Newman scripts point at [src/collections/restful-booker.postman_collection.json](src/collections/restful-booker.postman_collection.json) and `src/collections/environment.json` (copy from [environment.template.json](src/collections/environment.template.json) if it doesn't exist locally).

---

## Code Quality

- **ESLint** (`eslint.config.mts`) enforces TypeScript strictness and a set of Playwright best practices — no hard waits (`no-wait-for-timeout`), web-first assertions, no `test.only`/skipped tests, semantic locators over raw/nth-based ones, no `console` usage, an `await`-inside-`expect()` guard, and more.
- **`import-x/order`** alphabetizes and groups every import (builtin → external → internal → relative), with `@fixtures/*` sorted after real third-party packages within the external group.
- **Prettier** enforces consistent formatting (tabs, single quotes, 80-char width).
- **Husky + lint-staged** run ESLint and Prettier on staged files before each commit.
- **commitlint** (`commitlint.config.js`, Conventional Commits) checks every commit message via the `commit-msg` hook; the `pre-push` hook additionally blocks pushing from a branch that isn't prefixed `feat/`, `fix/`, `release/`, or `epic/` (`main` is exempt). The branch-name rule has a server-side backstop via a GitHub repository ruleset — set that up per-repo, since it isn't copied by forking/templating.

## CI/CD

Four workflow files under [.github/workflows/](.github/workflows/):

| File                 | Trigger                                             | Runs                                                                                               | Report destination                                                                                   |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `api-pipeline.yml`   | Push / pull request (planned)                       | Newman, then Playwright, then Pact verification, sequentially — file exists but is currently empty | Allure results published to GitHub Pages (per [Phase 5](#project-goals) of the plan) — not yet built |
| `on-branch-push.yml` | Push, any branch                                    | lint + typecheck, then `test:smoke`                                                                | Artifact only (30-day retention), no Pages deploy                                                    |
| `playwright.yml`     | Push to `main`                                      | Full suite (`npx playwright test`)                                                                 | HTML report published to GitHub Pages (`gh-pages` branch), with run history kept (last 20 runs)      |
| `pr-summary.yml`     | PR opened/reopened/ready-for-review, issue comments | Third-party PR Agent bot (auto-describes PRs) — not a test runner                                  | N/A                                                                                                  |

Update the `env:` blocks in `on-branch-push.yml` and `playwright.yml` with this project's environment variables, and configure the matching repo secrets/variables (Settings → Secrets and variables → Actions) before relying on either workflow.
