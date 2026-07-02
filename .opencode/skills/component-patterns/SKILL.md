---
name: component-patterns
description: >
  Use this skill when creating new dashboard components, pages, stores, dialogs,
  or item cards under components/dashboard/ or app/dashboard/ — even if the user
  doesn't explicitly say "Zustand" or "component." Covers the Zustand three-flag
  loading pattern, page state machine (4 branches, single return), upsert/delete
  dialog pattern, inline vs kebab action conventions, and directory structure.
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
  createdAt?: string;
  updatedAt?: string;
}
```

## Store (`store.ts`)

Use Zustand with devtools. Three-flag pattern: `isItemsLoading`, `hasItemsFetched`, `itemsFetchFailed`.

**Load `references/store-template.md` for the full store code with all CRUD operations and variant patterns (per-ID dedup, seed defaults).**

## Page state machine (`page.tsx`)

Every page follows an if/else pattern with a single return — the page title renders once outside all branches.

**Load `references/page-and-dialog-templates.md` for the full page.tsx template.**

## List + Dialog pattern

The list component manages all CRUD dialog state (isAdding, editingItem, deletingItem).

**Load `references/page-and-dialog-templates.md` for ItemList, detail panel, upsert dialog, delete dialog, and error dialog templates.**

## Item component

A self-contained card. Action buttons follow one of two patterns:

**A) Inline action buttons** — for items where all interaction happens on the card (e.g. services):
- `<Button variant="ghost" size="icon">` with `Pencil`/`Trash2` icons
- Callbacks use `e.stopPropagation(); e.preventDefault()`
- Wrap in `<div className="flex items-center gap-2 shrink-0">`

**B) Kebab menu** — for items that link to detail pages (e.g. rooms, rent payments):
- `<Popover>` with `<PopoverTrigger>` + `<PopoverContent align="end" className="w-36 p-1.5">`
- Trigger: `<button>` with `<MoreHorizontal className="h-4 w-4" />`, 7x7 rounded-md, hover:bg-muted
- `onClick={(e) => e.stopPropagation()}` on trigger to avoid parent link handlers
- Gate with `{(onEdit || onDelete) && <Popover>...</Popover>}`

Use `Card`, `CardHeader`, `CardContent` from `@/components/ui/card`. For collapsible content, use `ChevronDown`/`ChevronRight` toggle. Skeleton mirrors card layout with `animate-shimmer`.

## Navigation

**Load `references/nav-and-i18n.md` for the nav-config entry and i18n template.**

## Common mistakes

- **Using multiple `return` statements** in page.tsx instead of if/else with `let content`
- **Gating on `!user` for empty state** — empty state triggers on `items.length === 0`, not auth status
- **Using the full store object** as a selector instead of individual values → re-renders
- **Missing `e.stopPropagation()`** on edit/delete buttons inside clickable cards
- **Not resetting form state** on dialog open → stale data from previous edit
- **Not importing `useTranslations` correctly** — use `useTranslations("app.<feature>")`
- **Forgetting the Vietnamese translation** in `messages/vi.json`

## Example: complete new feature checklist

1. [ ] Create `components/dashboard/<feature>/types.ts` with interfaces
2. [ ] Create `components/dashboard/<feature>/store.ts` with Zustand + devtools
3. [ ] Create `app/dashboard/<feature>/page.tsx` with if/else pattern
4. [ ] Create `components/dashboard/<feature>/empty-state.tsx`
5. [ ] Create `components/dashboard/<feature>/<feature>-list-skeleton.tsx` + `-card-skeleton.tsx`
6. [ ] Create `components/dashboard/<feature>/<feature>-list.tsx`
7. [ ] Create `components/dashboard/<feature>/<feature>-item.tsx`
8. [ ] Create `components/dashboard/<feature>/upsert-<feature>-dialog.tsx`
9. [ ] Create `components/dashboard/<feature>/delete-<feature>-dialog.tsx`
10. [ ] Add nav entry in `components/dashboard/layout/nav-config.ts`
11. [ ] Add translations in `messages/en.json` and `messages/vi.json`
12. [ ] Verify: `npx tsc --noEmit` + `npx biome check .`
