# AGENTS.md

Guidance for coding agents working in this repository.

## What this app is

A privacy-first desktop app that parses PAGNI-hospital blood-test PDF reports
(Greek-language labels), aggregates results per medical test, and plots each
test's progress over time. **All data stays on the user's machine** — no
network calls, no telemetry.

## Architecture (ports & adapters)

Strict module single-responsibility. Two processes:

### Rust backend (`src-tauri/`)

- `src/parser/` — **pure** parsing. `date.rs` (report date → ISO),
  `results.rs` (regex extraction of value/unit/range), `pdf.rs` (thin
  `pdf-extract` I/O wrapper). Zero framework deps → fully unit-testable.
- `src/aggregate.rs` — **pure** add/remove/clear over `HealthData`.
- `src/domain.rs` — plain JSON-serializable types (ULID `ReportId`,
  `Measurement`, `MedicalReport`, `HealthData`). No `Map`.
- `src/store.rs` — persistence via `tauri-plugin-store` (local JSON).
- `src/commands.rs` — **thin** `#[tauri::command]` wrappers holding app state;
  orchestrate parse → aggregate → persist. No logic here.
- `src/lib.rs` — wiring only.

### Vue frontend (`src/`)

- `domain/` — **pure** TypeScript, zero framework deps: `types.ts`,
  `medical-test.ts` (test catalog code↔Greek label), `health-data.ts`
  (projections/date sorting), `file-validation.ts`. 100% unit-testable.
- `api/tauri-api.ts` — **thin** `invoke()` adapter + `zod` validation; maps
  snake_case wire format → camelCase domain types. Only Tauri-coupled file.
- `stores/health-data.ts` — Pinia store (state/getters/actions); calls `api/`.
- `composables/useLineChart.ts` — owns Chart.js lifecycle on a canvas.
- `components/` — headless + Tailwind, one responsibility each.
- `App.vue` — composition only; no logic.

## Data model

- `ReportId` is a ULID string (never a sequential number — a reused id would
  cross-contaminate results after deletions).
- Tests are keyed by stable `code` (e.g. `"HCT"`); Greek labels live in the
  catalog for display only.
- `Measurement { value, unit, refRange? }` keeps the unit and reference range.
- Dates are ISO-8601 strings (`YYYY-MM-DD`); undated reports sort last.

## TDD workflow (required)

1. Write a failing test first (port from an existing spec when one exists).
2. Minimal implementation to green. 3. Refactor behind green.
4. No module ships without its test file.

- Frontend tests: `pnpm test` (Vitest + @vue/test-utils, jsdom). Mock the
  `api/` layer in store tests; mock `chart.js` in composable tests.
- Rust tests: `pnpm test:rust` (`cargo test`). Pure modules need no mocks.
- Coverage gates (`pnpm test:coverage`): ≥90% on `src/domain/**`.

## Commands

```bash
pnpm dev / pnpm tauri dev   # develop
pnpm test                   # frontend tests
pnpm test:rust              # Rust tests
pnpm lint                   # eslint
pnpm build                  # typecheck + frontend bundle
pnpm tauri build            # platform installers
```

## Conventions

- TypeScript strict + `exactOptionalPropertyTypes`.
- Privacy: keep the CSP locked down; never add remote URLs or network calls.
- Keep the frontend thin: business rules belong in `src/domain/` (TS) or
  `src-tauri/src/parser|aggregate` (Rust), never in components/commands.
- Update this file if you change structure, stack, or workflows.
