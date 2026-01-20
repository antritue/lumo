# Development Guide

Welcome to the Lumo codebase. This document is a practical guide to understanding, running, and contributing to the project.

Lumo is a focused product for independent landlords. We prioritize simplicity, clarity, and maintainability over complex abstractions.

---

## Tech Stack Overview

We use a modern, type-safe stack designed for stability and developer experience.

-   **Framework**: [Next.js 16](https://nextjs.org) - The core React framework.
-   **Language**: [TypeScript 5](https://www.typescriptlang.org) - Strict mode enabled for safety.
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com) - Utility-first styling with inline themes.
-   **Component Library**: [shadcn/ui](https://ui.shadcn.com) - Reusable components built with Radix UI and Tailwind.
-   **UI Primitives**: [Radix UI](https://www.radix-ui.com) - The underlying accessible primitives.
-   **Database**: [Supabase](https://supabase.com) - Postgres database and authentication.
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs) - Lightweight state management for domain logic.
-   **Validation**: [Zod](https://zod.dev) - Schema validation for API and forms.
-   **Internationalization**: [next-intl](https://next-intl-docs.vercel.app) - App-wide localization.
-   **Linting/Formatting**: [Biome](https://biomejs.dev) - Fast, all-in-one linter and formatter (replaces ESLint/Prettier).
-   **Testing**: [Vitest](https://vitest.dev) - Unit and integration testing.

---

## Project Structure

Our structure follows Next.js App Router conventions with a clear separation of concerns.

```
├── app/                  # Application Routes
│   ├── [locale]/         # Main application routes (wrapped in i18n)
│   ├── dashboard/        # Dashboard specific routes
│   └── api/              # API endpoints (e.g., waitlist)
├── components/           # React Components
│   ├── ui/               # Reusable primitives (Buttons, Inputs, etc.)
│   ├── shared/           # Global shared components (Logo, ErrorDialog, DevelopmentBanner)
│   ├── marketing/        # Landing page specific components
│   └── dashboard/        # Core application logic components
│       └── [feature]/    # Feature-based folders (e.g., properties/, rooms/)
├── lib/                  # Shared Utilities
├── messages/             # Localization JSON files
└── public/               # Static assets
```

---

## Local Development

### Prerequisites
-   Node.js 24.x (Check `package.json` engines)
-   npm (comes with Node)

### Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env.local` file in the root. You will need Supabase credentials.
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

### Common Commands

-   `npm run dev`: Start dev server.
-   `npm run build`: Build for production.
-   `npm run lint`: Check code quality with Biome.
-   `npm run lint:fix`: Auto-fix linting/formatting issues.
-   `npm test`: Run tests with Vitest.

---

## Styling & UI

-   **Framework**: Tailwind CSS 4. All styles in utility classes or `app/globals.css` (CSS variables for theming).
-   **Variants**: Use `cva` (Class Variance Authority) for component variants.
-   **Design Tone**: Keep it "Calm & Premium"—avoid visual noise.
-   **Class Merging**: Use `cn()` utility (`clsx` + `tailwind-merge`) for conditional classes.
-   **No Inline Styles**: Always use Tailwind utilities.

---

## Data & State

We use **Zustand** for domain state (properties, rooms, rent data). Stores live within feature folders (e.g., `components/dashboard/properties/store.ts`).

-   **Store Access**: Components use hooks directly—no prop drilling.
    ```typescript
    const properties = usePropertiesStore((state) => state.properties);
    ```
-   **State Boundaries**: Domain data goes in stores. UI state (dialogs, form visibility) stays local to components.
-   **Data Fetching**: Client Components with Supabase client-side fetching.
-   **Forms**: Use `zod` for schema validation (see `lib/validations`).
-   **Supabase**: The client is initialized in `lib/supabase.ts`. It relies on environment variables being present; otherwise, it throws an error to fail fast.
-   **Internationalization**: Data passed to components should be localized. Use `next-intl` hooks (`useTranslations`) in client components and `getTranslations` in server components.

---

## Navigation & Routing

-   **Link vs useRouter**: Prefer `Link` for navigation. Use `useRouter` only for programmatic flows (after form submission, conditional redirects).
-   **Localized Routes**: Marketing (`app/[locale]/`) uses `import { Link } from "@/lib/navigation"` (adds `/en` or `/vi`).
-   **Non-Localized Routes**: Dashboard (`app/dashboard/`) uses `import Link from "next/link"` (no locale prefix).
-   **Dynamic Params**: Route params are async. Unwrap with `use(params)` from React.
-   **Server/Client Split**: Avoid unnecessary splits. Use single client component unless you need server-only logic (auth, cookies, fetching).

---

## Validation, Linting & Formatting

We strictly use **Biome** for both linting and formatting.

-   **Pre-push**: Husky is set up to run checks before you push.
-   **CI**: Fails if `biome check` finds errors.
-   **Editor**: Install the Biome extension for your IDE to format on save.

**Common Pitfalls**:
-   Do **not** use `console.log` in production code.
-   Do **not** ignore lint errors without a very good reason (and a comment).

---

## Git Conventions

-   **Branch Naming**: Always create a branch before working. Format: `prefix/description`
    -   `feat/add-room-management`
    -   `fix/property-card-navigation`
    -   `docs/update-readme`
-   **Commit Messages**: Use conventional format: `prefix: description`
    -   `feat: add room creation flow`
    -   `fix: resolve infinite loop in property detail`
    -   `docs: update DEVELOPMENT.md`
-   **Prefixes**:
    -   `feat`: New feature
    -   `fix`: Bug fix
    -   `chore`: Maintenance (dependencies, configs)
    -   `docs`: Documentation changes
    -   `test`: Adding or updating tests
    -   `refactor`: Code refactoring (no behavior change)
    -   `perf`: Performance improvements

---

## Testing

We use **Vitest** with Testing Library. Tests are co-located with components (`component.test.tsx`).

-   **Render Helper**: Use `renderWithProviders()` from `test/render.tsx` (includes i18n)
-   **User Events**: Use `@testing-library/user-event` for interactions
-   **Query Priority**: `getByRole()` > `getByPlaceholderText()` > `getByText()`
-   **Text Matching**: Use regex for i18n safety: `/add property/i` (not exact strings)
-   **Organization**: Group tests with nested `describe` blocks for 10+ tests or 3+ feature areas

**What to Test**:
-   ✅ User-visible behavior and workflows
-   ✅ Validation rules and error states
-   ✅ Store operations

**What NOT to Test**:
-   ❌ Implementation details
-   ❌ Third-party internals
-   ❌ Redundant scenarios

---

## Deployment

The project is built to deploy on Vercel (or any Next.js compatible host).

-   **Build Command**: `npm run build`
-   **Environment Variables**: Ensure all variables from `.env.local` are set in the deployment environment.

---

## Conventions & Guardrails

### Naming
-   **Files/Folders**: `kebab-case` (e.g., `save-button.tsx`, `user-profile/`).
-   **Components**: `PascalCase` (e.g., `SaveButton`).
-   **Utilities**: `camelCase` (e.g., `formatDate`).

### Architecture
-   **Colocation**: Keep related things close. Component only used in dashboard? Put it in `components/dashboard/`.
-   **Feature-Based Organization**: Dashboard components organized by feature (`properties/`, `rooms/`). Each folder contains all UI and logic for that feature.
-   **Component Hierarchy**:
    -   `components/ui`: Generic primitives (Button, Input, Card). Direct imports.
    -   `components/shared`: Cross-feature components (Logo, ErrorDialog). Direct imports.
    -   `components/dashboard/[feature]`: Feature-specific with business logic. Use barrel exports (`index.ts`).
-   **Single Responsibility**: One component, one job. Prefer small, composable components.
-   **State Boundaries**: Domain data → stores. UI state → local to component. Page-level for source of truth.
-   **Composition over Conditionals**: Compose small components rather than large ones with many branches.
-   **Name by Intent**: Describe what it does, not how (`EmptyState` not `IconWithForm`).

### What NOT to do
-   ❌ Don't add heavy libraries (e.g., lodash, moment) without discussion.
-   ❌ Don't bypass the linter. Fix the code.
-   ❌ Don't hardcode text facing users. Always use `messages/` translations.
