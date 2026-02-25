# Saraya CMS — Project Logic & Architecture

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Model](#data-model)
5. [State Management (Zustand Stores)](#state-management)
6. [Multi-Restaurant Architecture](#multi-restaurant-architecture)
7. [Theme System](#theme-system)
8. [Internationalization (i18n)](#internationalization)
9. [Authentication & Authorization](#authentication--authorization)
10. [Page Routing & Data Flow](#page-routing--data-flow)
11. [LivePreview System](#livepreview-system)
12. [Order System](#order-system)
13. [Current Persistence (localStorage)](#current-persistence)

---

## Overview

**Saraya CMS** (branded "Bella Cucina" for the default venue) is a **multi-restaurant digital menu platform** built with Next.js 14. It allows restaurant owners to:

- Create and manage multiple venues (restaurants, cafes, bars, bakeries, etc.)
- Customize menus with categories, products, addons, and variations
- Apply 21 built-in theme presets with per-theme customizations
- Edit all page text content, component styles, and layout configuration
- Support bilingual content (English + Bosnian)
- Process table orders with status tracking
- Preview changes in real-time via an admin LivePreview iframe

All data is currently persisted in **localStorage** via Zustand's persist middleware. This document describes the architecture in preparation for migrating to **Supabase** (PostgreSQL + Auth + Storage).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.35 (App Router, "use client") |
| Language | TypeScript |
| Styling | TailwindCSS 3 + custom theme |
| State | Zustand 5.0.11 (persist middleware v3) |
| Animation | Framer Motion 12.34.3 |
| Icons | lucide-react |
| Carousel | Swiper 12.1.2 |
| UI | @headlessui/react |
| Currency | KM (Bosnian Convertible Mark) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (global styles, fonts)
│   ├── page.tsx                      # Landing / redirect
│   ├── [venue]/                      # Public menu pages (dynamic venue slug)
│   │   ├── layout.tsx                # Loads venue data → flat CMS store
│   │   ├── page.tsx                  # Main menu (hero, categories, products) ~691 lines
│   │   ├── cart/page.tsx             # Shopping cart
│   │   ├── checkout/page.tsx         # Order placement (table number, kitchen note)
│   │   └── product/[id]/page.tsx     # Product detail with variations/addons
│   └── admin/
│       ├── layout.tsx                # Sidebar nav + full-width detection ~495 lines
│       ├── page.tsx                  # Venue grid + creation modal ~778 lines
│       ├── [venue]/
│       │   ├── layout.tsx            # Venue data sync (switchRestaurant)
│       │   ├── page.tsx              # Role picker / login ~443 lines
│       │   ├── categories/page.tsx   # Category CRUD
│       │   ├── products/page.tsx     # Product CRUD + addons/variations
│       │   ├── page-content/page.tsx # Text content editing
│       │   ├── restaurant/page.tsx   # Restaurant info editing
│       │   ├── orders/page.tsx       # Order management
│       │   ├── users/page.tsx        # User/role management
│       │   └── restaurants/page.tsx  # Theme & layout config
│       └── (legacy routes)           # categories/, products/, etc. (backward compat)
├── components/
│   ├── admin/
│   │   ├── LivePreview.tsx           # Iframe preview with postMessage bridge ~254 lines
│   │   └── BsCollapse.tsx            # Collapsible BS (Bosnian) field toggle
│   ├── LanguageSwitcher.tsx          # EN/BS toggle (theme-aware)
│   ├── MenuItemCard.tsx              # Product card component
│   ├── MenuList.tsx                  # Product grid/list renderer
│   ├── OrderBar.tsx                  # Floating order summary bar
│   ├── OrderItem.tsx                 # Single order display
│   └── QuantitySelector.tsx          # +/- quantity control
├── data/
│   └── restaurants.ts                # Static seed data (Bella Cucina) ~513 lines
├── hooks/
│   ├── useCmsData.ts                 # SSR-safe + preview-aware data hook ~130 lines
│   └── useTranslation.ts            # i18n helper (t, tProduct, tCategory, etc.) ~105 lines
├── lib/
│   └── color-utils.ts               # Color manipulation utilities
├── store/
│   ├── cmsStore.ts                   # Main CMS store (THE core) ~2635 lines
│   ├── authStore.ts                  # Auth + user management ~220 lines
│   ├── cartStore.ts                  # Shopping cart (ephemeral) ~60 lines
│   ├── orderStore.ts                 # Order tracking ~80 lines
│   ├── adminStore.ts                 # Admin UI prefs (dark mode) ~30 lines
│   └── languageStore.ts             # Language selection ~25 lines
├── styles/
│   └── globals.css                   # Tailwind directives + custom animations
└── types/
    ├── cms.ts                        # Core CMS types ~414 lines
    ├── auth.ts                       # Auth types
    ├── cart.ts                       # Cart types
    ├── order.ts                      # Order types
    └── product.ts                    # Product types (subset of cms.ts)
```

---

## Data Model

### Core Entities

#### RestaurantInfo
The identity of a venue (name, branding, contact).

| Field | Type | Bilingual |
|-------|------|-----------|
| name | string | ✅ name_bs |
| tagline | string | ✅ tagline_bs |
| image | string (URL) | — |
| logo | string (URL) | — |
| address | string | ✅ address_bs |
| openHours | string | ✅ openHours_bs |
| wifi | string | — |
| phone | string | — |

#### CategoryInfo
Menu categories for organizing products.

| Field | Type | Bilingual |
|-------|------|-----------|
| id | string | — |
| label | string | ✅ label_bs |
| icon | string (emoji) | — |
| color | string (Tailwind gradient) | — |

#### ProductItem
Individual menu items.

| Field | Type | Bilingual |
|-------|------|-----------|
| id | string | — |
| restaurantId | string | — |
| name | string | ✅ name_bs |
| description | string | ✅ description_bs |
| price | number | — |
| image | string (URL) | — |
| category | string (category id) | — |
| popular | boolean | — |
| sortOrder | number | — |
| addons | Addon[] | — |
| variations | Variation[] | — |

#### Addon
Optional extras for a product.

| Field | Type | Bilingual |
|-------|------|-----------|
| id | string | — |
| name | string | ✅ name_bs |
| price | number | — |

#### Variation
A variation group (e.g., "Size", "Milk Type") for a product.

| Field | Type | Bilingual |
|-------|------|-----------|
| id | string | — |
| name | string | ✅ name_bs |
| required | boolean | — |
| options | VariationOption[] | — |

#### VariationOption
An option within a variation group.

| Field | Type | Bilingual |
|-------|------|-----------|
| id | string | — |
| label | string | ✅ label_bs |
| priceAdjustment | number | — |

#### PageContent (JSONB)
55+ customizable text fields organized by page section (menu, cart, checkout, product, order confirmation, promo, featured, social, footer). Every field has a `_bs` counterpart for Bosnian translation.

#### ComponentStyles (JSONB)
40+ design properties controlling every visual aspect: hero style, info bar, card style, section headers, category bar, order bar, product page, cart page, checkout page, general settings, promo banner, footer, and more.

#### LayoutConfig (JSONB)
Layout configuration including:
- **sections**: Array of 9 `MenuSectionItem` objects (id, visible, variant) controlling section order and visibility
- **Section variants**: HeroVariant (5), InfoBarVariant (4), SearchBarVariant (4), CategoryBarVariant (5), MenuContentVariant (5), OrderBarVariant (4), PromoBannerVariant (4), FeaturedVariant (3), SocialProofVariant (3), FooterVariant (4), ProductPageVariant (5)
- **pageLayout**: 'default' | 'wide' | 'compact'
- **typography**: headingFont, bodyFont, fontSize
- **animation**: 'smooth' | 'none' | 'playful' | 'elegant'
- **spacing**: sectionGap, contentPadding
- **activeTheme**: ThemePresetId (string)

#### ThemeCustomization
Per-theme overrides stored per venue. Structure: `Record<ThemePresetId, { componentStyles, layoutConfig, pageContent }>`.

### Auth Entities

#### AppUser
| Field | Type |
|-------|------|
| id | string |
| name | string |
| email | string |
| avatar | string? |
| platformRole | 'admin' \| 'user' |
| restaurantAccess | RestaurantAccess[] |
| createdAt | string (ISO) |

#### RestaurantAccess
| Field | Type |
|-------|------|
| restaurantId | string (venue slug) |
| role | 'manager' \| 'employee' |

### Order Entities

#### Order
| Field | Type |
|-------|------|
| id | string (ORD-{timestamp}-{random}) |
| items | CartItem[] |
| tableNumber | string |
| kitchenNote | string |
| total | number |
| itemCount | number |
| status | 'pending' \| 'preparing' \| 'ready' \| 'served' \| 'cancelled' |
| createdAt | string (ISO) |

#### CartItem
| Field | Type |
|-------|------|
| id | string (product id) |
| cartKey | string (unique per configuration) |
| name | string |
| price | number |
| quantity | number |
| image | string (URL) |
| selectedVariations | SelectedVariation[]? |

---

## State Management

### 6 Zustand Stores

| Store | localStorage Key | Version | Purpose |
|-------|-----------------|---------|---------|
| `cmsStore` | `bella-cucina-cms` | v3 | ALL CMS data — restaurants, products, categories, styles, layout, themes |
| `authStore` | `bella-cucina-auth` | — | Users, roles, active restaurant tracking |
| `cartStore` | *(not persisted)* | — | Ephemeral shopping cart |
| `orderStore` | `bella-cucina-orders` | — | Placed orders with status tracking |
| `adminStore` | `bella-cucina-admin` | — | Admin UI preferences (dark mode) |
| `languageStore` | `bella-cucina-language` | — | Active language (en/bs) |

### CMS Store — The Core (~2635 lines)

The CMS store uses a **dual structure**:

1. **Flat active fields** — `restaurant`, `categories`, `products`, `pageContent`, `componentStyles`, `layoutConfig`, `themeCustomizations` — used directly by all rendering pages and admin forms.

2. **`allRestaurants: Record<string, RestaurantData>`** — persisted map of ALL venues. Each entry contains the complete venue data.

**Bridge actions:**
- `switchRestaurant(fromId, toId)` — Saves flat fields → `allRestaurants[fromId]`, loads `allRestaurants[toId]` → flat fields. **Two-way sync.**
- `loadVenuePublic(slug)` — Loads `allRestaurants[slug]` → flat fields. **One-way, no save-back.** Used by public pages.
- `saveActiveToAllRestaurants(id)` — Snapshots flat fields → `allRestaurants[id]` without switching. Used by admin sub-pages after edits.

### Persist Migration (v1 → v2 → v3)

- **v1 → v2**: Wraps legacy flat-only data as `allRestaurants['bella-cucina']`
- **v2 → v3**: Adds `themeCustomizations` to all venues

---

## Multi-Restaurant Architecture

### Venue Types (8)
`restaurant`, `cafe`, `bar`, `bakery`, `food-truck`, `pizzeria`, `pub`, `lounge`

Each venue type provides:
- A unique hero image
- One default product category with bilingual labels
- Three sample products with EN + BS translations, images, and prices

### Venue Creation Flow
1. Admin clicks "Create Venue" → picks name, slug, venue type
2. `cmsStore.createRestaurant(slug, name, venueType)` creates the venue with type-specific defaults
3. `authStore.addUser()` creates 3 default users: Admin (platform admin), Manager, Employee
4. Each user gets `restaurantAccess` assigned to the new venue

### Venue Data Flow
```
Admin edits → flat store fields → saveActiveToAllRestaurants(slug) → allRestaurants[slug]
Public visit → allRestaurants[slug] → loadVenuePublic(slug) → flat store fields → useCmsData() → UI
```

---

## Theme System

### 21 Theme Presets
`bella-classic`, `modern-minimal`, `dark-elegance`, `vibrant-pop`, `rustic-italian`, `ocean-breeze`, `cozy-cafe`, `fresh-garden`, `warm-sunset`, `nordic-clean`, `tokyo-street`, `desert-sand`, `wine-bistro`, `french-patisserie`, `midnight-blue`, `tropical-paradise`, `steakhouse-grill`, `retro-diner`, `rooftop-lounge`, `art-deco`, `custom`

Each preset provides:
- `id`, `name`, `description`
- `preview`: { primary, secondary, accent, background }
- `styles`: Partial<ComponentStyles>
- `layout`: Partial<LayoutConfig>
- `content?`: Partial<PageContent>

### Theme Switching with State Preservation
When switching themes via `applyTheme(themeId)`:
1. Current style/layout/content is saved under `themeCustomizations[currentThemeId]`
2. If the new theme has saved customizations, those are loaded
3. If not, theme preset defaults are applied
4. `layoutConfig.activeTheme` is updated

This means **per-theme customizations are preserved** when switching back and forth.

---

## Internationalization

### Bilingual Support: EN (default) + BS (Bosnian)

Every translatable field has a `_bs` suffix counterpart:
- `name` / `name_bs`, `description` / `description_bs`, `label` / `label_bs`, etc.
- PageContent has 55+ fields, each with a `_bs` variant

### Translation Hook (`useTranslation`)
```typescript
const { t, tProduct, tCategory, tRestaurant, tAddon, tVariation, lang } = useTranslation();
t(pageContent, "welcomeTitle")    // → BS value if lang=bs & exists, else EN
tProduct(product, "name")          // → product.name_bs or product.name
tCategory(category)                // → category.label_bs or category.label
```

### Language Store
Simple toggle between `'en'` and `'bs'`, persisted to localStorage.

---

## Authentication & Authorization

### Roles
- **Platform Role**: `admin` (full access to all venues) | `user` (access per assignment)
- **Restaurant Role**: `manager` (full venue control) | `employee` (limited access)
- Platform admins are implicitly treated as `manager` on all venues

### Auth Flow
1. Admin page shows venue grid → click venue → role picker page
2. User "logs in" by selecting their identity (no password — demo/local auth)
3. `authStore.currentUserId` is set, `authStore.activeRestaurantId` tracks current venue
4. Venue admin layout checks auth on sub-pages; role picker page is public

### Seed Users (per venue creation)
Each new venue auto-creates 3 users:
- `{slug}-admin` — Platform admin
- `{slug}-manager` — Venue manager
- `{slug}-employee` — Venue employee

---

## Page Routing & Data Flow

### Public Pages (`/[venue]/*`)

```
[venue]/layout.tsx
  → Validates slug exists in allRestaurants
  → Calls loadVenuePublic(slug) — one-way load into flat store
  → Renders LanguageSwitcher + children

[venue]/page.tsx
  → useCmsData() hook — returns hydration-safe, preview-aware data
  → useTranslation() — i18n helpers
  → Renders: Hero, InfoBar, SearchBar, CategoryBar, MenuContent, OrderBar, PromoBanner, Featured, SocialProof, Footer
  → Each section has configurable variants (e.g., HeroVariant 1-5)
  → Section visibility and order controlled by layoutConfig.sections[]

[venue]/product/[id]/page.tsx
  → Finds product by ID from useCmsData().products
  → Shows variations, addons, quantity selector
  → Adds to cart via cartStore

[venue]/cart/page.tsx
  → Reads cartStore items
  → Shows total, quantity controls

[venue]/checkout/page.tsx
  → Table number + kitchen note input
  → Creates order via orderStore.addOrder()
  → Clears cart
```

### Admin Pages (`/admin/*`)

```
admin/layout.tsx
  → Sidebar with navigation links
  → Detects full-width pages (no LivePreview panel)
  → Dark mode via adminStore

admin/page.tsx
  → Venue grid: cards showing all restaurants
  → "Create Venue" modal with name/slug/type
  → Stats dashboard (cross-venue aggregates)

admin/[venue]/layout.tsx
  → Syncs venue data: switchRestaurant(from, to) or loadVenuePublic(slug)
  → Auth gate for sub-pages

admin/[venue]/page.tsx
  → Role picker: shows venue users, allows "login"

admin/[venue]/products/page.tsx
  → Product CRUD with addons/variations editors
  → Calls cmsStore.addProduct, updateProduct, removeProduct
  → Calls saveActiveToAllRestaurants(slug) after changes

admin/[venue]/categories/page.tsx
  → Category CRUD with icon/color pickers
  
admin/[venue]/page-content/page.tsx
  → Text editing for all PageContent fields (with BsCollapse for BS translations)
  
admin/[venue]/restaurant/page.tsx
  → RestaurantInfo editing (name, tagline, image, etc.)
  
admin/[venue]/restaurants/page.tsx (theme/layout config)
  → Theme preset selection, layout config, typography, spacing, animation
  
admin/[venue]/orders/page.tsx
  → Order list with status management
  
admin/[venue]/users/page.tsx
  → User management, role assignment
```

---

## LivePreview System

The admin layout includes a `LivePreview` component that renders the public menu page in an iframe.

### Communication Flow
```
Admin Page ──(postMessage)──→ iframe (public page)
                              ↓
                        useCmsData() hook detects iframe context
                        listens for 'cms-preview-update' messages
                              ↓
                        Applies preview overrides (products, categories,
                        restaurant, pageContent, componentStyles, layoutConfig)
                              ↓
                        Sends 'cms-preview-ready' back to parent
```

The LivePreview sends the **complete** current flat store state (including products, categories, and restaurant info) to the iframe, so every change is visible in real-time.

---

## Order System

### Flow
1. Customer adds items to cart (with optional variations/addons)
2. Cart totals computed from `price × quantity + variation adjustments`
3. At checkout: table number + kitchen note → `orderStore.addOrder()`
4. Order ID format: `ORD-{timestamp}-{3-digit-random}`
5. Order status progresses: `pending → preparing → ready → served` (or `cancelled`)
6. Admin orders page shows all orders with status controls

### Cart Key
Each cart item gets a unique `cartKey` combining the product ID with selected variations, ensuring the same product with different variation choices appears as separate line items.

---

## Current Persistence (localStorage)

| Key | Store | Schema Version | Content |
|-----|-------|---------------|---------|
| `bella-cucina-cms` | cmsStore | v3 | All restaurants map + flat active fields |
| `bella-cucina-auth` | authStore | — | Users, current user, active restaurant |
| `bella-cucina-orders` | orderStore | — | All orders |
| `bella-cucina-admin` | adminStore | — | Dark mode pref |
| `bella-cucina-language` | languageStore | — | Language (en/bs) |

**Total data footprint** in localStorage can grow significantly with many venues, as each venue stores complete pageContent (110+ fields), componentStyles (40+ fields), layoutConfig, and themeCustomizations.

**This is the primary motivation for migrating to Supabase** — moving from client-side localStorage to a proper PostgreSQL database with:
- Scalable multi-tenant storage
- Real authentication (Supabase Auth)
- Row-Level Security (RLS) for authorization
- Image storage (Supabase Storage)
- Real-time subscriptions for live updates
- Server-side data access
