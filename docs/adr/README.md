# Architecture Decision Records

Decisions reconstructed from git history (Dec 2025 → Sep 2026, 644 commits).
New decisions go here — copy `0000-template.md`.

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [0001](0001-supabase-backend-rls.md) | Supabase Postgres + Auth backend + RLS | Accepted | 2025-12-29 |
| [0002](0002-google-only-auth.md) | Google-only OAuth | Accepted | 2026-02-03 |
| [0003](0003-auth-branching-offline-first.md) | Auth-branching offline-first stores | Accepted | 2026-02-11 |
| [0004](0004-zustand-feature-architecture.md) | Zustand feature architecture + UI consistency | Accepted | 2026-01-08 |
| [0005](0005-next-intl-localization.md) | next-intl EN/VI localization | Accepted | 2026-01-01 |
| [0006](0006-biome-typecheck-ci.md) | Biome + typecheck + CI gates | Accepted | 2025-12-31 |
| [0007](0007-api-contract-validation.md) | API contract: Zod + camelCase + OpenAPI | Accepted | 2026-03-23 |
| [0008](0008-rent-payments-model.md) | Rent payments per room-month + charges | Accepted | 2026-01-27 |
| [0009](0009-service-hierarchy-three-tier.md) | Service hierarchy, 3-tier with globals | Superseded by 0011 | 2026-06-13 |
| [0010](0010-polar-billing-room-cap.md) | Polar billing + 5-room free cap | Accepted | 2026-08-11 |
| [0011](0011-two-layer-services-no-globals.md) | Two-layer services, no globals | Accepted | 2026-08-28 |

## Adding a new ADR

1. Copy `0000-template.md` → `NNNN-short-title.md` (next number).
2. Fill in Status / Context / Decision / Consequences with real commit or PR links.
3. Add a row to the table above. Set `Proposed` → `Accepted` on merge.
4. Never edit a recorded ADR to change history — supersede instead.

## What we deliberately do NOT record

- Dependency bumps (Dependabot, ~60% of history).
- Landing-page copy tweaks and isolated bugfixes.
- Provider swaps with no structural impact (e.g. Resend for email, #339).
