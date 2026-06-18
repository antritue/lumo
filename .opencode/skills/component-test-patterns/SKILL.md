---
name: component-test-patterns
description: Use when writing unit tests for dashboard components, stores, dialogs, lists, pages, and empty states. Covers test file organization, mock conventions, store auth-branching patterns, and component interaction testing.
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

Group tests by component concern:

```typescript
describe("<Feature>Dialog", () => {
  describe("Display", () => { /* rendering assertions */ });
  describe("Interactions", () => { /* click/submit flows */ });
});
```

For stores:

```typescript
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

Always use `renderWithProviders` (from `@/test/render`) for component rendering. It wraps with necessary providers (i18n, etc.).

### userEvent.setup()

Create a `user` instance per test using `userEvent.setup()`. This enables realistic async interactions:

```typescript
const user = userEvent.setup();
renderWithProviders(<Component />);
await user.click(screen.getByRole("button", { name: /save/i }));
await user.type(input, "Some text");
```

### beforeEach state reset

Reset stores and mocks in `beforeEach`:

```typescript
beforeEach(() => {
  use<Feature>Store.setState({
    items: [],
    isItemsLoading: false,
    hasItemsFetched: false,
    itemsFetchFailed: false,
  });
  useAuthStore.setState({ user: null });
  vi.restoreAllMocks();
});
```

### Mock factory

Define a mock factory at the top of each test file with sensible defaults:

```typescript
const mockItem = (overrides: Partial<Item> = {}): Item => ({
  id: "test-uuid",
  userId: "",
  name: "Default",
  // ... default values for all Item fields
  ...overrides,
});
```

Name it after your type (`mockService`, `mockProperty`, `mockPayment`). Keep defaults minimal but valid.

### crypto.randomUUID

The store uses `crypto.randomUUID()` for local IDs. Mock it at the top of store tests:

```typescript
Object.defineProperty(global, "crypto", {
  value: { randomUUID: () => "test-uuid" },
});
```

### mockFetch

Mock `global.fetch` for store operations that call the API:

```typescript
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => { mockFetch.mockReset(); });

// In tests:
mockFetch.mockResolvedValueOnce({
  ok: true,
  json: async () => mockItem({ id: "server-id", name: "Created" }),
});
```

### Auth helper

```typescript
const authenticate = () => {
  useAuthStore.setState({ user: { id: "user-123" } as User });
};
```

### Console error mocking

Suppress expected `console.error` calls (from catch blocks) to keep test output clean:

```typescript
const mockErrorConsole = () =>
  vi.spyOn(console, "error").mockImplementation(() => {});
// ... later
consoleSpy.mockRestore();
```

## Store testing

Every store operation has two auth branches (unauth → local state, auth → API call) plus error handling. Test all three branches. The per-operation tables below use `<Feature>` as a placeholder; substitute your actual feature name.

### fetch

| Test | What it covers |
|------|----------------|
| Seeds defaults when unauthenticated | In-memory seed data loads, no fetch called |
| Fetches and sets items when authenticated | API response replaces state, correct fetch args |
| Handles fetch error | `fetchFailed` flag set, `isLoading` reset, error logged |
| Prevents duplicate fetches | `hasFetched` guard prevents second call |

### create

| Test | What it covers |
|------|----------------|
| Creates locally when unauthenticated | `crypto.randomUUID()` called, item added, no fetch |
| Calls API when authenticated | POST to `/api/<feature>`, response merged into state |
| Handles API error | State unchanged, error logged, rejected promise |
| Creates with variant inputs | Feature-specific parameters flow through correctly |

### update

| Test | What it covers |
|------|----------------|
| Updates locally when unauthenticated | Only target item changed, others preserved |
| Calls API when authenticated | PATCH to `/api/<feature>/id`, response replaces item |
| Handles API error | Original item preserved, error logged |

### delete

| Test | What it covers |
|------|----------------|
| Deletes locally when unauthenticated | Item removed, others preserved |
| Calls API when authenticated | DELETE to `/api/<feature>/id`, item removed from state |
| Handles API error | Item preserved, error logged |

### clearStore

| Test | What it covers |
|------|----------------|
| Resets all flags | All fields return to initial values |

### Template: store test

Replace `Service`, `mockService`, `/api/services`, and `createService("WiFi")` with your feature's types and API path.

```typescript
describe("create<Feature>", () => {
  it("creates locally when unauthenticated", async () => {
    await use<Feature>Store.getState().create<Feature>("New Item");

    const { items } = use<Feature>Store.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(mockItem({ name: "New Item" }));
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls API when authenticated", async () => {
    authenticate();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem({ id: "server-id", name: "New Item", userId: "user-123" }),
    });

    await use<Feature>Store.getState().create<Feature>("New Item");

    const { items } = use<Feature>Store.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(mockItem({ id: "server-id", name: "New Item", userId: "user-123" }));
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/<feature>",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("handles API error gracefully", async () => {
    authenticate();
    mockFetch.mockResolvedValueOnce({ ok: false });
    const consoleSpy = mockErrorConsole();

    await expect(
      use<Feature>Store.getState().create<Feature>("New Item"),
    ).rejects.toThrow("Failed to create <feature>");

    const { items } = use<Feature>Store.getState();
    expect(items).toHaveLength(0);
    consoleSpy.mockRestore();
  });
});
```

## Dialog testing

### Upsert dialog

The upsert dialog handles both add and edit with a `mode` prop. Test each mode independently.

#### Display

| Test | What it covers |
|------|----------------|
| Add mode with empty fields | Heading text, input values empty |
| Edit mode with pre-filled data | Inputs populated from item prop |

#### Interactions

Use `fireEvent.submit(form)` (not `user.click(button)`) inside Radix Dialog forms, then await a microtask flush:

```typescript
const form = within(dialog).getByRole("button", { name: /save/i }).closest("form");
expect(form).not.toBeNull();
fireEvent.submit(form as HTMLFormElement);
await new Promise((resolve) => setTimeout(resolve, 0));
```

| Test | What it covers |
|------|----------------|
| Save button disabled when name empty | `toBeDisabled()` initially |
| Save button enabled when name entered | `toBeEnabled()` after typing |
| Saves with correct data (add mode) | `onSave` called with null id, typed name, defaults |
| Saves with variant inputs (add mode) | Toggle form controls → verify non-default params |
| Saves with correct data (edit mode) | `onSave` called with item id, pre-filled data |
| Shows error on save failure (add) | Error message visible, form restored |
| Shows error on save failure (edit) | Error message visible, form restored |
| Closes on cancel | `onOpenChange(false)` called, `onSave` not called |

The save-button validation tests (disabled/enabled) belong in the dialog's own test file only — do not duplicate them in parent components (list, empty state).

```typescript
// Template: upsert dialog test
import { fireEvent } from "@testing-library/react";

describe("Upsert<Feature>Dialog", () => {
  const mockItem: Item = { id: "1", userId: "user-1", name: "Test", /* feature fields */ };
  const mockOnOpenChange = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => { vi.clearAllMocks(); });

  describe("Display", () => {
    it("displays add mode with empty fields", () => {
      renderWithProviders(<Upsert<Feature>Dialog mode="add" open={true} onOpenChange={mockOnOpenChange} onSave={mockOnSave} />);
      const dialog = screen.getByRole("dialog");
      expect(within(dialog).getByRole("heading", { name: /add <feature>/i })).toBeInTheDocument();
      expect(within(dialog).getByPlaceholderText(/name/i)).toHaveValue("");
    });
  });

  describe("Interactions", () => {
    it("saves item with correct data in add mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Upsert<Feature>Dialog mode="add" open={true} onOpenChange={mockOnOpenChange} onSave={mockOnSave} />);
      const dialog = screen.getByRole("dialog");
      const nameInput = within(dialog).getByPlaceholderText(/name/i);
      const form = within(dialog).getByRole("button", { name: /add <feature>/i }).closest("form");
      expect(form).not.toBeNull();

      await user.type(nameInput, "New Item");
      fireEvent.submit(form as HTMLFormElement);
      await act(async () => {});

      expect(mockOnSave).toHaveBeenCalledWith(null, "New Item", /* defaults */);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it("shows error dialog on save failure", async () => {
      const onSave = vi.fn().mockRejectedValue(new Error("API error"));
      renderWithProviders(<Upsert<Feature>Dialog mode="add" open={true} onOpenChange={vi.fn()} onSave={onSave} />);
      const dialog = screen.getByRole("dialog");
      const nameInput = within(dialog).getByPlaceholderText(/name/i);
      const form = within(dialog).getByRole("button", { name: /add <feature>/i }).closest("form");
      expect(form).not.toBeNull();

      await userEvent.setup().type(nameInput, "Test");
      fireEvent.submit(form as HTMLFormElement);

      expect(await screen.findByText(/problem adding this <feature>/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    });
  });
});
```

### Delete dialog

#### Display

| Test | What it covers |
|------|----------------|
| Hidden when closed | `queryByRole("dialog")` returns null |
| Visible with content when open | Heading, confirmation text with item name, Delete + Cancel buttons |

#### Interactions

| Test | What it covers |
|------|----------------|
| Calls onDelete with item id | `mockOnDelete("item-id")` |
| Shows error on delete failure | Error message visible via `findByText` |
| Closes on cancel | `onOpenChange(false)` called, `onDelete` not called |

```typescript
// Template: delete dialog test
it("calls onDelete with item id when delete button is clicked", async () => {
  const user = userEvent.setup();
  renderWithProviders(<Delete<Feature>Dialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onDelete={mockOnDelete} />);
  await user.click(screen.getByRole("button", { name: /delete <feature>/i }));
  expect(mockOnDelete).toHaveBeenCalledWith("1");
});

it("shows error dialog on delete failure", async () => {
  const onDelete = vi.fn().mockRejectedValue(new Error("API error"));
  const user = userEvent.setup();
  renderWithProviders(<Delete<Feature>Dialog item={mockItem} open={true} onOpenChange={mockOnOpenChange} onDelete={onDelete} />);
  await user.click(screen.getByRole("button", { name: /delete <feature>/i }));
  expect(await screen.findByText(/problem deleting this <feature>/i)).toBeInTheDocument();
});
```

## Item component testing

The item component is a self-contained card. Test its render states and user interactions.

### Display

| Test | What it covers |
|------|----------------|
| Shows expanded details on click | Detail content visible after expand toggle |
| Shows alternate pricing/state variant | Different data shape renders correctly |

Don't test basic rendering (e.g. "displays item name") — the expand interaction test already verifies the component rendered.

### Interactions

| Test | What it covers |
|------|----------------|
| Toggles expand/collapse | Click → expanded, click again → collapsed (aria-expanded) |
| Calls callbacks via inline action buttons | `onEdit`/`onDelete` called with item (services pattern) |
| Calls callbacks via kebab menu | Click kebab → popover opens → click action → callback called with item (rooms/payments pattern) |

```typescript
// Template: item expand test
it("shows expanded details when clicked", async () => {
  const user = userEvent.setup();
  renderWithProviders(<FeatureItem item={mockItem} />);

  await user.click(screen.getByRole("button", { expanded: false }));

  expect(screen.getByText(/detail label/i)).toBeInTheDocument();
});

// Template A: inline action buttons (services-style)
it("calls onEdit when inline edit button is clicked", async () => {
  const onEdit = vi.fn();
  const user = userEvent.setup();
  renderWithProviders(<FeatureItem item={mockItem} onEdit={onEdit} />);

  await user.click(screen.getByRole("button", { name: /edit/i }));

  expect(onEdit).toHaveBeenCalledWith(mockItem);
});

// Template B: kebab menu (rooms/payments-style)
it("calls onEdit when edit is clicked from kebab menu", async () => {
  const onEdit = vi.fn();
  const user = userEvent.setup();
  renderWithProviders(<FeatureItem item={mockItem} onEdit={onEdit} />);

  await user.click(screen.getByRole("button"));  // kebab button (first/only button)
  await user.click(screen.getByRole("button", { name: /edit/i }));

  expect(onEdit).toHaveBeenCalledWith(mockItem);
});
```

## List component testing

The list manages multiple child dialogs and handles both render states and CRUD flows.

### Display

| Test | What it covers |
|------|----------------|
| Displays items | Each item name visible, add button visible |
| Shows hint suggestions | Quick-add buttons appear for feature-specific defaults |
| Hides hint suggestions already added | Hint button for already-added item not rendered |

Scope hint queries to the hint buttons container to avoid false matches from the item list:

```typescript
const hintButtons = screen.getByText(/quick add/i).nextElementSibling as HTMLElement | null;
expect(hintButtons).not.toBeNull();
expect(within(hintButtons!).queryByText("HintItem")).not.toBeInTheDocument();
```

### Adding

| Test | What it covers |
|------|----------------|
| Opens dialog on add click | Input placeholder visible |
| Creates item via dialog | Store updated after submit, dialog hidden |
| Adds hint item via hint button | `createItem` called with hint name |
| Closes dialog on cancel | Dialog removed from DOM |

### Editing

| Test | What it covers |
|------|----------------|
| Opens dialog with item data (inline buttons) | Click edit button → dialog opens with pre-filled data |
| Opens dialog with item data (kebab menu) | Click kebab → click edit → dialog opens with pre-filled data |

Prefer verifying the dialog state rather than the full submit flow (avoids Radix Dialog flakiness at the integration level):

```typescript
// Template A: inline action buttons (services-style)
it("opens dialog with item data for editing", async () => {
  const user = userEvent.setup();
  renderWithProviders(<FeatureList />);

  await user.click(screen.getByRole("button", { name: /edit/i }));

  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByPlaceholderText(/name/i)).toHaveValue("Existing Item");
  expect(within(dialog).getByRole("button", { name: /save/i })).toBeEnabled();
});

// Template B: kebab menu (rooms/payments-style)
it("opens dialog with item data for editing via kebab", async () => {
  const user = userEvent.setup();
  renderWithProviders(<FeatureList />);

  const itemCard = screen.getByText("Existing Item").closest("a, div");
  const kebabButton = within(itemCard!).getByRole("button");
  await user.click(kebabButton);
  await user.click(screen.getByRole("button", { name: /edit/i }));

  const dialog = screen.getByRole("dialog");
  expect(within(dialog).getByPlaceholderText(/name/i)).toHaveValue("Existing Item");
  expect(within(dialog).getByRole("button", { name: /save/i })).toBeEnabled();
});
```

### Deleting

| Test | What it covers |
|------|----------------|
| Opens dialog, deletes, closes | Dialog removed after delete confirmed |
| Closes dialog on cancel | Dialog removed, item preserved |

## Empty state testing

The empty state shows when the item list is empty. Test only the **integration** — do not duplicate dialog-internal tests (validation, disabled/enabled button state).

### Display

| Test | What it covers |
|------|----------------|
| Shows empty message and add button | Heading + button rendered |

### Dialog integration

| Test | What it covers |
|------|----------------|
| Opens dialog when add button clicked | Dialog visible, input rendered |
| Creates item and closes dialog on submit | Store updated, dialog removed |

```typescript
// Template: empty state test
it("creates first item and closes dialog on submit", async () => {
  const user = userEvent.setup();
  renderWithProviders(<EmptyState />);

  await user.click(screen.getByRole("button", { name: /add <feature>/i }));

  const input = screen.getByPlaceholderText(/name/i);
  const saveButton = screen.getByRole("button", { name: /add <feature>/i });

  await user.type(input, "New Item");
  await user.click(saveButton);

  const { items } = use<Feature>Store.getState();
  expect(items).toHaveLength(1);
  expect(items[0].name).toBe("New Item");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

## Page testing

The page component uses if/else branches with a single return. Test each branch independently by setting store flags directly (no API calls needed). Organize describe blocks to match the if/else conditions.

| Branch | Store setup |
|--------|-------------|
| Fetch failed | `itemsFetchFailed: true`, `isItemsLoading: false`, `hasItemsFetched: true` |
| Loading | `isItemsLoading: true`, `hasItemsFetched: true` |
| Empty (no items) | `hasItemsFetched: true`, `items: []` |
| Item list | `items: [mockItem(), ...]`, `hasItemsFetched: true` |

Set `hasItemsFetched: true` to prevent the mount effect from calling `fetchItems()` and overriding your test state.

Every test also verifies the page title (`h1` with `listTitle` key) is visible — the title renders once for all states in the single return:

```typescript
describe("<Feature>Page", () => {
  describe("when fetching items failed", () => {
    it("shows error state with retry button", () => {
      useItemsStore.setState({ itemsFetchFailed: true, isItemsLoading: false, hasItemsFetched: true });
      renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /failed to load/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe("while items are still loading", () => {
    it("shows loading skeleton", () => {
      useItemsStore.setState({ isItemsLoading: true, hasItemsFetched: true });
      const { container } = renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(container.querySelectorAll(".animate-shimmer").length).toBeGreaterThan(0);
    });
  });

  describe("when there are no items", () => {
    it("shows empty state", () => {
      useItemsStore.setState({ items: [], hasItemsFetched: true });
      renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /empty title/i })).toBeInTheDocument();
    });
  });

  describe("when items exist", () => {
    it("shows item list", () => {
      useItemsStore.setState({ items: [mockItem()], hasItemsFetched: true });
      renderWithProviders(<FeaturePage />);

      expect(screen.getByRole("heading", { name: /list title/i })).toBeInTheDocument();
      expect(screen.getByText(/default item name/i)).toBeInTheDocument();
    });
  });
});
```

Note: The old pattern of separate `describe("FeaturePage", ...)` with individual `it("displays empty state when user is not authenticated", ...)` tests has been replaced by the if/else-organized structure above. Each describe block maps to one branch of the page's if/else chain.

## What to test vs what to skip

| Level | Test | Skip |
|-------|------|------|
| **Dialog** | Display modes, validation (disabled/enabled), save with defaults, save with variants, error handling, cancel | — |
| **List** | Integration: opens dialog, hint items shown/hidden, closing on cancel | Dialog-internal validation, submit mechanics (covered by dialog tests) |
| **Empty state** | Integration: opens dialog, creates item on submit, closes on cancel | Dialog-internal validation, button disabled/enabled state |
| **Page** | All 4 machine states: loading, empty, list, error | — |
| **Item** | Expand/collapse, inline action button callbacks, kebab menu callbacks, variant renderings | Basic name rendering (covered by expand test) |
| **Store** | Auth branches (unauth + auth), error handling, dedup, variant inputs, reset | — |

## Common mistakes

- **Not setting `hasItemsFetched: true`** in page tests — the mount effect calls `fetchItems()` which overrides your test state
- **Forgetting `vi.clearAllMocks()` or `vi.restoreAllMocks()`** in `beforeEach` — leaked mock state causes cross-test pollution
- **Not resetting the auth store** — if a previous test set `user: { id: "..." }`, the next unauth test will hit the API path
- **Using `getByText` when multiple elements match** — use `getAllByText` with `.length` check or a more specific matcher
- **Using `user.click(button)` inside Radix Dialog forms** — Radix Dialog can interfere with form submission; prefer `fireEvent.submit(form as HTMLFormElement)` after a null guard
- **Testing dialog-internal behavior in parent components** — dialog tests cover validation and submit mechanics; list/empty-state tests cover only integration (opens, closes, store updates). Don't duplicate.
- **Not using `within(dialog)` for dialog queries** — un-scoped queries may match elements outside the dialog
- **Forgetting to `restore` console error spies** — always call `consoleSpy.mockRestore()` to avoid test pollution
- **Using `renderWithProviders` instead of direct store manipulation** — page tests should set store state directly, not render child components

## Verification

After writing tests, run:

```bash
npx tsc --noEmit        # TypeScript check
npx biome check .       # Lint + format
npx vitest run          # All tests
```
