# ADR-0004: Zustand feature architecture + UI consistency

- **Status:** Accepted
- **Date:** 2026-01-08
- **Commits/PRs:** #21 (components folder structure), #31 (zustand),
  #74 (split room page), #76 (behavior-focused tests), #454–457
  (single-value loading/failed), #460–461 (fetch dedup), #411 (upsert
  dialog for property), #71–72 (modal consistency, combined add/edit
  dialog), #378–380 (ErrorState components), #172 (skeleton loading),
  #437 (popover kebab menus), #107–109 (Tailwind spacing scale, button
  sizes, mm-yyyy format)

## Context

Dashboard features (properties, rooms, payments, services) were growing
entangled page components with prop drilling and scattered loading flags.
Tests asserted implementation details instead of user behavior.

## Decision

Feature-based organization: each dashboard feature owns its Zustand store
(with devtools), types, components, and dialogs, with barrel exports.
Components read stores directly — no prop drilling; dialog open/close stays
local. One loading + one error value per store (arrays removed #454–457),
fetch-dedup guards (StrictMode-safe), and co-located tests. Shared UI
conventions: upsert (combined add/edit) dialogs, consistent ErrorState /
skeleton / empty states on every page, popover kebab menus for row actions,
Tailwind spacing scale (no arbitrary px).

## Alternatives considered

- React Context + useReducer — rejected: re-render granularity and
  boilerplate worse at our feature count.
- Redux Toolkit — rejected: heavier ceremony for a single-developer app.
- Separate add vs edit dialogs — rejected: duplicated forms; upsert won (#72).

## Consequences

- Good: features are independently understandable and testable; user-behavior
  tests survived refactors (#76); ordering/layout changes stayed local
  (#395–398, #438–439).
- Bad / accepted trade-offs: direct store access can hide data flow;
  discipline required to keep dialog state local.
- Follow-ups: component/api test-pattern skills (#407, #487); fallow
  dead-code checks (#377).
