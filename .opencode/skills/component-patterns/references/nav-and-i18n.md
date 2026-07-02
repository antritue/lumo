# Navigation and i18n Configuration

Load this file when adding nav entries or translations for a new feature.

## Nav config (`components/dashboard/layout/nav-config.ts`)

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

## i18n (`messages/en.json` and `messages/vi.json`)

Under `app.<feature>`:

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
