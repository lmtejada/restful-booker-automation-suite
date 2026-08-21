# Defect Log — <Project Name>

**Type:** Functional | Regression | Exploratory <br>
**Priority:** 🔴 High | 🟡 Medium | 🟢 Low <br>
**Automated:** Yes / No <br>
**Test Status:** ⬜ Not run | ✅ Pass | ❌ Fail | ⏭ Skipped | 🚧 Blocked <br>
**Release Recommendation:** ✅ Release / ❌ Do not release / ⚠️ Release with known issues <br>

> Delete this note once filled in. Copy this file to `related/DEFECT-LOG.md` (drop `.template`) when starting a real project. Lives in `related/`, separate from `../TEST-CASES.md`, because a defect log gets updated on its own cadence (as bugs are found/fixed) — bundling it with test case definitions makes both harder to scan. See [../README.md](../README.md) for how all the docs fit together.

---

## Functional & general defects

_Bugs found during test execution. One row per bug, linked to the issue tracker and the TC that pins it down. Keep this separate from accessibility findings (below) — they're a different category and read better in their own table._

| ID      | Title | Severity | Steps to reproduce | Linked TC | Status  |
| ------- | ----- | -------- | ------------------ | --------- | ------- |
| BUG-001 |       |          |                    |           | 🔴 Open |

---

## Accessibility defects

_Scope, tooling, and findings for the automated a11y suite, if one exists. Use an `A11Y-` prefix for these IDs, kept separate from the general defect table above._

### Tooling and approach

<which scanner (e.g. `@axe-core/playwright`), which rule sets, and how a scan is triggered>

### Coverage

| Spec file | States scanned |
| --------- | -------------- |
|           |                |

### Accessibility defect log

| ID       | Title | Impact | Steps to reproduce | Linked TC | Status  |
| -------- | ----- | ------ | ------------------ | --------- | ------- |
| A11Y-001 |       |        |                    |           | 🔴 Open |
