# Restful Booker API Suite & Contract Testing

An end-to-end API testing suite built against [Restful Booker](https://restful-booker.herokuapp.com/) ([API docs](https://restful-booker.herokuapp.com/apidoc/index.html)), a hotel booking API purpose-built for API testing practice — token-based auth, full CRUD, query filtering, and intentional design flaws that mimic an unpredictable production backend.

This project layers four testing approaches on top of a shared TypeScript/CI foundation: a Postman/Newman collection for fast manual and CLI validation, a Playwright API automation suite for high-coverage CRUD and schema testing, Pact consumer-driven contract tests, and a GitHub Actions pipeline that runs all three and publishes an Allure report.

**Stack:** Postman · Newman · Playwright (`APIRequestContext`) · Pact JS · TypeScript · ESLint + Prettier · Husky + lint-staged + commitlint · GitHub Actions · Allure Report

---

## Project Goals

What this suite is targeting, by deliverable:

| #   | Deliverable                                                                                                                                                                         | Status                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | **Postman Collection & Newman Layer** — organized collection with environment-driven auth token handling, exported to [src/collections/](src/collections/), runnable via Newman CLI | ✅ Collection, environment, and Newman scripts in place |
| 2   | **Playwright API Automation Suite** — ~20-25 strict TypeScript specs covering full CRUD lifecycles, JSON schema validation (`ajv`), and cookie-based auth, with no browser involved | 🔲 Not started                                          |
| 3   | **Pact Consumer Contract Validation** — `@pact-foundation/pact` consumer specs defining expected backend payload shapes, producing a `.json` pact file                              | 🔲 Not started                                          |
| 4   | **Bugs & Inconsistencies Log** — a QA findings doc cataloguing Restful Booker's intentional design flaws (bad status codes, missing payload constraints, etc.)                      | 🔲 Not started                                          |
| 5   | **Multi-Stage CI/CD Pipeline** — a single GitHub Actions workflow running Newman, Playwright, and Pact verification, publishing Allure results                                      | 🔲 Workflow file scaffolded, not yet configured         |

---

## At a Glance

| Aspect Details      | Description                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Testing layers**  | Postman/Newman collection, Playwright `APIRequestContext` suite (no browser), Pact consumer contracts — see [Project Goals](#project-goals)   |
| **CI**              | `api-pipeline.yml` — intended to run Newman, Playwright, and Pact verification on push/PR, then publish an Allure report (not yet configured) |
| **Git conventions** | Conventional Commits + `feat/`/`fix/`/`release/`/`epic/` branch prefixes, enforced via Husky hooks (see [Code Quality](#code-quality))        |
| **Path aliases**    | `@pages`, `@fixtures`, `@utils`, `@enums`, `@test-data`, `@app-types` — no relative `../../../` imports                                       |
| **Env config**      | `.env.<name>` files, selected via `ENVIRONMENT` (defaults to `dev`); CI supplies vars through workflow `env:` blocks instead                  |

---

## Getting Started

### Prerequisites

- Node.js `v22.22.3` (see `.nvmrc`; run `nvm use`)

### Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env.dev   # fill in APP_URL, API_URL, and user/admin credentials
```

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
├── contracts/                    # Pact consumer specs + generated pact files (not yet created)
│   ├── specs/
│   └── pacts/
├── reports/                       # Generated Newman/Allure output (git-ignored)
├── src/
│   ├── collections/
│   │   ├── restful-booker.postman_collection.json  # Postman collection — auth, CRUD, filtering
│   │   ├── environment.json                          # Local environment values (git-ignored)
│   │   └── environment.template.json                 # Template to copy for a new environment
│   ├── enums/
│   │   └── app.ts                # Shared enums (e.g. StorageStatePaths for auth state files)
│   ├── fixtures/                 # Custom Playwright fixtures (empty — add as needed)
│   ├── pages/                    # Page object models (empty — likely unused for an API-only suite)
│   ├── types/                    # Shared TypeScript types (empty — add as needed)
│   ├── utils/
│   │   └── config.ts             # Env var helpers (e.g. getEnv)
│   └── test-data/
│       ├── factories/            # Dynamic test data builders (empty — add as needed)
│       └── static/
│           └── users.json        # Static test data
├── tests/
│   ├── api/                      # Playwright API specs (auth, booking CRUD, schema validation) — empty, next up
│   ├── e2e/                      # Not used for this project
│   ├── functional/               # Not used for this project
│   ├── auth.setup.ts             # Example login/storage-state setup — likely unneeded for a stateless API suite
│   └── sanity.spec.ts            # Framework smoke check — no real assertions yet
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

| Command                                                  | Description                                                                                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                               | Run the full suite across all configured projects                                                                                                       |
| `npm run test:chromium` / `test:firefox` / `test:webkit` | Run against a single browser (excludes `@destructive` tests) — firefox/webkit need their commented-out projects in `playwright.config.ts` enabled first |
| `npm run test:ci`                                        | Single-worker Chromium run — not currently wired to any CI workflow; `playwright.yml` runs `npx playwright test` directly instead                       |
| `npm run test:smoke` / `test:sanity` / `test:regression` | Run tests tagged `@smoke`, `@sanity`, or `@regression`                                                                                                  |
| `npm run test:api` / `test:e2e`                          | Run tests tagged `@api` or `@e2e`                                                                                                                       |
| `npm run test:destructive`                               | Run tests tagged `@destructive` (single worker)                                                                                                         |
| `npm run test:debug`                                     | Run in Playwright's debug/inspector mode                                                                                                                |
| `npm run test:ui`                                        | Run with Playwright's UI mode                                                                                                                           |
| `npm run test:headed`                                    | Run headed (excludes `@destructive` tests)                                                                                                              |
| `npm run report`                                         | Open the last HTML report                                                                                                                               |
| `npm run lint` / `lint:fix`                              | Lint (and auto-fix) the codebase                                                                                                                        |
| `npm run typecheck`                                      | Type-check with `tsc --noEmit` (no build output)                                                                                                        |
| `npm run format`                                         | Format the codebase with Prettier                                                                                                                       |
| `npm run newman:run`                                     | Run the Postman collection via Newman CLI                                                                                                               |
| `npm run newman:verbose`                                 | Run with `--verbose` — detailed CLI output, including raw request/response bodies, headers, and cookies for every call                                  |
| `npm run newman:bail`                                    | Run with `--bail` — stops at the first test failure instead of continuing through the whole collection                                                  |
| `npm run newman:html`                                    | Run and generate an HTML report via `newman-reporter-htmlextra`, written to `reports/newman/report.html`                                                |

Tag-based scripts rely on `@tag` annotations in test titles (e.g. `test('... @smoke', ...)`), which will be added as specs are written. Newman scripts point at [src/collections/restful-booker.postman_collection.json](src/collections/restful-booker.postman_collection.json) and `src/collections/environment.json` (copy from [environment.template.json](src/collections/environment.template.json) if it doesn't exist locally).

---

## Code Quality

- **ESLint** (`eslint.config.mts`) enforces TypeScript strictness and a set of Playwright best practices — no hard waits (`no-wait-for-timeout`), web-first assertions, no `test.only`/skipped tests, semantic locators over raw/nth-based ones, no `console` usage, an `await`-inside-`expect()` guard, and more.
- **`import-x/order`** alphabetizes and groups every import (builtin → external → internal → relative), with `@fixtures/*` sorted after real third-party packages within the external group.
- **Prettier** enforces consistent formatting (tabs, single quotes, 80-char width).
- **Husky + lint-staged** run ESLint and Prettier on staged files before each commit.
- **commitlint** (`commitlint.config.js`, Conventional Commits) checks every commit message via the `commit-msg` hook; the `pre-push` hook additionally blocks pushing from a branch that isn't prefixed `feat/`, `fix/`, `release/`, or `epic/` (`main` is exempt). The branch-name rule has a server-side backstop via a GitHub repository ruleset — set that up per-repo, since it isn't copied by forking/templating (see step 8 above).

## CI/CD

Four workflow files under [.github/workflows/](.github/workflows/):

| File                 | Trigger                                             | Runs                                                                                               | Report destination                                                                                   |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `api-pipeline.yml`   | Push / pull request (planned)                       | Newman, then Playwright, then Pact verification, sequentially — file exists but is currently empty | Allure results published to GitHub Pages (per [Phase 5](#project-goals) of the plan) — not yet built |
| `on-branch-push.yml` | Push, any branch                                    | lint + typecheck, then `test:smoke`                                                                | Artifact only (30-day retention), no Pages deploy                                                    |
| `playwright.yml`     | Push to `main`                                      | Full suite (`npx playwright test`)                                                                 | HTML report published to GitHub Pages (`gh-pages` branch), with run history kept (last 20 runs)      |
| `pr-summary.yml`     | PR opened/reopened/ready-for-review, issue comments | Third-party PR Agent bot (auto-describes PRs) — not a test runner                                  | N/A                                                                                                  |

Update the `env:` blocks in `on-branch-push.yml` and `playwright.yml` with this project's environment variables, and configure the matching repo secrets/variables (Settings → Secrets and variables → Actions) before relying on either workflow.
