# Saraya CMS — Complete Project Documentation

> **Project:** Saraya Digital Menu CMS  
> **Stack:** Next.js 14 · React 18 · TypeScript · Zustand · Tailwind CSS · Framer Motion  
> **Persistence:** Browser localStorage (no backend/database)  
> **Generated:** February 2026

---

## Table of Contents

1. [Project Goal & Overview](#1-project-goal--overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Directory Structure](#3-directory-structure)
4. [URL Routing & Slug System](#4-url-routing--slug-system)
5. [Multi-Restaurant Architecture](#5-multi-restaurant-architecture)
6. [Role & Authentication System](#6-role--authentication-system)
7. [CMS Data Model (Types)](#7-cms-data-model-types)
8. [State Management (Stores)](#8-state-management-stores)
9. [Theme System & Presets](#9-theme-system--presets)
10. [Admin Panel — Full Walkthrough](#10-admin-panel--full-walkthrough)
11. [Public Menu Pages — Full Walkthrough](#11-public-menu-pages--full-walkthrough)
12. [Bilingual System (EN / BS)](#12-bilingual-system-en--bs)
13. [Live Preview System](#13-live-preview-system)
14. [Ordering Flow (Cart → Checkout → Confirmed)](#14-ordering-flow-cart--checkout--confirmed)
15. [Color Utilities & Theming Engine](#15-color-utilities--theming-engine)
16. [Component Reference](#16-component-reference)
17. [Build & Development](#17-build--development)

---

## 1. Project Goal & Overview

Saraya CMS is a **fully client-side, multi-restaurant digital menu system**. Its purpose is to allow restaurant owners (or a platform admin) to:

1. **Create venues** (restaurants, cafés, bars, bakeries, food trucks, pizzerias, pubs, lounges)
2. **Build a digital menu** for each venue — categories, products with add-ons/variations, prices, images
3. **Customize every visual aspect** — colors, fonts, layouts, section ordering, hero variants, card styles, animations
4. **Choose from 20 ready-made themes** — one-click complete redesign with full bilingual content
5. **Edit all frontend text** in English and Bosnian (121 translatable fields per venue)
6. **Publish the menu at a unique URL** — customers scan a QR code / visit `/{venue-slug}` to browse
7. **Accept dine-in orders** — customers select a table, add items, and send to kitchen
8. **Manage orders** — employees see incoming orders and progress them through statuses

**Key constraint:** Everything is stored in the browser's `localStorage`. There is no backend server, no database, no API calls. This makes the system a **self-contained CMS demo / prototype** suitable for local deployment on a single device (e.g., a tablet at the counter).

### How It Works End-to-End

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                                  │
│  /admin                    → Venue picker (create/delete venues)     │
│  /admin/{slug}             → Login / role picker for that venue      │
│  /admin/{slug}/restaurant  → Edit venue name, image, contact info    │
│  /admin/{slug}/products    → Manage products & categories            │
│  /admin/{slug}/page-content→ CMS editor: text, design, themes        │
│  /admin/{slug}/orders      → Live order management dashboard         │
│  /admin/{slug}/users       → User & role administration (admin only) │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ saves to localStorage
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       PUBLIC MENU PAGES                               │
│  /                         → Venue discovery page (all restaurants)   │
│  /{slug}                   → Restaurant's full digital menu           │
│  /{slug}/product/{id}      → Product detail page (add-ons, qty)      │
│  /{slug}/cart              → Cart page (review items)                │
│  /{slug}/checkout          → Checkout (table selection, confirm)     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack & Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.2.35 | React framework (App Router, file-system routing) |
| `react` / `react-dom` | 18.3.1 | UI library |
| `typescript` | 5.9.3 | Static typing |
| `zustand` | 5.0.11 | State management with `persist` middleware (localStorage) |
| `tailwindcss` | 3.4.19 | Utility-first CSS |
| `framer-motion` | 12.34.3 | Animation library |
| `lucide-react` | 0.575.0 | Icon library |
| `clsx` | 2.1.1 | Conditional CSS class merging |
| `@headlessui/react` | 2.2.9 | Accessible UI primitives |
| `swiper` | 12.1.2 | Touch slider component |

**Design tokens** (from `tailwind.config.js`):
- Primary color: `#F4B400` (gold)
- Background: `#F7F7F7`
- Dark text: `#1E1E1E`
- Muted: `#777777`
- Accent green: `#22C55E`, red: `#EF4444`, blue: `#3B82F6`
- Custom shadows: `shadow-soft`, `shadow-card`, `shadow-elevated`, `shadow-glow`
- Font: Inter (loaded from Google Fonts)

---

## 3. Directory Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout (HTML, fonts, max-width container)
│   ├── page.tsx                            # "/" — Public venue discovery page
│   ├── [venue]/                            # Public menu pages (dynamic venue slug)
│   │   ├── layout.tsx                      # Loads venue data from store, language switcher
│   │   ├── page.tsx                        # "/{slug}" — Full menu page (691 lines)
│   │   ├── cart/page.tsx                   # "/{slug}/cart" — Cart page
│   │   ├── checkout/page.tsx               # "/{slug}/checkout" — Checkout & confirmation
│   │   └── product/[id]/page.tsx           # "/{slug}/product/{id}" — Product detail
│   └── admin/
│       ├── layout.tsx                      # Admin shell (sidebar, header, auth gate)
│       ├── page.tsx                        # "/admin" — Venue grid + create/delete
│       ├── page-content/page.tsx           # Standalone page-content editor (not venue-specific)
│       ├── categories/page.tsx             # Standalone category editor
│       ├── products/page.tsx               # Standalone product editor
│       ├── restaurant/page.tsx             # Standalone restaurant info editor
│       └── [venue]/                        # Venue-specific admin pages
│           ├── layout.tsx                  # Syncs URL venue → store active restaurant
│           ├── page.tsx                    # Login / role picker for venue
│           ├── restaurant/page.tsx         # Edit venue info (name, image, contact)
│           ├── products/page.tsx           # Products & categories editor (991 lines)
│           ├── page-content/page.tsx       # CMS editor: text, design, themes (1600+ lines)
│           ├── categories/page.tsx         # Categories editor (247 lines)
│           ├── orders/page.tsx             # Order management dashboard (663 lines)
│           ├── users/page.tsx              # Users & roles management
│           └── restaurants/page.tsx        # Redirect stub → /admin
├── components/
│   ├── MenuList.tsx                        # Grouped product list with section headers
│   ├── MenuItemCard.tsx                    # Individual product card (vertical/horizontal)
│   ├── OrderBar.tsx                        # Floating cart bar at bottom of menu
│   ├── OrderItem.tsx                       # Single cart item row
│   ├── QuantitySelector.tsx                # +/− quantity control
│   ├── LanguageSwitcher.tsx                # EN/BA floating toggle
│   └── admin/
│       ├── LivePreview.tsx                 # Phone/tablet preview iframe
│       └── BsCollapse.tsx                  # Collapsible Bosnian translation field
├── store/
│   ├── cmsStore.ts                         # Main CMS store (~4480 lines) — all venue data
│   ├── authStore.ts                        # User authentication & roles
│   ├── cartStore.ts                        # Shopping cart state
│   ├── orderStore.ts                       # Order management
│   ├── languageStore.ts                    # EN/BS language toggle
│   └── adminStore.ts                       # Admin UI preferences (dark mode)
├── types/
│   ├── cms.ts                              # CMS interfaces (PageContent, ComponentStyles, LayoutConfig, etc.)
│   ├── auth.ts                             # Auth interfaces (AppUser, RestaurantRole, etc.)
│   ├── cart.ts                             # CartItem, SelectedVariation
│   ├── order.ts                            # Order, OrderStatus
│   └── product.ts                          # Product, Addon, Variation
├── hooks/
│   ├── useCmsData.ts                       # Central hook for resolved CMS data
│   └── useTranslation.ts                   # EN/BS translation helpers
├── lib/
│   └── color-utils.ts                      # isDark, contrastText, mutedText, etc.
├── data/
│   └── restaurants.ts                      # Empty SSR placeholder data
└── styles/
    └── globals.css                          # Tailwind base + custom utilities
```

---

## 4. URL Routing & Slug System

The application uses Next.js App Router with **dynamic segments** (`[venue]`, `[id]`).

### Public Routes

| URL Pattern | File | Purpose |
|-------------|------|---------|
| `/` | `app/page.tsx` | **Venue Discovery** — grid of all created venues, searchable |
| `/{slug}` | `app/[venue]/page.tsx` | **Restaurant Menu** — full CMS-driven menu page |
| `/{slug}/product/{id}` | `app/[venue]/product/[id]/page.tsx` | **Product Detail** — variations, add-ons, add to cart |
| `/{slug}/cart` | `app/[venue]/cart/page.tsx` | **Cart** — review items, see total |
| `/{slug}/checkout` | `app/[venue]/checkout/page.tsx` | **Checkout** — select table, add kitchen note, confirm |

### Admin Routes

| URL Pattern | File | Purpose |
|-------------|------|---------|
| `/admin` | `app/admin/page.tsx` | **Venue Grid** — create/delete venues, global stats |
| `/admin/{slug}` | `app/admin/[venue]/page.tsx` | **Login Page** — select user, enter credentials |
| `/admin/{slug}/restaurant` | `app/admin/[venue]/restaurant/page.tsx` | **Venue Info Editor** |
| `/admin/{slug}/products` | `app/admin/[venue]/products/page.tsx` | **Products & Categories Editor** |
| `/admin/{slug}/page-content` | `app/admin/[venue]/page-content/page.tsx` | **CMS Editor** — text, design, themes |
| `/admin/{slug}/categories` | `app/admin/[venue]/categories/page.tsx` | **Categories Editor** |
| `/admin/{slug}/orders` | `app/admin/[venue]/orders/page.tsx` | **Orders Dashboard** |
| `/admin/{slug}/users` | `app/admin/[venue]/users/page.tsx` | **Users & Roles** (admin only) |

### How Slugs Work

1. **Venue slug = restaurant ID.** When creating a venue, the admin types a name (e.g., "Bella Cucina"), and a slug is auto-generated (e.g., `bella-cucina`). The slug is editable before creation.

2. **The slug is the key in `allRestaurants`.** The store's `allRestaurants` is a `Record<string, RestaurantData>` where keys are slugs. Example: `allRestaurants["bella-cucina"]` holds all data for that venue.

3. **Public access:** A customer visits `/{slug}` (e.g., `/bella-cucina`). The venue layout (`app/[venue]/layout.tsx`) extracts the slug from the URL, checks if `allRestaurants[slug]` exists, calls `loadVenuePublic(slug)` to load that venue's data into the flat store fields, and renders the menu.

4. **Admin access:** Navigating to `/admin/{slug}` shows the login page for that venue. After login, all admin sub-routes under `/admin/{slug}/...` operate on that venue's data.

5. **Venue switching:** Within the admin panel, a dropdown in the sidebar lets you switch to a different venue. This calls `switchRestaurant(oldSlug, newSlug)`, which saves the current data back to `allRestaurants[oldSlug]` and loads `allRestaurants[newSlug]` into the flat fields.

6. **Non-existent slugs:** If someone visits `/{slug}` and the slug doesn't exist in `allRestaurants`, they are redirected to `/` (venue discovery). Similarly, `/admin/{slug}` redirects to `/admin` if the slug is unknown.

---

## 5. Multi-Restaurant Architecture

### Data Storage Model

The `cmsStore` uses a **flat + archive** pattern:

```
cmsStore
├── restaurant        ← Active venue's info (RestaurantInfo)
├── categories        ← Active venue's categories (CategoryInfo[])
├── products          ← Active venue's products (ProductItem[])
├── pageContent       ← Active venue's text content (PageContent)
├── componentStyles   ← Active venue's visual styles (ComponentStyles)
├── layoutConfig      ← Active venue's layout config (LayoutConfig)
├── themeCustomizations ← Active venue's per-theme overrides
│
└── allRestaurants    ← Archive of ALL venues
    ├── "bella-cucina"  → { venueType, restaurant, categories, products, pageContent, componentStyles, layoutConfig, themeCustomizations, createdAt }
    ├── "ocean-cafe"    → { ... }
    └── "night-bar"     → { ... }
```

**"Flat fields"** are the **active workspace**. All admin editors read from and write to these flat fields. When you switch venues:

1. **Save:** Current flat fields → `allRestaurants[currentVenueSlug]`
2. **Load:** `allRestaurants[newVenueSlug]` → flat fields

### Creating a Venue

`createRestaurant(slug, name, venueType)`:
- Creates a new entry in `allRestaurants[slug]` with:
  - Venue-type-aware seed data (hero image, 1 themed category, 3 sample products)
  - 3 default categories: "all" (🍽️ All Items), "popular" (🔥 Popular), and 1 venue-specific category
  - Default `pageContent`, `componentStyles`, `layoutConfig`
  - Empty `themeCustomizations`
- Also creates 3 default users (Admin, Manager, Employee) for that venue

### Venue-Type Seed Data

Each of the 8 venue types gets unique sample products:

| Venue Type | Category | Sample Products |
|------------|----------|-----------------|
| Restaurant | Main Course | Grilled Chicken, Beef Steak, Caesar Salad |
| Café | Coffee | Cappuccino, Latte Macchiato, Cheesecake |
| Bar | Cocktails | Mojito, Aperol Spritz, Craft Beer |
| Bakery | Pastries | Croissant, Sourdough Bread, Cinnamon Roll |
| Food Truck | Street Food | Loaded Tacos, Smash Burger, Loaded Fries |
| Pizzeria | Pizza | Margherita, Quattro Formaggi, Diavola |
| Pub | Classics | Fish & Chips, Nachos Supreme, Chicken Wings |
| Lounge | Signature | Truffle Bruschetta, Tuna Tartare, Espresso Martini |

### Saving Changes

Whenever an admin edits something (product, style, text), they click "Save" which:
1. Writes to the flat store fields (`updatePageContent(...)`, etc.)
2. Calls `saveActiveToAllRestaurants(venueSlug)` to persist into the venue's archive entry
3. Zustand's `persist` middleware writes the entire store to `localStorage` under key `"saraya-cms"`

---

## 6. Role & Authentication System

### Two-Tier Role Model

```
┌────────────────────────────────────────────┐
│            PLATFORM ROLES                   │
│  (Saraya-level, across all venues)          │
│                                             │
│  admin  — Full control over everything      │
│  user   — Limited to assigned restaurants   │
└────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────┐
│          RESTAURANT ROLES                   │
│  (Per-venue, assigned to each user)         │
│                                             │
│  manager  — Edit prices, categories,        │
│             products, page content, themes   │
│  employee — View and manage orders only     │
└────────────────────────────────────────────┘
```

### Platform Roles

| Role | Can See | Can Do |
|------|---------|--------|
| **admin** | All venues, all admin pages | Create/delete venues, manage users, edit everything. Implicitly has `manager` access on every venue. |
| **user** | Only assigned venues | Access only their assigned venues with the role given (manager or employee). |

### Restaurant Roles

| Role | Admin Nav Items Visible | Capabilities |
|------|------------------------|--------------|
| **manager** | Restaurant, Products, Page Content, Orders, Venues | Full editing: change prices, manage categories/products, customize design, view orders |
| **employee** | Orders, Venues | View and manage orders only. Cannot edit menu or design. |

### Authentication Flow

1. User navigates to `/admin` → sees **Venue Grid** (all venues listed)
2. Clicks "Enter Venue" on a venue card → navigates to `/admin/{slug}`
3. **Login page** shows:
   - Manual email/password form
   - Quick-select cards for all users with access to this venue
4. Authentication is **simulated** — passwords are hardcoded (`admin@saraya.dev` → `admin123`, everything else → `password`)
5. On successful login:
   - `authStore.login(userId)` sets `currentUserId`
   - `authStore.setActiveRestaurant(slug)` sets `activeRestaurantId`
   - Venue data loaded via `loadVenuePublic(slug)` or `switchRestaurant()`
   - Redirect to `/admin/{slug}/restaurant`

### Seed Users

On first load, one user exists:

| Name | Email | Platform Role | Avatar |
|------|-------|---------------|--------|
| Saraya Admin | admin@saraya.dev | admin | 👑 |

When creating a new venue, 3 additional users are auto-created for that venue:
- `{VenueName} Admin` (platformRole: user, restaurantRole: manager)
- `{VenueName} Manager` (platformRole: user, restaurantRole: manager)
- `{VenueName} Employee` (platformRole: user, restaurantRole: employee)

### Auth Store Data

```typescript
interface AuthState {
  users: AppUser[];                    // All platform users
  currentUserId: string | null;        // Logged-in user
  activeRestaurantId: string | null;   // Currently active venue slug

  // Auth
  login(userId: string): void;
  logout(): void;
  setActiveRestaurant(id: string): void;

  // User CRUD
  addUser(user): void;
  updateUser(id, data): void;
  removeUser(id): void;

  // Role management
  assignRestaurantRole(userId, restaurantId, role): void;
  removeRestaurantAccess(userId, restaurantId): void;

  // Selectors
  getCurrentUser(): AppUser | null;
  getUserRestaurantRole(userId, restaurantId): RestaurantRole | null;
  getAccessibleRestaurantIds(userId): string[];
  canAccessRestaurant(userId, restaurantId): boolean;
}
```

Persisted to localStorage under key `"saraya-auth"`.

---

## 7. CMS Data Model (Types)

All type definitions live in `src/types/`.

### RestaurantInfo
Basic venue information edited in the "Restaurant" admin page.

| Field | Type | Bilingual |
|-------|------|-----------|
| `name` | string | ✅ |
| `tagline` | string | ✅ |
| `image` | string (URL) | — |
| `logo` | string (URL) | — |
| `address` | string | ✅ |
| `openHours` | string | ✅ |
| `wifi` | string | — |
| `phone` | string | — |

### CategoryInfo
Menu categories that organize products.

| Field | Type | Bilingual |
|-------|------|-----------|
| `id` | string (slug) | — |
| `label` | string | ✅ |
| `icon` | string (emoji) | — |
| `color` | string (Tailwind gradient) | — |

### ProductItem
Individual menu items.

| Field | Type | Bilingual |
|-------|------|-----------|
| `id` | string | — |
| `restaurantId` | string | — |
| `name` | string | ✅ |
| `description` | string | ✅ |
| `price` | number | — |
| `image` | string (URL) | — |
| `category` | string (category label) | — |
| `addons` | Addon[] | — |
| `variations` | Variation[] | — |
| `popular` | boolean | — |
| `sortOrder` | number | — |

### Addon
Extra items that can be added to a product (e.g., extra cheese).

| Field | Type | Bilingual |
|-------|------|-----------|
| `id` | string | — |
| `name` | string | ✅ |
| `price` | number | — |

### Variation & VariationOption
Product variants (e.g., Size: Small/Medium/Large).

| Field | Type | Bilingual |
|-------|------|-----------|
| `Variation.name` | string (e.g., "Size") | ✅ |
| `Variation.required` | boolean | — |
| `VariationOption.label` | string (e.g., "Large") | ✅ |
| `VariationOption.priceAdjustment` | number | — |

### PageContent (121 fields)
All editable frontend text, organized into sections:

| Section | Example Fields |
|---------|----------------|
| **Menu Page** | `welcomeTitle`, `welcomeDescription`, `dineInLabel`, `searchPlaceholder`, `currencySymbol` |
| **Badges** | `popularBadgeText`, `customizableBadgeText` |
| **Order Bar** | `orderBarViewText`, `orderBarItemAddedText` |
| **Cart Page** | `cartTitle`, `emptyCartTitle`, `emptyCartDescription`, `browseMenuText`, `addMoreItemsText`, `orderSummaryTitle`, `dineInServiceNote`, `placeOrderText`, `clearButtonText` |
| **Checkout** | `confirmOrderTitle`, `confirmOrderSubtitle`, `tableCount`, `yourTableTitle`, `yourTableDescription`, `kitchenNoteTitle`, `kitchenNotePlaceholder`, `sendToKitchenText`, `selectTableText` |
| **Order Confirmed** | `orderSentTitle`, `orderReceivedText`, `preparingFoodText`, `comingToTableText`, `estimatedWaitText`, `backToMenuText`, `orderMoreNote` |
| **Product Page** | `itemNotFoundText`, `popularChoiceText`, `basePriceLabel`, `customizeSectionTitle`, `addToOrderText`, `addedToOrderText`, `moreCategoryPrefix` |
| **Menu List** | `noItemsFoundText`, `noItemsFoundHint`, `itemsAvailableText`, `itemsFoundText` |
| **Promo Banner** | `promoBannerText`, `promoBannerSubtext` |
| **Featured Section** | `featuredSectionTitle`, `featuredSectionSubtitle` |
| **Social Proof** | `socialProofText`, `socialProofRating`, `socialProofCount` |
| **Footer** | `footerText`, `footerSubtext` |

Every string field (except `currencySymbol`, `tableCount`, `socialProofRating`) has an optional `_bs` Bosnian counterpart.

### ComponentStyles
Visual styling controls (colors, layouts, toggle switches).

| Category | Fields |
|----------|--------|
| **Hero Banner** | `heroHeight`, `heroTextAlign`, `heroOverlay`, `heroMediaType`, `heroImageUrl`, `heroVideoUrl` |
| **Info Bar** | `infoBarBgColor`, `infoBarTextColor`, `infoBarVisible` |
| **Menu Cards** | `cardLayout`, `cardImagePosition`, `cardBgColor`, `cardTitleColor`, `cardDescriptionColor`, `cardPriceColor`, `cardBorderRadius`, `cardShadow` |
| **Section Headers** | `sectionTitleAlign`, `sectionTitleColor`, `sectionSubtitleColor`, `sectionShowDivider`, `sectionShowIcon`, `sectionShowHeaders`, `sectionDividerColor` |
| **Category Bar** | `categoryBarBgColor`, `categoryBarSticky`, `categoryBarShowIcons` |
| **Order Bar** | `orderBarStyle`, `orderBarBgColor`, `orderBarTextColor` |
| **Product Page** | `productCardBgColor`, `productTitleColor`, `productDescriptionColor`, `productPriceColor`, `productImagePosition`, `productPageBgColor`, `productButtonBgColor`, `productButtonTextColor`, `productStickyBarBgColor`, `productAddonBgColor`, `productAddonActiveBorderColor`, `productQuantityBgColor`, `productRelatedBgColor` |
| **Cart Page** | `cartPageBgColor`, `cartCardBgColor`, `cartTitleColor`, `cartAccentColor` |
| **Checkout Page** | `checkoutPageBgColor`, `checkoutCardBgColor`, `checkoutAccentColor` |
| **General** | `menuPageBgColor`, `buttonStyle`, `viewOnlyMode` |
| **Promo Banner** | `promoBannerBgColor`, `promoBannerTextColor` |
| **Footer** | `footerBgColor`, `footerTextColor` |

### LayoutConfig
Page structure, section ordering, typography, and animation settings.

| Category | Fields |
|----------|--------|
| **Section Order** | `sections: MenuSectionItem[]` — array of `{id, visible, variant}` defining render order |
| **Section Variants** | `heroVariant`, `infoBarVariant`, `searchBarVariant`, `categoryBarVariant`, `menuContentVariant`, `orderBarVariant`, `promoBannerVariant`, `featuredVariant`, `socialProofVariant`, `footerVariant`, `productPageVariant` |
| **Page Layout** | `pageLayout` (standard / sidebar / magazine / compact / fullWidth) |
| **Typography** | `headingFont`, `bodyFont`, `baseFontSize` |
| **Animation** | `animationStyle` (none / subtle / smooth / playful / dramatic) |
| **Spacing** | `contentDensity`, `cardGap` |
| **Theme** | `activeTheme` — current theme preset ID |

### MenuSectionItem
Defines the order and visibility of each menu page section.

| Field | Type | Description |
|-------|------|-------------|
| `id` | MenuSectionId | One of: `hero`, `infoBar`, `promoBanner`, `searchBar`, `categoryBar`, `featuredSection`, `menuContent`, `socialProof`, `footer` |
| `visible` | boolean | Whether the section is rendered |
| `variant` | string | Visual variant for the section |

---

## 8. State Management (Stores)

All stores use **Zustand** with optional `persist` middleware (localStorage).

### CmsStore (`cmsStore.ts`) — ~4480 lines
**Key:** `"saraya-cms"` | **Version:** 4

The largest and most critical store. Contains:
- All venue data (`allRestaurants` map)
- Active workspace (flat fields)
- 20 theme presets
- All CRUD operations for venues, products, categories, page content, styles, layout
- Multi-restaurant switching logic

See [Section 5](#5-multi-restaurant-architecture) for details.

### AuthStore (`authStore.ts`)
**Key:** `"saraya-auth"`

Manages users, login state, and role assignments. See [Section 6](#6-role--authentication-system).

### CartStore (`cartStore.ts`)
**Key:** Not persisted (resets on page reload)

| Action | Description |
|--------|-------------|
| `addItem(item)` | Add to cart (merges quantity if same `cartKey`) |
| `removeItem(cartKey)` | Remove item |
| `updateQuantity(cartKey, qty)` | Update quantity (removes if 0) |
| `getTotal()` | Calculate total price |
| `getItemCount()` | Count total items |
| `clearCart()` | Empty the cart |

Cart keys are generated as `productId + variation option IDs` to distinguish the same product with different selections.

### OrderStore (`orderStore.ts`)
**Key:** `"saraya-orders"`

| Action | Description |
|--------|-------------|
| `addOrder(data)` | Create order with auto-generated ID (`ORD-{timestamp}-{random}`) |
| `updateStatus(orderId, status)` | Update order status |
| `removeOrder(orderId)` | Delete an order |
| `clearAllOrders()` | Delete all orders |

Order statuses: `pending` → `preparing` → `ready` → `served` (or `cancelled`).

### LanguageStore (`languageStore.ts`)
**Key:** `"saraya-language"`

Simple toggle between `"en"` and `"bs"`. Persisted.

### AdminStore (`adminStore.ts`)
**Key:** `"saraya-admin"`

Single boolean: `darkMode` toggle. Persisted.

---

## 9. Theme System & Presets

### 20 Built-In Themes

Each theme is a complete visual identity containing `ComponentStyles`, `LayoutConfig`, and `PageContent` (bilingual EN + BS).

| # | ID | Name | Aesthetic | Key Colors |
|---|---|---|---|---|
| 1 | `bella-classic` | Bella Classic | Warm gold on white | Gold `#F4B400` / White |
| 2 | `modern-minimal` | Modern Minimal | Monochrome zen | Black / White / Gray |
| 3 | `dark-elegance` | Dark Elegance | Luxury black & gold | `#1E1E1E` / `#D4AF37` |
| 4 | `vibrant-pop` | Vibrant Pop | Maximum energy orange | `#F97316` / White |
| 5 | `rustic-italian` | Rustic Italian | Parchment & terracotta | `#8B4513` / `#FFF8DC` |
| 6 | `ocean-breeze` | Ocean Breeze | Coastal glass-morph | `#06B6D4` / White |
| 7 | `cozy-cafe` | Cozy Café | Coffee browns + cream | `#6B4226` / `#FFF8F0` |
| 8 | `fresh-garden` | Fresh Garden | Green farm market | `#16A34A` / `#F0FDF4` |
| 9 | `warm-sunset` | Warm Sunset | Pink rooftop romance | `#F43F5E` / `#FFF1F2` |
| 10 | `nordic-clean` | Nordic Clean | Sparse Scandinavian | `#1E293B` / `#F8FAFC` |
| 11 | `tokyo-street` | Tokyo Street | Red compact izakaya | `#DC2626` / `#1C1917` |
| 12 | `desert-sand` | Desert Sand | Moroccan riad | `#D97706` / `#FEF3C7` |
| 13 | `wine-bistro` | Wine Bistro | Dark burgundy | `#881337` / `#1E1E1E` |
| 14 | `french-patisserie` | French Pâtisserie | Pink Parisian boutique | `#EC4899` / `#FDF2F8` |
| 15 | `midnight-blue` | Midnight Blue | Cocktail lounge | `#6366F1` / `#0F172A` |
| 16 | `tropical-paradise` | Tropical Paradise | Tiki bar | `#14B8A6` / `#FFFBEB` |
| 17 | `steakhouse-grill` | Steakhouse Grill | Dark walnut + amber | `#D97706` / `#1C1917` |
| 18 | `retro-diner` | Retro Diner | 1950s cream + red | `#DC2626` / `#FFFBEB` |
| 19 | `rooftop-lounge` | Rooftop Lounge | Navy + gold magazine | `#D4AF37` / `#0F172A` |
| 20 | `art-deco` | Art Deco | Gatsby glamour | `#F4B400` / `#111111` |

### Theme Customization System

When a user switches themes:
1. **Current state saved** to `themeCustomizations[currentThemeId]`
2. **New theme loaded** — first checks for saved customizations for that theme, falls back to preset defaults
3. User can then tweak any setting and save — those tweaks are stored per-theme so switching doesn't lose work

```typescript
interface ThemeCustomization {
  componentStyles: ComponentStyles;
  layoutConfig: LayoutConfig;
  pageContent: PageContent;
}
// Record<themeId, ThemeCustomization> stored per venue
```

---

## 10. Admin Panel — Full Walkthrough

### Entry Point: `/admin`
Shows all venues in a grid with:
- Global stats (total venues, products, users, popular items)
- Per-venue cards with hero image, stats, staff list, slug
- "New Venue" button → opens create modal with venue type picker and slug generator
- "Enter Venue" → navigates to `/admin/{slug}` (login page)

### Login: `/admin/{slug}`
- Shows venue header with hero image and type badge
- Quick-select user cards for all users with access
- Manual email/password form
- On login → redirects to `/admin/{slug}/restaurant`

### Admin Layout (sidebar + header)
Once logged in, the admin shell provides:
- **Sidebar navigation** — items visible based on role
- **Header** — page title, dark mode toggle, role badge, "View Menu" link
- **Venue switcher** — dropdown to switch between accessible venues
- **Footer** — user card, storage notice, sign out, reset to defaults

### Restaurant: `/admin/{slug}/restaurant`
Edit venue's public information:
- **General tab:** Name, tagline, hero image URL, logo URL (all bilingual)
- **Contact tab:** Address, hours, WiFi, phone
- Live preview card showing the hero with input changes

### Products: `/admin/{slug}/products`
Full product and category management:
- Product list grouped by category with search/filter
- Create/edit/delete products with:
  - Name & description (bilingual EN + BS)
  - Price, image URL, category assignment
  - Add-ons (name + price, bilingual)
  - Variations with options (name, required/optional, price adjustments, bilingual)
  - Popular toggle
- Category management panel (add, edit, reorder, delete categories)
- Live preview panel

### Page Content: `/admin/{slug}/page-content`
The most complex admin page with three main tabs:

**Tab 1: Text Content**
- 8 accordion sections (Menu Page, Badges, Order Bar, Cart, Checkout, Order Confirmed, Product Page, Menu List)
- Each section contains bilingual text fields (EN + BS via `BsCollapse`)
- Progress indicator showing how many sections have been customized
- Quick navigation pills to jump between sections

**Tab 2: Design & Layout**
- 10 accordion sections (General, Hero, Info Bar, Cards, Section Headers, Category Bar, Order Bar, Product Detail, Cart Page, Checkout Page)
- Color pickers with palette swatches + custom hex input
- Layout selectors (card layout, image position, corner radius, shadow depth)
- Toggle switches (view-only mode, sticky category bar, show icons, show headers)

**Tab 3: Sections & Themes**
- Sub-navigation with 6 panels:
  - **Themes:** 20 theme preset cards with color swatches, one-click apply
  - **Sections:** Reorderable section list with up/down buttons and visibility toggles (9 sections)
  - **Variants:** Visual style selectors for each section (hero: 5 variants, category bar: 5, etc.)
  - **Layout:** Page layout, heading font, body font, font size
  - **Effects:** Animation style, content density, card gap
  - **Content:** Extra section text fields (promo banner, featured, social proof, footer)

### Orders: `/admin/{slug}/orders`
Real-time order management dashboard:
- Stats row: Total / Active / Today / Today Revenue
- Status filter pills: All / Pending / Preparing / Ready / Served / Cancelled
- Order cards with items preview, table number, time, status badge
- Actions: Start Preparing → Mark Ready → Mark Served
- Detail modal with full item breakdown

### Users: `/admin/{slug}/users` (Admin Only)
Platform user management:
- Create/delete users, assign avatars
- Platform role switcher (admin/user)
- Per-restaurant role assignment grid (manager/employee per venue)
- Role legend explaining the two-tier system

---

## 11. Public Menu Pages — Full Walkthrough

### Venue Discovery: `/`
Grid of all created venues with:
- Cover images, venue type badges, stats (items/categories)
- Search bar to filter venues by name, slug, or type
- Clicking a venue → navigates to `/{slug}`

### Menu Page: `/{slug}`
The main customer-facing page. Fully CMS-driven — every aspect is customizable.

**Section rendering** iterates `layoutConfig.sections`, filters by `visible`, and renders in order:

| Section | Default Position | Default Visible | Variants |
|---------|-----------------|-----------------|----------|
| Hero Banner | 1 | ✅ | classic, minimal, centered, split, overlay-full |
| Info Bar | 2 | ✅ | card, inline, floating, banner |
| Promo Banner | 3 | ❌ | ribbon, card, floating, marquee |
| Search Bar | 4 | ✅ | default, minimal, pill, hidden |
| Category Bar | 5 | ✅ | scroll, pills, underline, grid, minimal |
| Featured Section | 6 | ❌ | carousel, highlight, banner |
| Menu Content | 7 | ✅ | sections, grid, list, magazine, compact |
| Social Proof | 8 | ❌ | stars, testimonial, counter |
| Footer | 9 | ❌ | simple, detailed, minimal, branded |

**Key features:**
- **Responsive:** Mobile-first with breakpoints at MD and LG
- **Category auto-tracking:** `IntersectionObserver` highlights the current category as user scrolls
- **Smooth scroll:** Clicking a category pill scrolls to that section
- **Search:** Filters products by name/description across all categories
- **View-Only Mode:** When enabled, ordering UI is hidden — customers can only browse

### Product Detail: `/{slug}/product/{id}`
Full product page with:
- Hero image (sticky on desktop, with side-by-side layout)
- 5 layout variants: classic, minimal, compact, elegant, immersive
- Variation selection (required/optional)
- Add-on checkboxes
- Quantity selector
- Sticky "Add to Order" bar with total calculation
- Related items carousel (same category)
- View-only mode hides all ordering controls

### Cart: `/{slug}/cart`
- Item list with quantity controls (via `QuantitySelector`)
- Order summary card (sticky)
- "Clear All" and "Place Order" actions
- Redirects to menu if view-only mode is active

### Checkout: `/{slug}/checkout`
Two-phase flow:
1. **Confirm screen:** Table number grid (1 to N, configurable), kitchen note textarea, order summary
2. **Success screen:** Animated timeline (received → preparing → coming to table), estimated wait, "Back to Menu" button

---

## 12. Bilingual System (EN / BS)

### How It Works

1. **Data layer:** Every user-facing text field has an optional `_bs` (Bosnian) counterpart. Example:
   ```typescript
   welcomeTitle: "Welcome to Our Restaurant"
   welcomeTitle_bs: "Dobrodošli u naš restoran"
   ```

2. **Language selection:** A floating toggle (bottom-left corner) switches between EN and BS. Stored in `languageStore`.

3. **Translation hook:** `useTranslation()` provides helpers that check the current language and return the appropriate variant:
   ```typescript
   const { t, tProduct, tCategory, tRestaurant } = useTranslation();
   // t(pageContent, "welcomeTitle") → returns BS value if language is "bs" and BS value exists
   ```

4. **Admin editing:** Every bilingual field shows an EN input by default. A `BsCollapse` toggle reveals the BS input:
   - 🇬🇧 flag next to English input
   - 🇧🇦 flag next to Bosnian input (collapsible)
   - Blue dot indicator when BS field has a value

5. **Theme presets:** All 20 themes include complete Bosnian translations for all 121 text fields.

---

## 13. Live Preview System

The admin panel includes a **real-time preview** that shows exactly how the menu will look on a phone or tablet.

### Architecture

```
┌─────────────────────────┐      postMessage       ┌──────────────────────┐
│   Admin Panel            │ ──────────────────────→ │   Preview Iframe      │
│   (LivePreview.tsx)      │                         │   /{slug}?preview=1   │
│                          │ ←────────────────────── │                       │
│   Sends CMS data via     │   "cms-preview-ready"   │   useCmsData() hook   │
│   "cms-preview-update"   │                         │   overrides store     │
│   on every change        │                         │   with message data   │
└─────────────────────────┘                         └──────────────────────┘
```

### How It Works

1. `LivePreview` renders an iframe pointing to `/{venueSlug}?preview=1`
2. The `?preview=1` flag tells the venue layout to skip the "venue not found" check
3. `LivePreview` uses a `ResizeObserver` to auto-scale the device frame to fit its container
4. Whenever any CMS data changes, `LivePreview` sends a `cms-preview-update` postMessage with the full data payload
5. `useCmsData()` (in the iframe) listens for these messages and overrides all local data
6. Result: any slider, toggle, or text change instantly reflects in the preview

### Device Modes
- **Phone:** 375×812px with notch and home indicator
- **Tablet:** 768×1024px

---

## 14. Ordering Flow (Cart → Checkout → Confirmed)

### Step 1: Browse Menu (`/{slug}`)
- Customer browses the menu, uses search/categories to find items
- Clicks an item → opens product detail page

### Step 2: Product Detail (`/{slug}/product/{id}`)
- Select required variations (e.g., Size: Medium)
- Optionally add extras (add-ons)
- Set quantity
- Click "Add to Order" → item added to `cartStore`, navigate back

### Step 3: Cart (`/{slug}/cart`)
- Review all items with prices and quantities
- Adjust quantities or remove items
- View subtotal and total
- Click "Place Order" → navigate to checkout

### Step 4: Checkout (`/{slug}/checkout`)
- Select table number (1 to N, configurable via `pageContent.tableCount`)
- Optionally write a kitchen note
- Click "Send to Kitchen"
- Order created in `orderStore` with status `"pending"`
- Cart cleared

### Step 5: Order Confirmed
- Animated success screen with progress timeline:
  1. ✅ Order Received — "Your order is confirmed"
  2. 🔥 Preparing Your Food — "Our chef is working on it"
  3. 🍽️ Coming to Your Table — "Almost there!"
- Estimated wait time display
- "Back to Menu" button

### Step 6: Order Management (Admin)
In the admin panel (`/admin/{slug}/orders`):
- Employee sees the order appear with `pending` status
- Clicks "Start Preparing" → status changes to `preparing`
- Clicks "Mark Ready" → `ready`
- Clicks "Mark Served" → `served`
- Can also cancel orders

---

## 15. Color Utilities & Theming Engine

The entire public-facing UI dynamically adapts to CMS colors using `src/lib/color-utils.ts`:

| Utility | Purpose |
|---------|---------|
| `isDark(hex)` | Weighted luminance check — determines if a color is "dark" |
| `contrastText(bgHex)` | Returns `#FFFFFF` or `#1E1E1E` for readable text |
| `mutedText(bgHex)` | Semi-transparent text color that works on any background |
| `subtleBorder(bgHex)` | Barely-visible border color |
| `subtleSurface(bgHex)` | Slightly different surface for cards/sections |
| `hoverSurface(bgHex)` | Hover state surface variation |
| `adjustBrightness(hex, factor)` | Lighten or darken any color |

Every component reads its background color from `componentStyles`, then derives text, border, and hover colors through these utilities. This ensures **any color combination works** — from pure white backgrounds to dark-mode themes.

---

## 16. Component Reference

### Public Components

| Component | File | Purpose |
|-----------|------|---------|
| `MenuList` | `components/MenuList.tsx` | Renders products grouped by category with section headers |
| `MenuItemCard` | `components/MenuItemCard.tsx` | Individual product card (vertical/horizontal layout) |
| `OrderBar` | `components/OrderBar.tsx` | Floating bottom bar showing cart count & total |
| `OrderItem` | `components/OrderItem.tsx` | Single cart item row with quantity controls |
| `QuantitySelector` | `components/QuantitySelector.tsx` | Plus/minus quantity control |
| `LanguageSwitcher` | `components/LanguageSwitcher.tsx` | Floating EN/BA toggle pill |

### Admin Components

| Component | File | Purpose |
|-----------|------|---------|
| `LivePreview` | `components/admin/LivePreview.tsx` | Phone/tablet iframe preview with real-time sync |
| `BsCollapse` | `components/admin/BsCollapse.tsx` | Collapsible Bosnian translation field wrapper |

### Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useCmsData` | `hooks/useCmsData.ts` | Central CMS data provider (hydration-safe, preview-aware) |
| `useTranslation` | `hooks/useTranslation.ts` | EN/BS translation helpers |

---

## 17. Build & Development

### Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### Build Notes (Windows)

The project requires increased Node.js memory for production builds:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
$env:NODE_OPTIONS="--max-old-space-size=4096"
npx next build
```

### localStorage Keys

| Key | Store | Purpose |
|-----|-------|---------|
| `saraya-cms` | CmsStore | All venue data, themes, styles, content |
| `saraya-auth` | AuthStore | Users, roles, login state |
| `saraya-orders` | OrderStore | All orders |
| `saraya-language` | LanguageStore | Current language (en/bs) |
| `saraya-admin` | AdminStore | Admin UI preferences (dark mode) |

### Data Reset

The admin panel includes a "Reset to Defaults" button (in the sidebar footer) that clears all CMS data back to factory empty state. Individual stores can be cleared by deleting the corresponding localStorage key.

---

> **This documentation covers the complete Saraya CMS system as of February 2026.**  
> All data is client-side (localStorage). There is no backend server or database.  
> The system is designed as a fully functional prototype / demo for restaurant digital menu management.
