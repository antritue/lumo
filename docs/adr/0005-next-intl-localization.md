# ADR-0005: next-intl EN/VI localization

- **Status:** Accepted
- **Date:** 2026-01-01
- **Commits/PRs:** #13 (Vietnamese + SEO), #17 (shell app with dynamic
  translation), #22 (no-reload switching), #44 (locale-based currency),
  #464 (localize room service amounts), #489 (VI translation update)

## Context

Early users are Vietnamese-speaking landlords; SEO and product copy needed
both English and Vietnamese from the start, with currency that reads
naturally per locale.

## Decision

next-intl with App Router `[locale]` routes, server-side locale cookie
persistence, and client-side switching without page reload. Currency display
follows locale. All UI strings go through message catalogs (`messages/`).

## Alternatives considered

- Custom i18n dictionary — rejected: reinventing pluralization, routing,
  and SEO handling.
- English-only launch — rejected: core audience needs Vietnamese day one.

## Consequences

- Good: full EN/VI experience including SEO metadata; locale switch in
  header/footer.
- Bad / accepted trade-offs: every UI string needs two translations;
  per-property currency setting deferred (P3 in `docs/product.md` §14) —
  locale-based display is a heuristic, not a setting.
- Follow-ups: translation-key hygiene (#443); localized month picker (#85).
