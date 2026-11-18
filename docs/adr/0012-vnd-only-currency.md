# ADR-0012: VND-only currency display

- **Status:** Accepted (supersedes currency portion of ADR-0005)
- **Date:** 2026-11-18
- **Deciders:** Product + engineering
- **Commits/PRs:** Pending

## Context

Lumo now targets Vietnamese landlords only. The EN/VI UI remains useful, but
locale-based currency (VND for VI, USD for EN) exposed USD amounts to English
users and made demo data inconsistent. Rental amounts are entered manually,
not converted, so the displayed currency must match the target market.

## Decision

All in-app monetary values render in VND via a single
`CURRENCY_CODE = "VND"` constant and `formatCurrency(amount)`. Currency no
longer depends on locale. Guest demo data is localized but always uses VND
amounts. Marketing plan prices and Polar billing remain USD.

## Alternatives considered

- Remove the English locale entirely — broader routing, SEO, and message
  changes; deferred because bilingual UI is still useful.
- Keep locale-based currency — rejected: English users saw USD while entering
  VND-scale data.
- Convert plan prices to VND — rejected: Polar plan prices and checkout
  currency need separate product/payment decisions.

## Consequences

- Good: one currency everywhere; no locale-dependent money formatting.
- Bad / accepted trade-offs: numeric values are not converted — existing data
  is reinterpreted as VND. Marketing pricing remains USD.
- Follow-ups: if checkout should charge VND, configure Polar VND plans and
  update pricing copy in `messages/`.
