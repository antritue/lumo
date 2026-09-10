# ADR-0002: Google-only OAuth

- **Status:** Accepted
- **Date:** 2026-02-03
- **Commits/PRs:** #115 (Google-only auth), #116 (multi-env infra docs),
  #131 (privacy + terms for OAuth verification),
  #132 (non-blocking auth reminder banner), `docs/auth.md`

## Context

We needed sign-in before persisting properties server-side, but password
auth means reset flows, breach risk, and support load a solo project cannot
afford. Our users already have Google accounts.

## Decision

Google is the sole OAuth provider via Supabase Auth. No email/password, no
additional providers. Legal pages (privacy, terms) exist to satisfy OAuth
verification. Signed-out users get a dismissible banner, never a hard block
(see ADR-0003).

## Alternatives considered

- Email/password — rejected: reset/support burden, weaker security posture.
- Multiple providers (GitHub, Facebook) — rejected: verification and
  maintenance cost for no demonstrated demand.

## Consequences

- Good: minimal auth code, no password storage, fast onboarding.
- Bad / accepted trade-offs: excludes users without Google accounts;
  dependent on Google + Supabase OAuth status.
- Follow-ups: session sync across all stores; sign-out clears stores (#189);
  account deletion with FK-safe cleanup (#494).
