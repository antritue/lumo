# ADR-0006: Biome + typecheck + CI gates

- **Status:** Accepted
- **Date:** 2025-12-31
- **Commits/PRs:** #6 (ESLint → Biome), #7 (pre-push lint + test),
  #10 (PR pipeline lint + test), #388 (typecheck script in CI + hooks),
  #377 (fallow dead-code), `biome.json`, `.husky/`

## Context

Lint and tests were manual; inconsistent formatting and dead code slipped
into PRs. ESLint config overhead exceeded its value for this codebase.

## Decision

Biome replaces ESLint for lint + format. `typecheck` (tsc strict) runs in CI
and pre-push hooks alongside lint and unit tests; fallow guards dead code.
Verification after every change:
`npm run lint:fix && npm run typecheck && npm test && npx fallow dead-code`.

## Alternatives considered

- Keep ESLint — rejected: slower, more config for equivalent coverage.
- No gates (manual discipline) — rejected: already failed; PRs carried
  formatting noise.

## Consequences

- Good: fast single-tool lint/format; type errors caught before merge;
  hooks encode the workflow so contributors don't memorize it.
- Bad / accepted trade-offs: Biome rule coverage differs from ESLint;
  occasional rule gaps accepted.
- Follow-ups: line-ending normalization (#18); test-time perf work (#408).
