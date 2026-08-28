# Lumo — Product Overview

## 1. What is Lumo?

**Lumo** is a simple, calm, and trustworthy tool that gives independent landlords clear, reliable answers about rent payments — without spreadsheets, notebooks, or constant double-checking.

Lumo solves one problem well:
> Whenever you need to know who has paid and who hasn't, you get a clear, reliable answer instantly.

The product is intentionally minimal, built for landlords who:
- Manage 8–25 rooms across one or more properties
- Still track rent with Excel, paper, or memory
- Want clarity, not complexity

---

## 2. Target Users

### Who Lumo is For

Independent landlords who:
- Manage **~8–25 rooms** (the range where manual tracking breaks down)
- Own or personally manage one or more properties with multiple rooms
- Track rent status personally (not delegating to teams)

This includes:
- Landlords managing their own properties
- Solo property managers who personally track rent

### Who Lumo is NOT For

- Landlords with fewer than 5 rooms (Excel/paper still work fine)
- Property management teams or agencies
- Enterprise or commercial property operators
- Anyone needing tenant CRM, maintenance ticketing, or full accounting

### Early Survey Data (4 responses, Jan 2026)
- Landlords with **more rooms** show greater interest and willingness to pay
- Landlords with **fewer rooms** can manage with simpler tools
- Sweet spot appears to be 8–25 rooms; needs more validation

**Positioning note:** Target by behavior (personal rent tracking), not by job title.

---

## 3. Core Problem

The problem Lumo solves is **lack of clarity at payment review moments**.

When landlords need to check rent status, they face:
- **Confusion:** "Did they actually pay, or did I miss it?"
- **Manual Work:** Checking bank statements, messages, notebooks, spreadsheets
- **Mental Load:** Remembering who paid, who's late, who always forgets
- **Stress:** Second-guessing themselves before following up

This confusion compounds as the number of rooms grows. Around 8 rooms, manual tracking becomes unreliable.

Lumo replaces confusion with clarity: open the app and know immediately where things stand.

---

## 4. Product Principles (Non-Negotiable)

Lumo must always be:

- **Simple** – fewer features, done well
- **Calm** – no visual noise, no pressure
- **Friendly** – plain language, no jargon
- **Trustworthy** – clear data, predictable behavior

If a feature adds complexity without removing confusion, it does not belong in Lumo.

---

## 5. MVP — Implemented Features

### Core Rent Tracking

- **Properties** — Create, update, delete buildings. Split-panel layout with detail view.
- **Rooms** — Create, update, delete rooms within properties. Dedicated room detail page with payments and services.
- **Rent Payments** — Record payments per room per period (YYYY-MM). Status tracking (paid/pending). Period validation prevents duplicate months.
- **Rent Payment Charges** — Line-item service charges attached to each payment. Flat or variable pricing with usage entry. Auto-calculated totals.

### Service Management (2-Layer Hierarchy)

- **Property-Level Services** — Master catalog per property. Add services (Electricity, Water, WiFi, Cleaning, Parking) with pricing type (flat/variable) and rates. Quick-add presets for common services.
- **Room-Level Services** — Rooms inherit all property services automatically. Landlords can override pricing per room or disable a service for specific rooms. Clear "Inherited" vs "Custom" indicators with one-click reset to property default.

### Authentication & Data Model

- **Google OAuth** via Supabase. Session management with auth state synced across all stores.
- **Auth-Branching (Offline-First)** — The entire app works without signing in. All CRUD falls back to local state with generated UUIDs. Users can try the full experience before committing to auth. A dismissible banner reminds users their data is local-only when unauthenticated.

### Billing & Plans

- **Polar payments** — Checkout for all three paid tiers plus a customer portal (manage/cancel/invoices), powered by Polar as Merchant of Record.
- **Room-cap gating** — Free = up to 5 rooms; any paid tier unlocks unlimited rooms. The cap is server-enforced (403); at the limit, the "+" button opens an upgrade dialog instead of the add-room dialog.
- **Entitlements** — `user_entitlements` is the source of truth, updated by Polar webhooks. A lifetime purchase auto-cancels active subscriptions; rooms are never deleted on cancel or downgrade.

### Internationalization

- **English and Vietnamese.** Locale switching in header and footer. Server-side locale cookie persistence. All UI text and currency formatting localized.

### Marketing & Public Pages

- **Landing Page** — Hero, problems, features, pricing, CTA, footer sections.
- **Privacy Policy, Terms of Service** — Static legal pages.

### Settings & Feedback

- **Settings** — Billing card (current plan, room usage, upgrade / manage subscription / buy lifetime) and account deletion with FK-safe data cleanup.
- **Feedback** — Feedback page (bug / feature / other) sent via email (Resend).

### Cross-Cutting

- **Consistent empty/loading/error states** across every page.
- **Responsive design** — Desktop sidebar navigation, mobile bottom nav with tablet adaptation.
- **Service tooltips** — Hover tooltips explain service pricing and customization state.

---

## 6. Free vs Paid Thinking (Pending Validation)

> [!NOTE]
> Working hypothesis based on early survey data (4 responses, Jan 2026). Subject to change with more validation.

Four tiers, gated by room count:
- **Free** — Up to 5 rooms. All core features, no time limit, no card required.
- **Monthly** — $5/month, unlimited rooms, cancel anytime.
- **Yearly** — $48/year (only $4/mo), unlimited rooms.
- **Lifetime** — $79 one-time, unlimited rooms, yours forever.

**Goal:** Free tier proves value; paid tier unlocks clarity at scale. The free cap ends at 5 rooms — before manual tracking becomes stressful at ~8+ rooms.

**Why room count:** it's the natural upgrade moment (you feel the pain before hitting the limit) and it aligns with user value (more rooms = more uncertainty = more value from Lumo). No feature gating preserves simplicity.

**Philosophy:** Free users are not failures. They are future upgrades, referrals, and proof the product is simple enough.

---

## 7. Monetization Direction

### Payment Model
- **Free tier**: up to 5 rooms, no card required
- **Paid tiers**: $5/month, $48/year, or $79 one-time — each unlocks unlimited rooms
- Processed by Polar (checkout, webhooks, customer portal)

### Upgrade Trigger
- Happens when user tries to create 6th room (server-enforced with a 403)
- The "+" button opens a calm upgrade dialog instead of the add-room dialog
- Clear value statement: "Upgrade for unlimited rooms"
- Existing rooms are never deleted on downgrade or cancellation

All pricing and thresholds are working hypotheses until validated by real usage. The implemented marketing page shows the four tiers above and checkout works end-to-end.

---

## 8. Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| State | Zustand with devtools |
| Validation | Zod |
| Database/Auth | Supabase (Postgres + Google OAuth) |
| i18n | next-intl |
| Email | Resend |
| Icons | lucide-react |
| Linting | Biome |
| Testing | Vitest + Testing Library |

---

## 9. Architecture & Conventions

- **App Router** — Public routes under `/[locale]/`, dashboard under `/dashboard/`, API under `/api/`.
- **Feature-based organization** — Dashboard code grouped by feature (properties, rooms, services, rent-payments). Each feature has its own Zustand store, types, components, and dialogs with barrel exports.
- **Auth-branching stores** — Every store operation checks `useAuthStore.getState().user`. If null, operations work on local state. Enables the offline-first experience.
- **Self-contained services** — `property_services` is the master catalog per property. `room_service_overrides` stores only overrides (custom prices or disabled services) with a FK to `property_services`. Rooms inherit property services automatically.
- **No prop drilling** — Components access Zustand stores directly. UI state (dialog open/close) stays local.
- **Test co-location** — Every component, store, page, and API route has a co-located test file.
- **Dedup patterns** — Fetch deduplication guards prevent duplicate requests (critical with React StrictMode).

### DB Schema

`properties`, `rooms`, `rent_payments`, `rent_payment_charges`, `property_services`, `room_service_overrides`, `user_entitlements`

All tables have RLS scoping access to the owner; `user_entitlements` allows select-only for the
owner with writes performed via the service-role client (Polar webhooks).

---

## 10. Brand Tone & Voice

Lumo speaks like a calm, reliable friend — not a sales pitch.

**Voice:**
- Calm
- Respectful
- Grounded

**Language Rules:**
- No tech jargon or SaaS buzzwords
- No urgency language ("Act now!", "Limited time!")
- Prefer everyday wording ("rent" not "receivables")
- Speak **with** users, not **at** them

**Example tone:**
- Good: "See who's paid this month"
- Bad: "Maximize your rental revenue with our powerful dashboard"

---

## 11. Design Direction

- **Mobile-first** responsive design with sidebar (desktop), bottom nav (mobile), tablet-adaptive layout
- **"Soft Sage" palette** — warm grays, gentle sage greens, soft coral accents
- Custom CSS: `shadow-soft`, `shadow-soft-lg`, `glass`, `animate-shimmer`
- Clean layouts, large readable text, soft spacing, minimal color palette
- No aggressive CTAs
- Consistent empty/loading/error states across all pages
- Inline service activation (one-click shelf buttons) instead of dialog flows where possible

Design should feel:
> "I can trust this and understand it at a glance."

---

## 12. What Lumo Is NOT

Be explicit about what we are not building:

- **Not a full property management system** (no tenant CRM, maintenance, leases)
- **Not built for teams or agencies** (single-user tool)
- **Not feature-rich** (we win by staying small)
- **Not trying to replace accountants** (no complex reporting or tax features)
- **Not for investors or speculators** (for operators who track rent personally)

---

## 13. Success Definition

Lumo is successful when:

**Functional Success:**
- Users can answer "Who has paid?" instantly, without double-checking
- Users stop using Excel, paper, or bank statement searches
- Users trust Lumo as their source of truth

**Emotional Success:**
- Users feel **confident** when following up on late payments
- Users feel **calm** during payment review (no stress or second-guessing)
- Users feel **relieved** they don't have to remember or cross-check

**Word-of-Mouth Success:**
- Users describe Lumo as "simple and clear"
- Users recommend it to other landlords unprompted

---

## 14. UX Review Findings (July 2026)

A first-user review identified these prioritized improvements:

| Priority | Issue | Effort |
|----------|-------|--------|
| P0 | No first-run onboarding | Low |
| P1 | "Tenants" nav item is a dead end | Trivial |
| P1 | ~~3-tier service hierarchy confusing (global vs property vs room)~~ | ~~Medium~~ Done |
| P2 | Amber customization dot missing tooltip on rooms | Trivial |
| P2 | Rent payment dialog is dense with many service charges | Medium |
| P2 | No dashboard / overview page | High |
| P3 | Currency hardcoded by locale | Medium |
| P3 | No bulk service pricing application | Medium |

---

## 15. Long-Term Direction (Optional)

Extensions to consider **only after** core workflow is proven and loved:

- First-run onboarding (P0)
- Dashboard / overview page (P2)
- Tenant management
- Payment reminder notifications
- Data export (for accountants)
- Currency setting per property (P3)

**Critical rule:** No extension should compromise simplicity or add mental load.

---

## 16. Guiding Question (Always Ask)

Before building or changing anything:

> **Does this give landlords more clarity when they review rent payments?**

If the answer is not clearly "yes", don't build it.

---

**Product name:** Lumo  
**Domain:** https://lumo.homes  
**Audience:** Independent landlords managing 8–25 rooms  
**Promise:** Clarity about rent payments, without complexity
