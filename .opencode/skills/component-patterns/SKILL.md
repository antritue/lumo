---
name: component-patterns
description: Use when creating new dashboard components, pages, stores, or dialogs. Covers directory structure, Zustand stores, page state machine, dialog patterns, and conventions.
---

# Component Patterns

Follow these patterns when creating new components in the dashboard. Every feature follows the same structure — study an existing one (properties, services, rent-payments) before building.

## Directory structure

```
components/dashboard/<feature>/
  types.ts              — domain interfaces
  store.ts              — Zustand store with devtools
  <feature>-list.tsx    — list component (owns CRUD dialog state)
  <feature>-item.tsx    — single card/row
  upsert-<feature>-dialog.tsx — combined add/edit dialog
  delete-<feature>-dialog.tsx — delete confirmation
  empty-state.tsx       — first-use state
  <feature>-list-skeleton.tsx  — loading skeleton wrapper
  <feature>-card-skeleton.tsx  — single card skeleton
  *.test.tsx / *.test.ts       — co-located tests

app/dashboard/<feature>/
  page.tsx              — page (or child route)
```

## Types (`types.ts`)

Plain interfaces. IDs are `string`. Use union types for enums. Optional fields with `?`.

```typescript
export interface Item {
  id: string;
  userId: string;
  name: string;
  // ... feature-specific fields
  createdAt?: string;
  updatedAt?: string;
}
```

## Store (`store.ts`)

Use Zustand with devtools. Follow the three-flag pattern for loading states.

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Item } from "./types";

interface ItemsState {
  items: Item[];
  isItemsLoading: boolean;
  hasItemsFetched: boolean;    // dedup: prevents duplicate fetch
  itemsFetchFailed: boolean;

  fetchItems: () => Promise<void>;
  createItem: (/* fields */) => Promise<void>;
  updateItem: (id: string, /* fields */) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearStore: () => void;
}

export const useItemsStore = create<ItemsState>()(
  devtools((set, get) => ({
    items: [],
    isItemsLoading: false,
    hasItemsFetched: false,
    itemsFetchFailed: false,

    fetchItems: async () => {
      const user = useAuthStore.getState().user;
      if (!user) return;                         // no-op when signed out

      const { hasItemsFetched, isItemsLoading } = get();
      if (hasItemsFetched || isItemsLoading) return;

      try {
        set({ isItemsLoading: true });
        // ... API call
        set({ items: data, isItemsLoading: false, hasItemsFetched: true });
      } catch (error) {
        set({ isItemsLoading: false, itemsFetchFailed: true });
        throw error;
      }
    },

    createItem: async (/* fields */) => {
      const user = useAuthStore.getState().user;
      if (user) {
        const res = await fetch("/api/...", { method: "POST", ... });
        const data = await res.json();
        set((state) => ({ items: [...state.items, data] }));
      } else {
        set((state) => ({
          items: [...state.items, { id: crypto.randomUUID(), /* fields */ }],
        }));
      }
    },

    updateItem: async (id, /* fields */) => {
      const user = useAuthStore.getState().user;
      if (user) {
        const res = await fetch(`/api/.../${id}`, { method: "PATCH", ... });
        const data = await res.json();
        set((state) => ({ items: state.items.map((i) => (i.id === id ? data : i)) }));
      } else {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, /* fields */ } : i)),
        }));
      }
    },

    deleteItem: async (id) => {
      const user = useAuthStore.getState().user;
      if (user) {
        await fetch(`/api/.../${id}`, { method: "DELETE", ... });
      }
      set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    },

    clearStore: () => set({ items: [], isItemsLoading: false, hasItemsFetched: false, itemsFetchFailed: false }),
  }), { name: "items" }),
);
```

### Store variants

- **Per-ID loading dedup**: For child resources (rooms under property, payments per room), use `loadingIds: string[]` instead of a single boolean. Check `loadingIds.includes(id)` before fetching.
- **Failed ID tracking**: Track `failedIds: string[]` to show per-card error states.
- **Selectors**: Always use individual selectors (`store((s) => s.items)`) to avoid re-renders.
- **Seed defaults**: For resources that should appear populated on first visit, define a `SEEDED_ITEMS` constant. Seeding happens in two layers: (1) a Supabase DB trigger on `auth.users` insert populates the table for new signups, (2) `fetchItems` uses the constant as in-memory mock data for unauth users. For features that use this, the page effect gates on `authLoading` instead of `user` so the seed fires for both auth states.

## Page state machine (`page.tsx`)

Every page follows the same 4-state pattern:

```typescript
"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { ErrorState } from "@/components/shared/error-state";

export default function ItemsPage() {
  // 1. Individual selectors from store
  const items = useItemsStore((s) => s.items);
  const isLoading = useItemsStore((s) => s.isItemsLoading);
  const hasFetched = useItemsStore((s) => s.hasItemsFetched);
  const fetchFailed = useItemsStore((s) => s.itemsFetchFailed);
  const fetchItems = useItemsStore((s) => s.fetchItems);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  // 2. Fetch on mount (standard: user-gated)
  useEffect(() => { if (user) fetchItems(); }, [user, fetchItems]);
  // For seeded features (services): use authLoading gate so seed fires for unauth too
  // useEffect(() => { if (!authLoading) fetchItems(); }, [authLoading, fetchItems]);

  // 3. Four states (signed-out users skip API, see list immediately)
  if (fetchFailed && !isLoading) return <ErrorState onRetry={fetchItems} />;
  if (!user && !authLoading) return <div>{items.length === 0 ? <EmptyState /> : <ItemList />}</div>;
  if ((!hasFetched || isLoading) && (user || authLoading)) return <ItemListSkeleton />;
  return <div>{items.length === 0 ? <EmptyState /> : <ItemList />}</div>;
}
```

## List + Dialog pattern

The list component manages all CRUD dialog state:

```typescript
export function ItemList() {
  const items = useItemsStore((s) => s.items);
  const createItem = useItemsStore((s) => s.createItem);
  const updateItem = useItemsStore((s) => s.updateItem);
  const deleteItem = useItemsStore((s) => s.deleteItem);

  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const handleSave = (id, name, ...) => {
    if (id) return updateItem(id, ...);
    return createItem(...);
  };

  return (
    <>
      <div className="space-y-6">
        {items.map(item => <ItemCard key={item.id} item={item} onEdit={setEditingItem} onDelete={setDeletingItem} />)}
        <Button onClick={() => setIsAdding(true)} size="lg" className="w-full"><Plus /> Add</Button>
      </div>
      <UpsertDialog mode="add" open={isAdding} onOpenChange={setIsAdding} onSave={handleSave} />
      <UpsertDialog mode="edit" item={editingItem ?? undefined} open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)} onSave={handleSave} />
      <DeleteDialog item={deletingItem} open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)} onDelete={deleteItem} />
    </>
  );
}
```

### Upsert dialog

Single dialog for add + edit. Uses a `mode` prop to switch behavior.

```typescript
interface UpsertDialogProps {
  mode: "add" | "edit";
  item?: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string | null, /* fields */) => Promise<void>;
}
```

Key patterns:
- `useEffect` resets form fields when `open` changes — pre-fills from `item` in edit mode, clears in add mode
- Submitting state shows `<Loader2>` spinner replacing form content
- Title switches via: `const title = mode === "edit" ? t("editTitle") : t("addButton")`
- Submit calls `onOpenChange(false)` on success, shows `<ErrorDialog>` on failure
- Buttons: two `flex-1` buttons (primary + outline)

### Delete dialog

```typescript
interface DeleteDialogProps {
  item: Item | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}
```

Early return: `if (!item) return null;`

### Error dialog (shared)

```typescript
// components/shared/error-dialog.tsx
// Props: { open, onOpenChange, title?, description? }
```

## Item component

A self-contained component that renders a single item. Receives the item data and optional callbacks from the list. Keeps internal state for expand/collapse or other UI concerns.

```typescript
interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
  onDelete?: (item: Item) => void;
}
```

- Action buttons call `onEdit`/`onDelete` callbacks with `e.stopPropagation()` to avoid triggering parent click handlers
- Uses `Card`, `CardHeader`, `CardContent` from `@/components/ui/card` for consistent spacing
- For collapsible content, use `ChevronDown`/`ChevronRight` with a `button` wrapper toggle
- Skeleton version (`ItemCardSkeleton`) mirrors the card layout with `animate-shimmer` on muted divs

## Navigation

Add to `components/dashboard/layout/nav-config.ts`:

```typescript
import { Blocks } from "lucide-react";

export const navItems = [
  // existing items...
  {
    href: "/dashboard/<feature>",
    icon: Blocks,
    labelKey: "<feature>",
    activeMatch: ["/dashboard/<feature>"],
  },
];
```

## i18n

Add translations in `messages/en.json` and `messages/vi.json` under `app.<feature>`:

```json
"app": {
  "<feature>": {
    "emptyTitle": "...",
    "emptySubtitle": "...",
    "listTitle": "...",
    "addButton": "...",
    "addAnother": "...",
    "editTitle": "...",
    "saveButton": "...",
    "deleteTitle": "...",
    "deleteMessage": "...",
    "deleteConfirm": "...",
    "cancel": "...",
    "edit": "...",
    "delete": "...",
    "errors": {
      "create": { "title": "...", "description": "..." },
      "update": { "title": "...", "description": "..." },
      "delete": { "title": "...", "description": "..." }
    }
  }
}
```

Add sidebar label under `app.sidebar`:

```json
"sidebar": {
  "<feature>": "<Feature>"
}
```

## Common mistakes

- **Using the full store object** as a selector instead of individual values → causes unnecessary re-renders
- **Missing `e.stopPropagation()`** on edit/delete buttons inside clickable cards → triggers card's onClick
- **Not resetting form state** on dialog open → stale data from previous edit
- **Not importing the `useTranslations` hook** correctly — use `useTranslations("app.<feature>")` not `useTranslations("app.<Feature>")`
- **Forgetting the Vietnamese translation** in `messages/vi.json`

## Example: complete new feature checklist

1. [ ] Create `components/dashboard/<feature>/types.ts` with interfaces
2. [ ] Create `components/dashboard/<feature>/store.ts` with Zustand + devtools
3. [ ] Create `app/dashboard/<feature>/page.tsx` with 4-state pattern
4. [ ] Create `components/dashboard/<feature>/empty-state.tsx`
5. [ ] Create `components/dashboard/<feature>/<feature>-list-skeleton.tsx` + `-card-skeleton.tsx`
6. [ ] Create `components/dashboard/<feature>/<feature>-list.tsx`
7. [ ] Create `components/dashboard/<feature>/<feature>-item.tsx` (or `<feature>-card.tsx`)
8. [ ] Create `components/dashboard/<feature>/upsert-<feature>-dialog.tsx`
9. [ ] Create `components/dashboard/<feature>/delete-<feature>-dialog.tsx`
10. [ ] Add nav entry in `components/dashboard/layout/nav-config.ts`
11. [ ] Add translations in `messages/en.json` and `messages/vi.json`
12. [ ] Verify: `npx tsc --noEmit` + `npx biome check .`
