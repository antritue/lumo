# Store Template

Load this file when implementing a Zustand store for a new feature.

```typescript
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Item } from "./types";

interface ItemsState {
  items: Item[];
  isItemsLoading: boolean;
  hasItemsFetched: boolean;
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
      if (!user) return;

      const { hasItemsFetched, isItemsLoading } = get();
      if (hasItemsFetched || isItemsLoading) return;

      try {
        set({ isItemsLoading: true });
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

    clearStore: () => set({
      items: [], isItemsLoading: false, hasItemsFetched: false, itemsFetchFailed: false,
    }),
  }), { name: "items" }),
);
```

## Store variants

- **Per-ID loading dedup**: For child resources (rooms under property, payments per room), use a single `fetchingParentId: string | null` instead of `hasItemsFetched: boolean`. Check `fetchingParentId === parentId` before fetching.
- **Per-ID error tracking**: Use `isFetchFailed: boolean` instead of array.
- **Selectors**: Always use individual selectors (`store((s) => s.items)`) to avoid re-renders.
- **Seed defaults**: Define a `SEEDED_ITEMS` constant. Seeding happens in two layers: (1) Supabase DB trigger on `auth.users` insert, (2) `fetchItems` uses the constant as in-memory mock data for unauth users. Page effect gates on `authLoading` instead of `user`.
