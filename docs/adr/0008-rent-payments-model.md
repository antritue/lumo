# ADR-0008: Rent payments per room-month + charges

- **Status:** Accepted
- **Date:** 2026-01-27
- **Commits/PRs:** #58 (rent payment section), #66 (dialog + button behavior),
  #70 (edit/delete), #82 (paid/pending status), #96 (duplicate prevention),
  #109 (mm-yyyy format), #471 (persist service charges), #493 (badge
  inline toggle), `20260303000000_create_rent_payments.sql`,
  `20260628000001_create_rent_payment_charges.sql`

## Context

The core question — "who paid this month?" — needs exactly one answerable
record per room per period, with service line items (electricity, water)
rolled into the total.

## Decision

One `rent_payments` row per room per `YYYY-MM`; duplicates rejected
server-side (#96). Status is paid/pending with inline badge toggle (#493).
Variable line items live in `rent_payment_charges` (flat or usage-based)
and totals are auto-calculated. Periods render as mm-yyyy (#109).

## Alternatives considered

- Free-form payment rows (no uniqueness) — rejected: double-counting broke
  the core clarity promise.
- Charges embedded as JSON on the payment — rejected: unqueryable;
  separate table won (#471).

## Consequences

- Good: "who paid?" is a single lookup; totals stay consistent as charges
  change; timezone-safe month comparisons (#143).
- Bad / accepted trade-offs: backfilling or correcting a period requires
  edit flows, not raw inserts.
- Follow-ups: rent overview dashboard + API (#622, #624–625).
