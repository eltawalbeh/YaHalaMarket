# Ya Hala Market

**market.yahala.co** — Arabic-first bilingual travel packages marketplace.

This repository contains the React + TypeScript + Vite foundation.  
No backend, no auth, no payments — placeholder scaffolding only.

---

## Structure

```
src/
  app/              Application entry, React Router, context providers
    providers/      LangContext (RTL/i18n), AuthContext (mock)
  pages/
    public/         B2C market pages (Market, Offers, OfferDetail, Quote, Legal)
    dashboard/      B2B ops dashboard (Login, Home, Offers, OfferWizard,
                    Hotels, Leads, Quotes, Reports, Team, AuditLog, Settings)
  components/
    ui/             Primitive UI: Badge, Button, Card
    shared/         Cross-context: LanguageToggle
    public/         PublicNav, PublicLayout
    dashboard/      DashboardSidebar, DashboardLayout
  features/         Feature barrels — grow into hooks + components per domain
    offers / hotels / leads / quotes / users / notifications
  types/            TypeScript interfaces (Offer, Hotel, Lead, Quote, User,
                    AuditLogEntry, Notification)
  services/         Service interfaces + local mock implementations
                    (swap for Supabase calls in Phase 2)
  lib/
    constants.ts    Status enums with AR/EN labels and badge colors
    routes.ts       Centralised route paths (PUBLIC_ROUTES, DASHBOARD_ROUTES)
    utils.ts        formatPrice, formatDate, slugify, cx, …
    i18n.ts         Minimal translation map + t() helper
  data/             Realistic mock data (offers, hotels, leads, users, audit log)
  styles/
    tokens.css      CSS custom properties — brand colors, typography, sidebar
    rtl.css         RTL overrides and numerals-latin utility
```

---

## Routing

| Path | Page |
|------|------|
| `/` | Market (public) |
| `/offers` | All published offers |
| `/offers/:slug` | Offer detail |
| `/q/:token` | Personalised quote (public) |
| `/legal` | Legal / T&C |
| `/login` | Dashboard login (mock) |
| `/dashboard` | Dashboard home |
| `/dashboard/offers` | Offer list |
| `/dashboard/offers/new` | Offer wizard |
| `/dashboard/hotels` | Hotel directory |
| `/dashboard/leads` | Lead pipeline |
| `/dashboard/quotes` | Quote management |
| `/dashboard/reports` | Reports |
| `/dashboard/team` | Team members |
| `/dashboard/audit-log` | Audit log |
| `/dashboard/settings` | Settings |

---

## Language & RTL

- Default language: **Arabic** (`lang="ar"`, `dir="rtl"`)
- Toggle via `LanguageToggle` or `useLang().setLang('en')`
- Fonts: **Noto Sans Arabic** (Arabic), **Inter** (Latin), **JetBrains Mono** (data)
- Add translations to `src/lib/i18n.ts`

---

## Status constants

Defined in `src/lib/constants.ts` with bilingual labels and badge colours.

| Domain | Statuses |
|--------|----------|
| Offer | Draft · In Review · Published · Expired · Archived |
| Lead | New · Assigned · Contacted · Quote in Progress · Quote Sent · Follow-up · Sold · Lost |
| Quote | Draft · Sent · Viewed · Under Discussion · Accepted · Expired · Withdrawn |

---

## Roles

`super_admin` · `manager` · `staff`  
Role checks live in `src/types/user.ts`; RBAC enforcement deferred to Phase 2.

---

## Future phases

| Phase | Work |
|-------|------|
| 2 | Supabase: auth, Postgres, Row-Level Security, realtime notifications |
| 3 | Full offer wizard, hotel management CRUD |
| 4 | Lead pipeline UI, quote builder, PDF export |
| 5 | WhatsApp integration (Twilio / 360dialog) |
| 6 | AI offer suggestions, smart lead scoring |
| 7 | Payments (Tabby, Tamara, Stripe) |
| 8 | Analytics dashboard, reporting engine |

---

## Development

```bash
pnpm install
pnpm dev        # Vite dev server (already running in Figma Make)
pnpm build
```
