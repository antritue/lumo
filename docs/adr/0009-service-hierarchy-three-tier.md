# ADR-0009: Service hierarchy, 3-tier with globals (historical)

- **Status:** Superseded by ADR-0011
- **Date:** 2026-06-13
- **Commits/PRs:** #403–405 (service dashboard, API, frontend integration),
  #406 (service component tests), #413 (quick-add suggestions),
  #444 (property services API + schema), #449–450 (room services
  front/back), #451 (bulk creation), `20260613000000_create_services.sql`,
  `20260620000000_create_property_services.sql`,
  `20260622000000_create_room_services.sql`

## Context

Services (electricity, water, WiFi) needed reuse across properties and rooms.
We modeled three tiers — global catalog → property → room — assuming a
shared catalog would reduce duplication.

## Decision (then)

Global `services` table as shared catalog; property and room layers
reference or copy from it. Dedicated global services page, nav, store,
and API.

## Why it was superseded

UX review flagged 3-tier as confusing (`docs/product.md` §14, P1 — now
marked Done). Maintenance cost (bulk creation #451, notice-hint churn #453)
exceeded reuse value. Removed in #634; semantics replaced by ADR-0011.

## Consequences (kept for history)

- Good at the time: proved services matter; produced the property/room
  UI that survived.
- Bad: three mental models for one concept; kept only as a cautionary
  record — do not revive without a new ADR.
