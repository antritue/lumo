# ADR-0010: Polar billing + 5-room free cap

- **Status:** Accepted
- **Date:** 2026-08-11
- **Commits/PRs:** #579 (entitlements table), #580 (server-side 5-room cap),
  #586 (webhooks sync), #587 (checkout + portal routes), #596 (billing
  store + upgrade dialog), #598–599 (pricing + docs),
  `docs/polar-payments.md`, `20260810000000_create_user_entitlements.sql`

## Context

Monetization hypothesis (`docs/product.md` §6–7): free proves value, paid
unlocks scale. The gate had to be value-aligned (room count, not features)
and server-enforced so clients can't bypass it.

## Decision

Polar is Merchant of Record (checkout, webhooks, customer portal). Four
tiers: Free ≤5 rooms; Monthly $5, Yearly $48, Lifetime $79 — each unlimited
rooms. `user_entitlements` is the source of truth, synced by webhooks;
lifetime purchase auto-cancels subscriptions. Creating a 6th room returns
403; the "+" button opens the upgrade dialog instead. Downgrade/cancel never
deletes rooms.

## Alternatives considered

- Stripe direct — rejected: MoR (tax, invoicing) handling favored Polar
  for a solo founder.
- Feature gating — rejected: violates simplicity principle; room count is
  the natural upgrade moment (pain starts ~8 rooms).

## Consequences

- Good: no feature flags; calm upgrade trigger at the point of need;
  billing status + portal + FAQ/tax note shipped (#602, #607).
- Bad / accepted trade-offs: Polar + webhook dependency; pricing is a
  hypothesis pending validation.
- Follow-ups: validate 5-room threshold against real usage.
