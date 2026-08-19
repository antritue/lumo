# Page, List, and Dialog Templates

Load this file when building page.tsx, list components, or dialogs for a new feature.

## Page state machine (`page.tsx`)

```typescript
"use client";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useAuthStore } from "@/components/dashboard/auth/store";
import { ErrorState } from "@/components/shared/error-state";

export default function ItemsPage() {
  const t = useTranslations("app.<feature>");
  const items = useItemsStore((s) => s.items);
  const isLoading = useItemsStore((s) => s.isItemsLoading);
  const hasFetched = useItemsStore((s) => s.hasItemsFetched);
  const fetchFailed = useItemsStore((s) => s.isItemsFetchFailed);
  const fetchItems = useItemsStore((s) => s.fetchItems);
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  useEffect(() => { if (user) fetchItems(); }, [user, fetchItems]);

  let content: React.JSX.Element;
  if (fetchFailed && !isLoading) {
    content = <ErrorState onRetry={fetchItems} />;
  } else if ((!hasFetched || isLoading) && (user || authLoading)) {
    content = <ItemListSkeleton />;
  } else if (items.length === 0) {
    content = <EmptyState />;
  } else {
    content = <ItemList />;
  }

  return (
    <>
      <div className="flex items-center pb-4 sm:pb-5 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
          {t("listTitle")}
        </h1>
      </div>
      {content}
    </>
  );
}
```

## List + Dialog pattern

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

### Detail panel (split-view)

```typescript
export function ItemDetail({ item, onEdit, onDelete }: ItemDetailProps) {
  return (
    <div>
      <ItemHeader item={item} count={count} onEdit={onEdit} onDelete={onDelete} />
      <ItemChildSection itemId={item.id} />
    </div>
  );
}
```

Sub-sections are self-contained: own store, own dialog state, own fetch effect gated on parent ID. Parent shell is thin — no child CRUD state.

### Upsert dialog

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
- `useEffect` resets form when `open` changes — pre-fills from `item` (edit) or clears (add)
- Submitting state replaces form content with `<Loader2>` spinner
- Title: `const title = mode === "edit" ? t("editTitle") : t("addButton")`
- Submit calls `onOpenChange(false)` on success, `<ErrorDialog>` on failure
- Buttons: two `flex-1` (primary + outline)

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
