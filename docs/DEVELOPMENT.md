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
│   ├── shared/           # Global shared components (Logo, ErrorDialog)
│   ├── marketing/        # Landing page specific components
│   └── dashboard/        # Core application logic components
├── lib/                  # Shared Utilities
├── messages/             # Localization JSON files
└── public/               # Static assets
```

### Key Folders
-   **`app/[locale]`**: The public-facing marketing site. Routes here are localized (e.g., `/en`, `/vi`).
-   **`app/dashboard`**: The core authenticated product. This is where landlords manage their properties.

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

We use **Tailwind CSS 4**. All styles are defined in classes or the CSS theme.

-   **Global Styles**: Defined in `app/globals.css`. We use CSS variables for colors (HSL format) to support easy theming.
-   **Components**: We use `cva` (Class Variance Authority) to manage component variants (e.g., `Button` variants like `default`, `outline`, `ghost`).
-   **Design Philosophy**:
    -   Keep it "Calm & Premium".
    -   Use `shadow-soft` and `glass` utility classes for depth.
    -   Avoid inline styles; use Tailwind utilities.
    -   Use the `cn()` utility (`clsx` + `tailwind-merge`) when combining classes conditionally.

---

## Data & State

-   **Data Fetching**: We use Client Components for now, with Supabase client-side fetching where needed.
-   **Forms**: Use `zod` for schema validation (see `lib/validations`).
-   **Supabase**: The client is initialized in `lib/supabase.ts`. It relies on environment variables being present; otherwise, it throws an error to fail fast.
-   **Internationalization**: Data passed to components should be localized. Use `next-intl` hooks (`useTranslations`) in client components and `getTranslations` in server components.

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
-   **Colocation**: Keep related things close. If a component is only used in the dashboard, put it in `app/dashboard` or a `dashboard` subfolder in components.
-   **"UI" vs "Dashboard"**:
    -   `components/ui`: Generic, reusable, unopinionated.
    -   `components/dashboard`: Application-specific, business-logic heavy.

### What NOT to do
-   ❌ Don't add heavy libraries (e.g., lodash, moment) without discussion.
-   ❌ Don't bypass the linter. Fix the code.
-   ❌ Don't hardcode text facing users. Always use `messages/` translations.
