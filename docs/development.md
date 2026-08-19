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
-   **Database & Auth**: [Supabase](https://supabase.com) - Postgres database ([Schema](./database.md)) and Google-only authentication ([Auth Flow](./auth.md)).
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs) - Lightweight state management for domain logic.
-   **Validation**: [Zod](https://zod.dev) - Schema validation for API and forms.
-   **Internationalization**: [next-intl](https://next-intl-docs.vercel.app) - App-wide localization.
-   **Linting/Formatting**: [Biome](https://biomejs.dev) - Fast, all-in-one linter and formatter (replaces ESLint/Prettier).
-   **Dead Code**: [Fallow](https://www.npmjs.com/package/fallow) - Fast, Rust-native dead code analysis tool.
-   **Email**: [Resend](https://resend.com) - Transactional email for owner notifications.
-   **Testing**: [Vitest](https://vitest.dev) - Unit and integration testing.

---

## Project Structure

Our structure follows Next.js App Router conventions with a clear separation of concerns.

```
├── app/                  # Application Routes
│   ├── [locale]/         # Main application routes (wrapped in i18n)
│   ├── dashboard/        # Dashboard specific routes
│   └── api/              # API endpoints
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

## Infrastructure & Environments

We use a multi-project setup to balance development speed with production data safety.

-   **Dual Supabase Projects**: We maintain separate projects for **Development** and **Production**. This ensures test user data is isolated and protects real records.
-   **Dual Polar Environments**: One Polar account/organization with **two environments** — sandbox (test) + production. Products, API keys, and webhooks are created **separately in each dashboard**; they are distinct values, never shared. See [the payments plan](./plans/polar-payments.md) for setup steps.
-   **Single Google Cloud Project**: A single OAuth project is used for both environments to maintain unified branding and simplify the app verification process.
-   **Site URL Security**: Login security is enforced via the **Site URL** setting in the Supabase Dashboard. This removes the need for additional "Redirect URI" whitelisting as long as the code matches the Site URL.
    -   **Development**: `http://localhost:3000`
    -   **Production**: `https://www.lumo.homes`
-   **Environment Isolation**: Projects are connected via environment variables:
    -   `Local`: Connected to the Dev project via `.env.local`.
    -   `Production`: Connected to the Prod project via Vercel settings.

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
    Create a `.env.local` file in the root. You will need Supabase, Resend, and Polar credentials.
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    RESEND_API_KEY=your_resend_api_key
    OWNER_EMAIL=your_email@example.com
    POLAR_ACCESS_TOKEN=your_polar_token
    POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
    POLAR_SERVER=sandbox
    POLAR_PRODUCT_ID_MONTHLY=your_monthly_product_id
    POLAR_PRODUCT_ID_YEARLY=your_yearly_product_id
    POLAR_PRODUCT_ID_LIFETIME=your_lifetime_product_id
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    ```
    Get your Resend API key from the [Resend dashboard](https://resend.com) under **API Keys**.
    Polar values come from the Polar dashboard: access token from **Settings → API Keys**, webhook secret from **Settings → Webhooks**, product IDs from each product. Use **sandbox** values locally and **production** values in production (`POLAR_SERVER` switches the SDK). Sandbox test card: `4242 4242 4242 4242`. Full setup in [the payments plan](./plans/polar-payments.md).

    **Local webhooks:** Polar can't reach `localhost`. Tunnel with the Polar CLI:
    ```bash
    polar listen http://localhost:3000/api/polar/webhook
    ```
    The URL **must include the full path** — without it, events hit the root route, which returns `200` without invoking the handler and the DB never updates.

    **Production webhooks:** endpoint at `https://www.lumo.homes/api/polar/webhook` in the **production** dashboard, with production env vars on the host (`POLAR_SERVER=production`, `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID_*`). Full checklist in [the payments plan](./plans/polar-payments.md#production-deployment-checklist).

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
-   `npx fallow dead-code`: Run dead code analysis.

---

## Styling & UI

-   **Framework**: Tailwind CSS 4. All styles in utility classes or `app/globals.css` (CSS variables for theming).
-   **Variants**: Use `cva` (Class Variance Authority) for component variants.
-   **Design Tone**: Keep it "Calm & Premium"—avoid visual noise.
-   **Class Merging**: Use `cn()` utility (`clsx` + `tailwind-merge`) for conditional classes.
-   **No Inline Styles**: Always use Tailwind utilities.

---

## Data & State

We use **Zustand** for domain state (properties, rooms, rent data, and auth). Stores live within feature folders (e.g., `components/dashboard/properties/store.ts`).

-   **Authentication**: Managed via Supabase Auth (Google-only). See [auth.md](./auth.md) for flow details and configuration.
-   **Database Schema**: Documented in [database.md](./database.md). Relationship between users and properties is managed via foreign keys and secured with RLS.
-   **API Reference**: OpenAPI 3.1 spec available in [openapi.yaml](./openapi.yaml). Import into [Swagger Editor](https://editor.swagger.io/) or Postman to view/test.
-   **Store Access**: Components use hooks directly—no prop drilling.
    ```typescript
    const properties = usePropertiesStore((state) => state.properties);
    ```
-   **State Boundaries**: Domain data goes in stores. UI state (dialogs, form visibility) stays local to components.
-   **Data Fetching**: Client Components with Supabase client-side fetching.

---

## Navigation & Routing

-   **Link vs useRouter**: Prefer `Link` for navigation. Use `useRouter` only for programmatic flows (after form submission, conditional redirects).
-   **Localized Routes**: Marketing (`app/[locale]/`) uses `import { Link } from "@/lib/navigation"` (adds `/en` or `/vi`).
-   **Non-Localized Routes**: Dashboard (`app/dashboard/`) uses `import Link from "next/link"` (no locale prefix).
-   **Dynamic Params**: Route params are async. Unwrap with `use(params)` from React.
-   **Server/Client Split**: Avoid unnecessary splits. Use single client component unless you need server-only logic (auth, cookies, fetching).

---

## Validation, Linting & Formatting

We strictly use **Biome** for both linting and formatting, and **Fallow** for dead code analysis.

-   **Pre-push**: Husky is set up to run checks (linting, tests, and dead code analysis) before you push.
-   **CI**: Fails if `biome check` finds errors or if `fallow` detects dead code.
-   **Editor**: Install the Biome extension for your IDE to format on save.
-   **Dead Code**: Run `npx fallow dead-code` locally to find unused files and exports.

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
    -   `docs: update development.md`
-   **Prefixes**:
    -   `feat`: New feature
    -   `fix`: Bug fix
    -   `style`: CSS-only changes (no logic change)
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
