# Graph Report - .  (2026-06-09)

## Corpus Check
- Corpus is ~48,171 words - fits in a single context window. You may not need a graph.

## Summary
- 988 nodes · 1702 edges · 79 communities (58 shown, 21 thin omitted)
- Extraction: 97% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Dashboard Component Tests|Dashboard Component Tests]]
- [[_COMMUNITY_App Shell & Layout|App Shell & Layout]]
- [[_COMMUNITY_Authentication & Authorization|Authentication & Authorization]]
- [[_COMMUNITY_Marketing & Property Forms|Marketing & Property Forms]]
- [[_COMMUNITY_Feature Module Exports|Feature Module Exports]]
- [[_COMMUNITY_Room Data Model|Room Data Model]]
- [[_COMMUNITY_Auth Provider & Store|Auth Provider & Store]]
- [[_COMMUNITY_Code Formatting Config|Code Formatting Config]]
- [[_COMMUNITY_Marketing Homepage|Marketing Homepage]]
- [[_COMMUNITY_Properties Module|Properties Module]]
- [[_COMMUNITY_Root Layout & Pages|Root Layout & Pages]]
- [[_COMMUNITY_Rent Payment Forms|Rent Payment Forms]]
- [[_COMMUNITY_Rent Payment Validation|Rent Payment Validation]]
- [[_COMMUNITY_API Route Tests|API Route Tests]]
- [[_COMMUNITY_Room UI Strings|Room UI Strings]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_shadcnui Config|shadcn/ui Config]]
- [[_COMMUNITY_Pricing Page Content|Pricing Page Content]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Properties API|Properties API]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Rent Payments API|Rent Payments API]]
- [[_COMMUNITY_Pricing i18n|Pricing i18n]]
- [[_COMMUNITY_Vietnamese i18n|Vietnamese i18n]]
- [[_COMMUNITY_Rent Payments API Tests|Rent Payments API Tests]]
- [[_COMMUNITY_Feature Flags|Feature Flags]]
- [[_COMMUNITY_Package Scripts|Package Scripts]]
- [[_COMMUNITY_Room API Tests|Room API Tests]]
- [[_COMMUNITY_Rent Payment API CRUD|Rent Payment API CRUD]]
- [[_COMMUNITY_Brand Identity|Brand Identity]]
- [[_COMMUNITY_Hero i18n EN|Hero i18n EN]]
- [[_COMMUNITY_Hero i18n VI|Hero i18n VI]]
- [[_COMMUNITY_Preview Screenshots|Preview Screenshots]]
- [[_COMMUNITY_Waitlist Feature|Waitlist Feature]]
- [[_COMMUNITY_English i18n|English i18n]]
- [[_COMMUNITY_Dashboard Nav i18n EN|Dashboard Nav i18n EN]]
- [[_COMMUNITY_Problems i18n EN|Problems i18n EN]]
- [[_COMMUNITY_Waitlist i18n EN|Waitlist i18n EN]]
- [[_COMMUNITY_Dashboard Nav i18n VI|Dashboard Nav i18n VI]]
- [[_COMMUNITY_Problems i18n VI|Problems i18n VI]]
- [[_COMMUNITY_Waitlist i18n VI|Waitlist i18n VI]]
- [[_COMMUNITY_Pricing Tiers|Pricing Tiers]]
- [[_COMMUNITY_Package Metadata|Package Metadata]]
- [[_COMMUNITY_Room Preview Screenshot|Room Preview Screenshot]]
- [[_COMMUNITY_CTA Section EN|CTA Section EN]]
- [[_COMMUNITY_Privacy Page Metadata|Privacy Page Metadata]]
- [[_COMMUNITY_CTA Section VI|CTA Section VI]]
- [[_COMMUNITY_Supabase Project Config|Supabase Project Config]]
- [[_COMMUNITY_Auth Callback API|Auth Callback API]]
- [[_COMMUNITY_Features i18n EN|Features i18n EN]]
- [[_COMMUNITY_Footer EN|Footer EN]]
- [[_COMMUNITY_Auth Banner i18n EN|Auth Banner i18n EN]]
- [[_COMMUNITY_Dev Banner i18n EN|Dev Banner i18n EN]]
- [[_COMMUNITY_Footer VI|Footer VI]]
- [[_COMMUNITY_Dev Banner & Tenants Page|Dev Banner & Tenants Page]]
- [[_COMMUNITY_App Icon SVG|App Icon SVG]]
- [[_COMMUNITY_Git Hooks|Git Hooks]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Dependabot Config|Dependabot Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_DELETE Properties API|DELETE Properties API]]
- [[_COMMUNITY_PATCH Properties API|PATCH Properties API]]
- [[_COMMUNITY_DELETE Rent Payments API|DELETE Rent Payments API]]
- [[_COMMUNITY_PATCH Rent Payments API|PATCH Rent Payments API]]
- [[_COMMUNITY_DELETE Rooms API|DELETE Rooms API]]
- [[_COMMUNITY_PATCH Rooms API|PATCH Rooms API]]
- [[_COMMUNITY_GET Properties API|GET Properties API]]
- [[_COMMUNITY_GET Rent Payments API|GET Rent Payments API]]
- [[_COMMUNITY_GET Rooms API|GET Rooms API]]
- [[_COMMUNITY_POST Properties API|POST Properties API]]
- [[_COMMUNITY_GET Waitlist API|GET Waitlist API]]
- [[_COMMUNITY_POST Rent Payments API|POST Rent Payments API]]
- [[_COMMUNITY_POST Rooms API|POST Rooms API]]
- [[_COMMUNITY_POST Waitlist API|POST Waitlist API]]
- [[_COMMUNITY_POST Auth Callback API|POST Auth Callback API]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 32 edges
2. `renderWithProviders()` - 32 edges
3. `Button` - 27 edges
4. `Room` - 25 edges
5. `createSupabaseServerClient()` - 24 edges
6. `useAuthStore` - 23 edges
7. `rooms` - 22 edges
8. `rooms` - 22 edges
9. `Development Guide` - 21 edges
10. `rentPayments` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Room Detail View (UI Screenshot)` --shows--> `Payment Records History`  [AMBIGUOUS]
  public/preview-room.png → messages/en.json
- `Properties Management Preview Screenshot` --illustrates--> `Rent Tracking Feature`  [INFERRED]
  public/preview-properties.png → messages/en.json
- `deleteProperty()` --calls--> `createSupabaseServerClient()`  [INFERRED]
  app/api/properties/[id]/route.ts → lib/supabase-server.ts
- `updateProperty()` --calls--> `createSupabaseServerClient()`  [INFERRED]
  app/api/properties/[id]/route.ts → lib/supabase-server.ts
- `updateProperty()` --calls--> `mapToCamelCase()`  [INFERRED]
  app/api/properties/[id]/route.ts → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication Architecture** — docs_auth_google_oauth, docs_auth_supabase_auth, docs_auth_auth_provider, docs_auth_zustand_store, docs_development_environment_isolation, docs_openapi_auth_callback [EXTRACTED 1.00]
- **Core Data Model** — docs_database_auth_users, docs_database_properties, docs_database_rooms, docs_database_rls, docs_openapi_property_entity, docs_openapi_room_entity, docs_openapi_rent_payment_entity [EXTRACTED 1.00]
- **Quality Pipeline** — workflows_ci_pipeline, readme_biome, docs_development_fallow, docs_development_vitest, docs_development_zod, workflows_dependabot_auto_merge [EXTRACTED 1.00]

## Communities (79 total, 21 thin omitted)

### Community 0 - "Dashboard Component Tests"
Cohesion: 0.06
Nodes (45): formatCurrency(), PropertyCard(), PropertyCardProps, DeleteRentPaymentDialog(), DeleteRentPaymentDialogProps, PaymentStatusBadge(), PaymentStatusBadgeProps, RentPaymentsList() (+37 more)

### Community 1 - "App Shell & Layout"
Cohesion: 0.08
Nodes (28): AuthReminderBanner(), LanguageSwitcher(), AppShell(), AppShellProps, AppHeader(), mockUseAuth, MobileNav(), isPathActive() (+20 more)

### Community 2 - "Authentication & Authorization"
Cohesion: 0.07
Nodes (48): Account Switching via select_account, AuthProvider Component, Google OAuth Flow, Authentication Guide, Session Persistence, Supabase Auth, Zustand Auth Store, auth.users Table (+40 more)

### Community 3 - "Marketing & Property Forms"
Cohesion: 0.13
Nodes (25): metadata, CreatePropertyForm(), CreatePropertyFormProps, DeletePropertyDialog(), DeletePropertyDialogProps, EditPropertyDialog(), EditPropertyDialogProps, Property (+17 more)

### Community 4 - "Feature Module Exports"
Cohesion: 0.05
Nodes (43): app, authBanner, development, metadata, properties, shared, sidebar, tenants (+35 more)

### Community 5 - "Room Data Model"
Cohesion: 0.06
Nodes (40): rooms, description, title, description, title, monthlyRent, notes, notSet (+32 more)

### Community 6 - "Auth Provider & Store"
Cohesion: 0.13
Nodes (15): AuthProvider(), AuthProviderProps, AuthState, useAuthStore, useAuth(), supabase, EmptyState(), PropertiesPage() (+7 more)

### Community 7 - "Code Formatting Config"
Cohesion: 0.06
Nodes (36): source, assist, actions, enabled, css, parser, formatter, arrowParentheses (+28 more)

### Community 8 - "Marketing Homepage"
Cohesion: 0.10
Nodes (23): MobileMenu(), PreviewCarousel(), PREVIEWS, CtaSection(), FeatureItem, Features(), Footer(), Header() (+15 more)

### Community 9 - "Properties Module"
Cohesion: 0.06
Nodes (35): properties, description, title, description, title, description, title, create (+27 more)

### Community 10 - "Root Layout & Pages"
Cohesion: 0.11
Nodes (15): inter, RootLayout(), metadata, localeNames, localeNames, AppLayout(), generateMetadata(), getAppLocale() (+7 more)

### Community 11 - "Rent Payment Forms"
Cohesion: 0.07
Nodes (30): rentPayments, monthOccupied, amount, cancel, clear, errors, period, save (+22 more)

### Community 12 - "Rent Payment Validation"
Cohesion: 0.07
Nodes (30): rentPayments, monthOccupied, amount, cancel, clear, errors, period, save (+22 more)

### Community 13 - "API Route Tests"
Cohesion: 0.13
Nodes (20): mockDelete, mockEq, mockEq2, mockGetUser, mockSelect, mockSingle, mockUpdate, deleteRoom() (+12 more)

### Community 14 - "Room UI Strings"
Cohesion: 0.08
Nodes (25): rooms, monthlyRent, notes, notSet, title, addAnother, addButton, backToProperties (+17 more)

### Community 15 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 16 - "shadcn/ui Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "Pricing Page Content"
Cohesion: 0.12
Nodes (17): buttonText, description, features, name, price, pricing, comingSoon, subtitle (+9 more)

### Community 18 - "Package Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, class-variance-authority, clsx, lucide-react, next, next-intl, @radix-ui/react-dialog, @radix-ui/react-popover (+9 more)

### Community 19 - "Properties API"
Cohesion: 0.21
Nodes (10): DATABASE_TABLES, createProperty(), listProperties(), mockEq, mockGetUser, mockInsert, mockSelect, mockSingle (+2 more)

### Community 20 - "Dev Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, @biomejs/biome, fallow, happy-dom, supabase, tailwindcss, @tailwindcss/postcss, @testing-library/jest-dom (+7 more)

### Community 21 - "Rent Payments API"
Cohesion: 0.13
Nodes (14): listRentPayments(), mockFrom, mockGetUser, mockInsert, mockPaymentEq, mockPaymentOrder, mockPaymentSelect, mockRoomEq (+6 more)

### Community 22 - "Pricing i18n"
Cohesion: 0.18
Nodes (11): buttonText, description, features, name, price, pricing, comingSoon, subtitle (+3 more)

### Community 23 - "Vietnamese i18n"
Cohesion: 0.18
Nodes (10): auth, error, description, title, features, items, subtitle, title (+2 more)

### Community 24 - "Rent Payments API Tests"
Cohesion: 0.20
Nodes (9): mockDelete, mockEq, mockEq2, mockGetUser, mockSelect, mockSingle, mockUpdate, deleteProperty() (+1 more)

### Community 25 - "Feature Flags"
Cohesion: 0.20
Nodes (10): app, shared, sidebar, tenants, description, retry, title, errorState (+2 more)

### Community 26 - "Package Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, lint:fix, prepare, start, test (+2 more)

### Community 27 - "Room API Tests"
Cohesion: 0.22
Nodes (8): mockDelete, mockEq, mockEq2, mockGetUser, mockSelect, mockSingle, mockUpdate, deleteRentPayment()

### Community 28 - "Rent Payment API CRUD"
Cohesion: 0.44
Nodes (5): updateRentPayment(), mapToCamelCase(), toCamelCase(), createRentPayment(), rentPaymentSchema

### Community 29 - "Brand Identity"
Cohesion: 0.31
Nodes (9): Apple touch icon format (180x180 PNG), Compass/crosshairs logo symbol, Brand color: green (#5ca37c), Lumo brand identity, Lumo project, apple-icon.png (Apple Touch Icon), Rent tracking for independent landlords, icon.svg (vector logo source) (+1 more)

### Community 30 - "Hero i18n EN"
Cohesion: 0.22
Nodes (9): hero, badge, carouselLabel, cta, headline, launchApp, previewProperties, previewRoom (+1 more)

### Community 31 - "Hero i18n VI"
Cohesion: 0.22
Nodes (9): hero, badge, carouselLabel, cta, headline, launchApp, previewProperties, previewRoom (+1 more)

### Community 32 - "Preview Screenshots"
Cohesion: 0.25
Nodes (9): Add Another Property Button, Dashboard Properties View, Hero Section Preview Carousel, Properties Management Preview Screenshot, Marketing Landing Page, Property Card with Expandable Rooms, Property List UI Component, Rent Tracking Feature (+1 more)

### Community 33 - "Waitlist Feature"
Cohesion: 0.33
Nodes (6): WaitlistInput, waitlistSchema, joinWaitlist(), resend, mockInsert, mockSend

### Community 34 - "English i18n"
Cohesion: 0.29
Nodes (6): auth, error, description, title, languageSwitcher, label

### Community 35 - "Dashboard Nav i18n EN"
Cohesion: 0.29
Nodes (7): header, features, menu, pricing, problems, signIn, signOut

### Community 36 - "Problems i18n EN"
Cohesion: 0.29
Nodes (7): problems, items, solution, subtitle, title, description, title

### Community 37 - "Waitlist i18n EN"
Cohesion: 0.29
Nodes (7): waitlist, description, emailPlaceholder, error, submit, success, title

### Community 38 - "Dashboard Nav i18n VI"
Cohesion: 0.29
Nodes (7): header, features, menu, pricing, problems, signIn, signOut

### Community 39 - "Problems i18n VI"
Cohesion: 0.29
Nodes (7): problems, items, solution, subtitle, title, description, title

### Community 40 - "Waitlist i18n VI"
Cohesion: 0.29
Nodes (7): waitlist, description, emailPlaceholder, error, submit, success, title

### Community 41 - "Pricing Tiers"
Cohesion: 0.33
Nodes (6): buttonText, description, features, name, price, pro

### Community 42 - "Package Metadata"
Cohesion: 0.33
Nodes (5): engines, node, name, private, version

### Community 43 - "Room Preview Screenshot"
Cohesion: 0.40
Nodes (5): Marketing Site Hero Section, Payment Records History, PreviewCarousel Component, Room Entity, Room Detail View (UI Screenshot)

### Community 44 - "CTA Section EN"
Cohesion: 0.40
Nodes (5): cta, button, launchApp, subtitle, title

### Community 45 - "Privacy Page Metadata"
Cohesion: 0.50
Nodes (5): metadata, metadata, description, keywords, title

### Community 46 - "CTA Section VI"
Cohesion: 0.40
Nodes (5): cta, button, launchApp, subtitle, title

### Community 47 - "Supabase Project Config"
Cohesion: 0.40
Nodes (4): name, organization_id, organization_slug, ref

### Community 49 - "Features i18n EN"
Cohesion: 0.50
Nodes (4): features, items, subtitle, title

### Community 50 - "Footer EN"
Cohesion: 0.50
Nodes (4): footer, copyright, forOwners, madeWith

### Community 51 - "Auth Banner i18n EN"
Cohesion: 0.50
Nodes (4): authBanner, close, message, title

### Community 52 - "Dev Banner i18n EN"
Cohesion: 0.50
Nodes (4): development, devBadge, inDevelopment, title

### Community 53 - "Footer VI"
Cohesion: 0.50
Nodes (4): footer, copyright, forOwners, madeWith

### Community 55 - "App Icon SVG"
Cohesion: 0.67
Nodes (3): App Icon (SVG), Green Branding Color (#5ca37c), Crosshair Symbol

## Ambiguous Edges - Review These
- `preview-room.png` → `Room Detail View (UI Screenshot)`  [AMBIGUOUS]
  public/preview-room.png · relation: depicts
- `Room Detail View (UI Screenshot)` → `Payment Records History`  [AMBIGUOUS]
  messages/en.json · relation: shows
- `Room Detail View (UI Screenshot)` → `Room Entity`  [AMBIGUOUS]
  messages/en.json · relation: represents

## Knowledge Gaps
- **504 isolated node(s):** `husky.sh script`, `mockExchangeCodeForSession`, `mockGetUser`, `mockDelete`, `mockUpdate` (+499 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `preview-room.png` and `Room Detail View (UI Screenshot)`?**
  _Edge tagged AMBIGUOUS (relation: depicts) - confidence is low._
- **What is the exact relationship between `Room Detail View (UI Screenshot)` and `Payment Records History`?**
  _Edge tagged AMBIGUOUS (relation: shows) - confidence is low._
- **What is the exact relationship between `Room Detail View (UI Screenshot)` and `Room Entity`?**
  _Edge tagged AMBIGUOUS (relation: represents) - confidence is low._
- **Why does `app` connect `Feature Module Exports` to `English i18n`, `Rent Payment Forms`, `Room Data Model`?**
  _High betweenness centrality (0.110) - this node is a cross-community bridge._
- **Why does `rentPayments` connect `Rent Payment Forms` to `Feature Module Exports`, `Room Data Model`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `rooms` connect `Room Data Model` to `Feature Module Exports`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `createSupabaseServerClient()` (e.g. with `deleteProperty()` and `deleteRentPayment()`) actually correct?**
  _`createSupabaseServerClient()` has 7 INFERRED edges - model-reasoned connections that need verification._