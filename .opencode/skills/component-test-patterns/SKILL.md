---
name: component-test-patterns
description: >
  Use this skill when writing or fixing unit tests for dashboard components —
  stores, dialogs, lists, pages, item cards, and empty states. Applies even if
  the user doesn't explicitly mention "test" or "vitest." Covers auth-branching
  store patterns (unauth local vs auth API), Radix Dialog form submission
  quirks, deferred promises for loading states, and the 4-state page machine.
---

# Component Test Patterns

Follow these patterns when writing tests for dashboard features. Every feature follows the same testing structure — study existing tests (`services/`) as the reference example.

## Test file organization

Tests are co-located with the component they test:

```
components/dashboard/<feature>/
  store.test.ts                — Zustand store
  upsert-<feature>-dialog.test.tsx  — combined add/edit dialog
  delete-<feature>-dialog.test.tsx  — delete confirmation
  <feature>-item.test.tsx      — single card/row
  <feature>-list.test.tsx      — list with CRUD integration
  empty-state.test.tsx         — first-use state

app/dashboard/<feature>/
  page.test.tsx                — page state machine
```

### Describe structure

```typescript
describe("<Feature>Dialog", () => {
  describe("Display", () => { /* rendering assertions */ });
  describe("Interactions", () => { /* click/submit flows */ });
});

describe("<Feature>Store", () => {
  describe("fetch<Feature>s", () => { /* ... */ });
  describe("create<Feature>", () => { /* ... */ });
  describe("update<Feature>", () => { /* ... */ });
  describe("delete<Feature>", () => { /* ... */ });
  describe("clearStore", () => { /* ... */ });
});
```

## General conventions

### renderWithProviders

Always use `renderWithProviders` (from `@/test/render`) for component rendering.

### userEvent.setup()

Create a `user` instance per test:

```typescript
const user = userEvent.setup();
renderWithProviders(<Component />);
await user.click(screen.getByRole("button", { name: /save/i }));
await user.type(input, "Some text");
```

### beforeEach state reset

```typescript
beforeEach(() => {
  use<Feature>Store.setState({
    items: [], isItemsLoading: false, hasItemsFetched: false, isItemsFetchFailed: false,
  });
  useAuthStore.setState({ user: null });
  vi.restoreAllMocks();
});
```

### Mock factory

```typescript
const mockItem = (overrides: Partial<Item> = {}): Item => ({
  id: "test-uuid", userId: "", name: "Default", ...overrides,
});
```

### crypto.randomUUID

Mock at the top of store tests:

```typescript
Object.defineProperty(global, "crypto", {
  value: { randomUUID: () => "test-uuid" },
});
```

### mockFetch

```typescript
const mockFetch = vi.fn();
global.fetch = mockFetch;
beforeEach(() => { mockFetch.mockReset(); });
mockFetch.mockResolvedValueOnce({
  ok: true, json: async () => mockItem({ id: "server-id", name: "Created" }),
});
```

### Auth helper

```typescript
const authenticate = () => {
  useAuthStore.setState({ user: { id: "user-123" } as User });
};
```

### Console error mocking

```typescript
const mockErrorConsole = () =>
  vi.spyOn(console, "error").mockImplementation(() => {});
```

### Deferred promise for loading states

```typescript
it("shows loading spinner while creating", async () => {
  let resolveCreate!: () => void;
  const createPromise = new Promise<void>((resolve) => { resolveCreate = resolve; });
  vi.spyOn(use<Feature>Store.getState(), "create<Feature>").mockReturnValue(createPromise);

  const user = userEvent.setup();
  renderWithProviders(<Component />);
  await user.click(screen.getByRole("button", { name: /start action/i }));

  expect(button).toBeDisabled();
  expect(button.querySelector("svg.animate-spin")).toBeInTheDocument();

  resolveCreate();
  await createPromise;
});
```

For store-only tests (no rendering), use a never-resolving promise:

```typescript
mockFetch.mockResolvedValueOnce(new Promise(() => {}));
```

## Store testing

Every store operation has two auth branches (unauth → local state, auth → API call) plus error handling. Test all three.

**Load `references/test-coverage-tables.md` for the per-operation test case matrix (fetch, create, update, delete, clearStore).**

**Load `references/test-templates.md` for the full store test template code.**

## Dialog testing

### Upsert dialog

Use `fireEvent.submit(form)` (not `user.click(button)`) inside Radix Dialog forms:

```typescript
const form = within(dialog).getByRole("button", { name: /save/i }).closest("form");
expect(form).not.toBeNull();
fireEvent.submit(form as HTMLFormElement);
await new Promise((resolve) => setTimeout(resolve, 0));
```

Save-button validation tests (disabled/enabled) belong in the dialog's own test file only — do not duplicate them in parent components.

**Load `references/test-coverage-tables.md` for dialog display + interaction test cases.**
**Load `references/test-templates.md` for full upsert/delete dialog template code.**

### Delete dialog

Early return pattern: `if (!item) return null;`.

**Load `references/test-templates.md` for delete dialog template code.**

## Item component testing

Don't test basic rendering (e.g. "displays item name") — the expand interaction test already verifies the component rendered.

**Load `references/test-templates.md` for item expand/inline-action/kebab template code.**

## List component testing

Scope hint queries to the hint buttons container to avoid false matches:

```typescript
const hintButtons = screen.getByText(/quick add/i).nextElementSibling as HTMLElement | null;
expect(within(hintButtons!).queryByText("HintItem")).not.toBeInTheDocument();
```

Prefer verifying dialog state rather than the full submit flow (avoids Radix Dialog flakiness at the integration level).

**Load `references/test-coverage-tables.md` for list display/adding/editing/deleting test cases.**
**Load `references/test-templates.md` for list template code.**

## Empty state testing

Test only integration — do not duplicate dialog-internal tests (validation, disabled/enabled button state).

**Load `references/test-templates.md` for empty state template code.**

## Page testing

Set store flags directly (no API calls needed). Each if/else branch maps to a describe block:

| Branch | Store setup |
|--------|-------------|
| Fetch failed | `isItemsFetchFailed: true`, `isItemsLoading: false`, `hasItemsFetched: true` |
| Loading | `isItemsLoading: true`, `hasItemsFetched: true` |
| Empty (no items) | `hasItemsFetched: true`, `items: []` |
| Item list | `items: [mockItem(), ...]`, `hasItemsFetched: true` |

Set `hasItemsFetched: true` to prevent the mount effect from calling `fetchItems()`. For per-ID dedup stores (no `hasItemsFetched` flag), mock the fetch action:

```typescript
useRoomsStore.getState().fetchRoomsByPropertyId = vi.fn();
useRoomsStore.setState({ rooms: [mockRoom()], isRoomsLoading: false });
```

Every test verifies the page title (`h1` with `listTitle` key) is visible across all states.

**Load `references/test-templates.md` for page test template code.**

## What to test vs what to skip

| Level | Test | Skip |
|-------|------|------|
| **Dialog** | Display modes, validation (disabled/enabled), save with defaults, save with variants, error handling, cancel | — |
| **List** | Integration: opens dialog, hint items shown/hidden, hint button loading state, closing on cancel | Dialog-internal validation, submit mechanics |
| **Empty state** | Integration: opens dialog, creates item on submit, hint button loading state | Dialog-internal validation, button disabled/enabled |
| **Page** | All 4 machine states: loading, empty, list, error | — |
| **Item** | Expand/collapse, action button callbacks, kebab menu callbacks, variant renderings | Basic name rendering |
| **Store** | Auth branches (unauth + auth), error handling, dedup, variant inputs, reset | — |

## Common mistakes

- **Not setting `hasItemsFetched: true`** in page tests — mount effect overrides test state
- **Forgetting `vi.clearAllMocks()` or `vi.restoreAllMocks()`** in `beforeEach`
- **Not resetting the auth store** — leaked user state causes unauth tests to hit the API path
- **Using `getByText` when multiple elements match** — use `getAllByText` with `.length` or a more specific matcher
- **Using `user.click(button)` inside Radix Dialog forms** — prefer `fireEvent.submit(form)` after a null guard
- **Testing dialog-internal behavior in parent components** — dialog tests cover validation and submit mechanics
- **Not using `within(dialog)` for dialog queries** — un-scoped queries may match outside the dialog
- **Forgetting to `restore` console error spies** — call `consoleSpy.mockRestore()` after the assertion
- **Using `renderWithProviders` instead of direct store manipulation** for page tests
- **Not importing the `useTranslations` hook correctly** — use `useTranslations("app.<feature>")`

## Verification

```bash
npx tsc --noEmit        # TypeScript check
npx biome check .       # Lint + format
npx vitest run          # All tests
```
