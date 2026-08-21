# Playwright Automation Scaffold

A starting point for Playwright + TypeScript test automation projects. Clone or use this repo as a GitHub template, then customize it for your application — the tooling, folder structure, and conventions are already wired up so you can start writing tests on day one.

**Stack:** Playwright · TypeScript · ESLint + Prettier · Husky + lint-staged + commitlint · GitHub Actions

---

## At a Glance

| Aspect Details      | Description                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Browsers**        | Chromium enabled by default; Firefox/WebKit projects included but commented out                                                                                                       |
| **CI**              | 3 workflows — sanity check (lint/typecheck/`@smoke`) on every push, full suite + published report on push to `main`, PR auto-description bot                                          |
| **Git conventions** | Conventional Commits + `feat/`/`fix/`/`release/`/`epic/` branch prefixes, enforced via Husky hooks (see [Code Quality](#code-quality))                                                |
| **Path aliases**    | `@pages`, `@fixtures`, `@utils`, `@enums`, `@test-data`, `@app-types` — no relative `../../../` imports                                                                               |
| **Docs**            | `docs/` — strategy, framework conventions, test cases; living logs (defects, exploratory sessions, run history) split into `docs/related/`. Start at [docs/README.md](docs/README.md) |
| **Env config**      | `.env.<name>` files, selected via `ENVIRONMENT` (defaults to `dev`); CI supplies vars through workflow `env:` blocks instead                                                          |

---

## Using this as a scaffold

To start a new project from this repo:

1. Click **"Use this template"** on GitHub (or clone it and re-init git: `rm -rf .git && git init`). Note: forking/templating does **not** carry over branch protection rules, repo secrets/variables, or GitHub rulesets — those live in repo settings, not the git tree, and need to be recreated manually (see step 8).
2. Update `package.json` — set `name`, `description`, and `author` for the new project.
3. Update `.env.example` with the environment variables your app actually needs, then run `cp .env.example .env.dev` and fill in real values. `.env.dev` is git-ignored on purpose — it never leaves your machine.
4. Replace [tests/auth.setup.ts](tests/auth.setup.ts) with your app's real login flow (or delete the `setup` project in [playwright.config.ts](playwright.config.ts) if the app doesn't need pre-authenticated state). Update [tests/sanity.spec.ts](tests/sanity.spec.ts) once you've done that — it's currently a trivial framework smoke check with no real assertions.
5. Rename the alias targets in `tsconfig.json`'s `paths` block (`@fixtures`, `@enums`, `@pages`, etc.) only if you change the `src/` folder layout — otherwise leave them as-is and start filling in `src/pages`, `src/fixtures`, `src/types`, and `src/test-data/factories` (currently placeholders).
6. Set `APP_URL` and uncomment `baseURL` in [playwright.config.ts](playwright.config.ts) if your tests should use relative URLs. Uncomment the `firefox`/`webkit` projects there too if you need cross-browser coverage — they ship commented out.
7. Update the `env:` blocks in all three workflows under [.github/workflows/](.github/workflows/) to match your renamed environment variables, and configure the corresponding repo secrets/variables (Settings → Secrets and variables → Actions).
8. Recreate the branch-name ruleset in the new repo's Settings → Rules → Rulesets (target all branches, exclude `main`/`feat/**`/`fix/**`/`release/**`/`epic/**`, enable **Restrict creations**) — this is the server-side backstop for the [`pre-push`](.husky/pre-push) hook (client-side hooks are bypassable with `--no-verify` or a clone that never ran `npm install`), and it isn't copied by forking/templating.
9. Copy each `.template.md` file under [docs/](docs/) (including `docs/related/`) to drop the `.template` suffix (e.g. `TEST-PLAN.template.md` → `TEST-PLAN.md`) and fill them in for your project. Rename `APP-OVERVIEW.template.md` to something specific to your app. See [docs/README.md](docs/README.md) for what each doc is for and the suggested reading order.

Everything else — linting, formatting, import ordering, git hooks (commit message + branch name conventions), tagging scripts, and CI — works out of the box.

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
playwright-scaffold/
├── .github/
│   └── workflows/
│       ├── on-branch-push.yml   # Any push: lint + typecheck + @smoke (artifact-only report)
│       ├── playwright.yml       # Push to main: full suite, publishes HTML report history to gh-pages
│       └── pr-summary.yml       # PR opened/updated: third-party bot auto-describes the PR (not a test runner)
├── .husky/
│   ├── pre-commit                # Runs lint-staged before each commit
│   ├── commit-msg                 # Runs commitlint against Conventional Commits format
│   └── pre-push                   # Blocks pushing from a branch without a feat/fix/release/epic prefix
├── docs/
│   ├── README.md                          # Doc map — what to read, in what order
│   ├── TEST-PLAN.template.md              # Strategy, risk register, CI/CD gating, entry/exit criteria
│   ├── TEST-FRAMEWORK.template.md         # Structure, conventions, the append-only decision log
│   ├── TEST-CASES.template.md             # TC-XXX shape
│   ├── APP-OVERVIEW.template.md           # App-under-test field guide
│   └── related/                               # Living records, updated as the suite runs
│       ├── DEFECT-LOG.template.md             # Functional + accessibility defects
│       ├── EXPLORATORY-SESSIONS.template.md   # Unscripted session logs
│       └── TEST-EXECUTION-SUMMARY.template.md # Pass/fail counts per run
├── src/
│   ├── enums/
│   │   └── app.ts                # Shared enums (e.g. StorageStatePaths for auth state files)
│   ├── fixtures/                 # Custom Playwright fixtures (empty — add as needed)
│   ├── pages/                    # Page object models (empty — add as needed)
│   ├── types/                    # Shared TypeScript types (empty — add as needed)
│   ├── utils/
│   │   └── config.ts             # Env var helpers (e.g. getEnv)
│   └── test-data/
│       ├── factories/            # Dynamic test data builders (empty — add as needed)
│       └── static/
│           └── users.json        # Static test data (user personas, credentials, etc.)
├── tests/
│   ├── api/                      # API tests (empty — add as needed)
│   ├── e2e/                      # End-to-end tests (empty — add as needed)
│   ├── functional/               # Functional tests (empty — add as needed)
│   ├── auth.setup.ts             # Example login/storage-state setup — replace for your app
│   └── sanity.spec.ts            # Framework smoke check — no real assertions yet, update alongside auth.setup.ts
├── .env.example                  # Template for required environment variables
├── .env.dev                      # Local env file (git-ignored; copy from .env.example)
├── commitlint.config.js          # Conventional Commits rules, enforced by the commit-msg hook
├── eslint.config.mts             # Flat ESLint config (TypeScript + Playwright + Prettier + import order rules)
├── playwright.config.ts          # Playwright projects, reporters, timeouts, storage state setup
├── tsconfig.json                 # TypeScript compiler options + @alias path mappings (see docs/TEST-FRAMEWORK.template.md §3)
└── package.json                  # Scripts and dependencies
```

**Path aliases:** `@fixtures/*`, `@enums/*`, `@test-data/*`, `@utils/*`, `@pages/*`, `@app-types/*` all resolve to their matching `src/` subfolder — no relative `../../../` imports needed. These work in both Playwright (native `tsconfig.json` support, no extra loader) and ESLint (via `eslint-import-resolver-typescript`).

---

## Documentation

Everything under `docs/` is a `.template.md` file — copy it, drop the `.template` suffix, and fill it in for the real project. Start at [docs/README.md](docs/README.md) for what each doc is for and the suggested reading order; the short version:

- **Core docs** (`docs/`) — written once, revised occasionally: `APP-OVERVIEW`, `TEST-PLAN`, `TEST-FRAMEWORK`, `TEST-CASES`.
- **Logs** (`docs/related/`) — living records updated continuously as the suite runs: `DEFECT-LOG`, `EXPLORATORY-SESSIONS`, `TEST-EXECUTION-SUMMARY`. Kept in their own subfolder so the core docs stay easy to scan at a glance.

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

Tag-based scripts rely on `@tag` annotations in test titles (e.g. `test('... @smoke', ...)`), which will be added as specs are written.

---

## Code Quality

- **ESLint** (`eslint.config.mts`) enforces TypeScript strictness and a set of Playwright best practices — no hard waits (`no-wait-for-timeout`), web-first assertions, no `test.only`/skipped tests, semantic locators over raw/nth-based ones, no `console` usage, an `await`-inside-`expect()` guard, and more.
- **`import-x/order`** alphabetizes and groups every import (builtin → external → internal → relative), with `@fixtures/*` sorted after real third-party packages within the external group.
- **Prettier** enforces consistent formatting (tabs, single quotes, 80-char width).
- **Husky + lint-staged** run ESLint and Prettier on staged files before each commit.
- **commitlint** (`commitlint.config.js`, Conventional Commits) checks every commit message via the `commit-msg` hook; the `pre-push` hook additionally blocks pushing from a branch that isn't prefixed `feat/`, `fix/`, `release/`, or `epic/` (`main` is exempt). The branch-name rule has a server-side backstop via a GitHub repository ruleset — set that up per-repo, since it isn't copied by forking/templating (see step 8 above).

## CI/CD

Three workflow files, each owning a distinct trigger:

| File                 | Trigger                                             | Runs                                                              | Report destination                                                                              |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `on-branch-push.yml` | Push, any branch                                    | lint + typecheck, then `test:smoke`                               | Artifact only (30-day retention), no Pages deploy                                               |
| `playwright.yml`     | Push to `main`                                      | Full suite (`npx playwright test`)                                | HTML report published to GitHub Pages (`gh-pages` branch), with run history kept (last 20 runs) |
| `pr-summary.yml`     | PR opened/reopened/ready-for-review, issue comments | Third-party PR Agent bot (auto-describes PRs) — not a test runner | N/A                                                                                             |

Update the `env:` blocks in `on-branch-push.yml` and `playwright.yml` with your project's environment variables, and configure the matching repo secrets/variables (Settings → Secrets and variables → Actions) before relying on either workflow.
