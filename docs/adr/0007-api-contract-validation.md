# ADR-0007: API contract — Zod + camelCase + OpenAPI

- **Status:** Accepted
- **Date:** 2026-03-23
- **Commits/PRs:** #141/#163/#170–171 (property CRUD endpoints), #227–228
  (rooms CRUD + OpenAPI specs), #340 (descriptive route names), #362–364,
  #368–369 (rent payment endpoints), #365 (camelCase standardization),
  `docs/openapi.yaml`

## Context

Frontend integrated endpoints piecemeal (properties Feb, rooms Mar–Jun,
payments Jun). Snake_case DB columns leaked into JSON; route filenames were
generic; no machine-readable contract existed.

## Decision

All API routes validate with Zod and return camelCase JSON regardless of
DB casing (#365). Route handlers use descriptive names (#340). `docs/openapi.yaml`
is the contract source of truth, added in #228 and extended per endpoint.

## Alternatives considered

- Expose DB casing directly — rejected: leaks storage detail, splits
  client conventions.
- No OpenAPI (code-only contract) — rejected: frontend/backend drifted
  during the Jun integrations (#348–375).

## Consequences

- Good: single casing rule clients can rely on; Zod errors are consistent;
  OpenAPI enables review without reading handlers.
- Bad / accepted trade-offs: mapping layer per endpoint; OpenAPI can drift
  if a PR adds a route without updating the spec.
- Follow-ups: keep spec updates in the API-endpoint skill checklist.
