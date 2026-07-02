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

### Service Management (3-Tier Hierarchy)

- **Global Service Catalog** — Reusable service templates (Electricity, Water, WiFi, Cleaning, Parking). Auto-seeded for new users via DB trigger. Customizable name, pricing type (flat/variable), and unit label.
- **Property-Level Services** — Activate/deactivate services per property with pricing overrides. Inline shelf for one-click activation from global catalog.
- **Room-Level Services** — Activate/deactivate services per room, cascaded from property services. Inline shelf with quick-add pills.

### Authentication & Data Model

- **Google OAuth** via Supabase. Session management with auth state synced across all stores.
- **Auth-Branching (Offline-First)** — The entire app works without signing in. All CRUD falls back to local state with generated UUIDs. Users can try the full experience before committing to auth. A dismissible banner reminds users their data is local-only when unauthenticated.

### Internationalization

- **English and Vietnamese.** Locale switching in header and footer. Server-side locale cookie persistence. All UI text and currency formatting localized.

### Marketing & Public Pages

- **Landing Page** — Hero, problems, features, pricing, CTA, footer sections.
- **Waitlist** — Email capture with duplicate detection and email notification via Resend.
- **Privacy Policy, Terms of Service** — Static legal pages.

### Cross-Cutting

- **Consistent empty/loading/error states** across every page.
- **Responsive design** — Desktop sidebar navigation, mobile bottom nav with tablet adaptation.
- **Service tooltips** — Hover tooltips explain service pricing and customization state.

---

## 6. Free vs Paid Thinking (Pending Validation)

> [!NOTE]
> Working hypothesis based on early survey data (4 responses, Jan 2026). Subject to change with more validation.

### Current Implementation

The marketing page shows two tiers:
- **Free** — All features, free during early access. "Get Early Access" button joins waitlist.
- **Pro** — Listed as "Coming Soon" with no pricing or feature details yet.

The one-time-payment / room-count-gating model described below is the current working hypothesis but has **not been implemented** — the implemented pricing page intentionally leaves details TBD.

### Strategic Thinking

**Goal:** Free tier proves value. Paid tier unlocks clarity at scale.

**Free tier should end before pain peaks.**
- At 5 rooms, landlords can still manage manually
- At 8+ rooms, uncertainty and mental load increase sharply
- Free tier stops at ~5 rooms so users can experience Lumo before manual tracking becomes stressful.

### Working Assumptions

**Free Tier (~5 rooms)**
- All core features included
- No time limit
- No feature gating
- Rationale: Build trust, prove simplicity, create habit

**Paid Upgrade (6+ rooms)**
- Triggered by room count, not features
- One-time payment (no subscriptions)
- Same features, more rooms
- Rationale: Clarity at scale is the unlock, not new features

**Why one-time payment?**
- Removes ongoing friction and decision fatigue
- Aligns with user mindset (landlords think in ownership)
- Simple to explain and justify

### Why Room Count?

- Natural upgrade moment (you feel the pain before hitting the limit)
- Aligns with user value (more rooms = more uncertainty = more value from Lumo)
- Easy to understand and explain
- No feature gating preserves simplicity

**Philosophy:** Free users are not failures. They are future upgrades, referrals, and proof that the product is simple enough.

---

## 7. Monetization Direction

### Payment Model (Working Hypothesis)
- **One-time payment** (no subscriptions)
- Price range: TBD (likely $20–60 USD)
- Unlocks additional capacity (assumed to be unlimited rooms)

### Upgrade Trigger
- Happens when user tries to create 6th room
- Presented calmly, not aggressively
- Clear value statement: "Manage all your rooms with clarity"

All pricing and thresholds are working hypotheses until validated by real usage. The implemented marketing page shows "Pricing will be announced soon."

---

## 8. Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (Radix primitives) |
| State | Zustand 5 with devtools |
| Validation | Zod 4 |
| Database/Auth | Supabase (Postgres + Google OAuth) |
| i18n | next-intl 4 |
| Email | Resend |
| Icons | lucide-react |
| Linting | Biome 2 |
| Testing | Vitest 4 + Testing Library (64 test files) |

---

## 9. Architecture & Conventions

- **App Router** — Public routes under `/[locale]/`, dashboard under `/dashboard/`, API under `/api/`.
- **Feature-based organization** — Dashboard code grouped by feature (properties, rooms, services, rent-payments). Each feature has its own Zustand store, types, components, and dialogs with barrel exports.
- **Auth-branching stores** — Every store operation checks `useAuthStore.getState().user`. If null, operations work on local state. Enables the offline-first experience.
- **Self-contained services** — `property_services` and `room_services` tables carry their own `service_name` and `pricing_type`. No FK to the global `services` table, allowing per-property/per-room customization.
- **No prop drilling** — Components access Zustand stores directly. UI state (dialog open/close) stays local.
- **Test co-location** — Every component, store, page, and API route has a co-located test file.
- **Dedup patterns** — Fetch deduplication guards prevent duplicate requests (critical with React StrictMode).

### DB Schema (8 tables)

`waitlist`, `properties`, `rooms`, `rent_payments`, `rent_payment_charges`, `services`, `property_services`, `room_services`

All tables have RLS enforcing `auth.uid() = user_id`. Electricity/Water auto-seeded for new users via Postgres trigger.

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
| P1 | 3-tier service hierarchy confusing (global vs property vs room) | Medium |
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
