# ADR-0001: Supabase Postgres + Auth backend + RLS

- **Status:** Accepted
- **Date:** 2025-12-29
- **Commits/PRs:** #3 (setup supabase), #138 (properties table + RLS),
  #159 (rooms table migration), `supabase/migrations/`,
  `docs/database.md`, `docs/supabase-sync.md`

## Context

Landing page shipped first (Dec 26). We needed a backend for waitlist
emails, then properties, rooms, payments, and services — with per-user
isolation and Google OAuth, without operating our own auth or database.

## Decision

Supabase is the only backend: Postgres for all tables (`properties`,
`rooms`, `rent_payments`, `rent_payment_charges`, `property_services`,
`room_service_overrides`, `user_entitlements`), Supabase Auth for sessions,
and Row-Level Security scoping every table to its owner. `user_entitlements`
is select-only for owners; writes go through the service-role client from
Polar webhooks.

## Alternatives considered

- Firebase — rejected: weaker relational model for properties → rooms → payments.
- Custom backend (e.g. Prisma + NextAuth on own DB) — rejected: operational
  cost with no product benefit at MVP scale.

## Consequences

- Good: one platform for DB + auth; RLS enforces isolation even if API code
  has bugs; migrations are versioned under `supabase/migrations/`.
- Bad / accepted trade-offs: tied to Supabase availability and Postgres
  semantics; service-role key must stay server-side.
- Follow-ups: multi-environment infra docs (#116); entitlements pattern
  reused by billing (ADR-0010).
