# ADR-0003: Auth-branching offline-first stores

- **Status:** Accepted
- **Date:** 2026-02-11
- **Commits/PRs:** #31 (zustand stores), #144 (API integration with auth
  support), #189 (clear stores on sign-out), #674–675 (unauthenticated room
  service operations + local charges fallback), #371 (empty state for
  unauthenticated users)

## Context

Forcing sign-in before trying the app would kill evaluation. Landlords
should feel the "who paid?" clarity instantly, then sign in to persist it.

## Decision

Every store operation branches on `useAuthStore.getState().user`: null →
operate on local state with generated UUIDs; set → call the API. The full
CRUD experience works signed out. A dismissible banner marks data as
local-only. Sign-out clears all stores so no cross-account leakage.

## Alternatives considered

- Auth-gated app (login wall) — rejected: blocks trial, violates calm
  evaluation principle in `docs/product.md`.
- Persist local data to localStorage/IndexedDB — rejected (so far):
  in-memory local state was enough; no demand for cross-session offline yet.

## Consequences

- Good: try-before-commit UX; every API integration must handle both
  branches, which keeps stores honest.
- Bad / accepted trade-offs: duplicate logic paths per store; local data is
  lost on sign-out or refresh by design.
- Follow-ups: per-branch tests required (see component-test-patterns skill);
  unauthenticated service-charges fallback (#675).
