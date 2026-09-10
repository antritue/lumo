# ADR-0011: Two-layer services, no globals

- **Status:** Accepted (supersedes ADR-0009)
- **Date:** 2026-08-28
- **Commits/PRs:** #633 (rename to `room_service_overrides` for 2-layer
  semantics), #634 (drop globals table/API/store/nav/page), #635–636
  (remove `service_id` from property services), #671–673 (simplify room +
  property service UX), #674–675 (unauthenticated fallback),
  `20260828000001_rename_room_services_to_overrides.sql`,
  `20260828000002_drop_services_table.sql`,
  `20260828000003_drop_service_id_from_property_services.sql`

## Context

The 3-tier model (ADR-0009) confused users and complicated bulk creation
(#451). UX review P1 demanded simplification.

## Decision

`property_services` is the master catalog per property. `room_service_overrides`
stores only per-room overrides (custom price or disabled) with FK to
`property_services`. Rooms inherit all property services automatically with
"Inherited" vs "Custom" indicators and one-click reset. Global services
deleted entirely — table, API, store, nav, page.

## Alternatives considered

- Keep 3-tier with better tooltips — rejected: complexity was structural,
  not cosmetic.
- Independent per-room services (no inheritance) — rejected: duplicates
  pricing maintenance across rooms.

## Consequences

- Good: one mental model; fewer endpoints; bulk creation simplified;
  quick-add pills (#479), hint prefill (#480), tooltips (#488) followed.
- Bad / accepted trade-offs: drop-globals migration; copy referencing
  globals rewritten (#453).
- Follow-ups: none open — current `docs/database.md` ER diagram reflects
  this model.
