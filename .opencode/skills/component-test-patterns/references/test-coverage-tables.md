# Test Coverage Tables

Load this file when writing tests for a specific component type and you need the full per-operation test case matrix.

## Store: fetch

| Test | What it covers |
|------|----------------|
| Seeds defaults when unauthenticated | In-memory seed data loads, no fetch called |
| Fetches and sets items when authenticated | API response replaces state, correct fetch args |
| Handles fetch error | `fetchFailed` flag set, `isLoading` reset, error logged |
| Prevents duplicate fetches | `hasFetched` guard prevents second call |
| Per-ID fetch dedup (variant) | `fetchingParentId` guard prevents re-fetch when already loading that parent |

## Store: create

| Test | What it covers |
|------|----------------|
| Creates locally when unauthenticated | `crypto.randomUUID()` called, item added, no fetch |
| Calls API when authenticated | POST to `/api/<feature>`, response merged into state |
| Handles API error | State unchanged, error logged, rejected promise |
| Creates with variant inputs | Feature-specific parameters flow through correctly |

## Store: update

| Test | What it covers |
|------|----------------|
| Updates locally when unauthenticated | Only target item changed, others preserved |
| Calls API when authenticated | PATCH to `/api/<feature>/id`, response replaces item |
| Handles API error | Original item preserved, error logged |

## Store: delete

| Test | What it covers |
|------|----------------|
| Deletes locally when unauthenticated | Item removed, others preserved |
| Calls API when authenticated | DELETE to `/api/<feature>/id`, item removed from state |
| Handles API error | Item preserved, error logged |

## Store: clearStore

| Test | What it covers |
|------|----------------|
| Resets all flags | All fields return to initial values |

## Upsert dialog: Display

| Test | What it covers |
|------|----------------|
| Add mode with empty fields | Heading text, input values empty |
| Edit mode with pre-filled data | Inputs populated from item prop |

## Upsert dialog: Interactions

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

## Delete dialog: Display

| Test | What it covers |
|------|----------------|
| Hidden when closed | `queryByRole("dialog")` returns null |
| Visible with content when open | Heading, confirmation text with item name, Delete + Cancel buttons |

## Delete dialog: Interactions

| Test | What it covers |
|------|----------------|
| Calls onDelete with item id | `mockOnDelete("item-id")` |
| Shows error on delete failure | Error message visible via `findByText` |
| Closes on cancel | `onOpenChange(false)` called, `onDelete` not called |

## Item: Display

| Test | What it covers |
|------|----------------|
| Shows expanded details on click | Detail content visible after expand toggle |
| Shows alternate pricing/state variant | Different data shape renders correctly |

## Item: Interactions

| Test | What it covers |
|------|----------------|
| Toggles expand/collapse | Click → expanded, click again → collapsed (aria-expanded) |
| Calls callbacks via inline action buttons | `onEdit`/`onDelete` called with item (services pattern) |
| Calls callbacks via kebab menu | Click kebab → popover opens → click action → callback called with item (rooms/payments pattern) |

## List: Display

| Test | What it covers |
|------|----------------|
| Displays items | Each item name visible, add button visible |
| Shows hint suggestions | Quick-add buttons appear for feature-specific defaults |
| Hides hint suggestions already added | Hint button for already-added item not rendered |

## List: Adding

| Test | What it covers |
|------|----------------|
| Opens dialog on add click | Input placeholder visible |
| Creates item via dialog | Store updated after submit, dialog hidden |
| Adds hint item via hint button | `createItem` called with hint name |
| Shows loading spinner on hint button | Button disabled + spinner visible while creating |
| Closes dialog on cancel | Dialog removed from DOM |

## List: Editing

| Test | What it covers |
|------|----------------|
| Opens dialog with item data (inline buttons) | Click edit button → dialog opens with pre-filled data |
| Opens dialog with item data (kebab menu) | Click kebab → click edit → dialog opens with pre-filled data |

## List: Deleting

| Test | What it covers |
|------|----------------|
| Opens dialog, deletes, closes | Dialog removed after delete confirmed |
| Closes dialog on cancel | Dialog removed, item preserved |

## Empty state: Display

| Test | What it covers |
|------|----------------|
| Shows empty message and add button | Heading + button rendered |

## Empty state: Dialog integration

| Test | What it covers |
|------|----------------|
| Opens dialog when add button clicked | Dialog visible, input rendered |
| Creates item and closes dialog on submit | Store updated, dialog removed |
| Shows loading spinner on hint button | Button disabled + spinner visible while creating |

## Page state machine

| Branch | Store setup |
|--------|-------------|
| Fetch failed | `itemsFetchFailed: true`, `isItemsLoading: false`, `hasItemsFetched: true` |
| Loading | `isItemsLoading: true`, `hasItemsFetched: true` |
| Empty (no items) | `hasItemsFetched: true`, `items: []` |
| Item list | `items: [mockItem(), ...]`, `hasItemsFetched: true` |
