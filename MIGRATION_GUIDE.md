# Saraya CMS — Supabase Migration Guide

> **Status:** Preparation complete — all schema, services, and client files are ready.  
> **Goal:** Replace `localStorage` persistence with a Supabase Postgres database  
> **Impact:** Multi-device support, real authentication, live order sync, cloud persistence

---

## Table of Contents

1. [Migration Overview](#1-migration-overview)
2. [What Changes](#2-what-changes)
3. [Setup Instructions](#3-setup-instructions)
4. [Database Schema](#4-database-schema)
5. [Service Layer Architecture](#5-service-layer-architecture)
6. [Store Migration Map](#6-store-migration-map)
7. [File-by-File Migration Checklist](#7-file-by-file-migration-checklist)
8. [Authentication Migration](#8-authentication-migration)
9. [Realtime Orders](#9-realtime-orders)
10. [Data Migration Script](#10-data-migration-script)
11. [Environment Variables](#11-environment-variables)
12. [Rollback Strategy](#12-rollback-strategy)

---

## 1. Migration Overview

### Current System (localStorage)
```
Browser localStorage
├── saraya-cms      → All venue data (4,400+ line store)
├── saraya-auth     → Users & roles (hardcoded passwords)
├── saraya-orders   → Orders (lost on browser clear)
├── saraya-language → UI language preference
└── saraya-admin    → Admin dark mode toggle
```

### Target System (Supabase)
```
Supabase
├── Postgres DB     → 13 tables with RLS policies
├── Supabase Auth   → Real email/password authentication
├── Realtime        → Live order subscriptions
├── Row Level Security → Role-based data access
└── localStorage    → Only language + dark mode (UI prefs)
```

### What Stays Local
- `languageStore` — UI preference, no reason to persist server-side
- `adminStore` — Dark mode toggle, UI-only
- `cartStore` — Already non-persistent, stays in-memory

---

## 2. What Changes

| Aspect | Before (localStorage) | After (Supabase) |
|--------|----------------------|-------------------|
| **Data persistence** | Browser only, single device | Cloud, multi-device |
| **Authentication** | Hardcoded passwords, no real auth | Supabase Auth (email/password, OAuth) |
| **Authorization** | Trust-based, client-side role checks | Row Level Security enforced at DB level |
| **Order updates** | Polling / manual refresh | Realtime WebSocket subscriptions |
| **Multi-user** | Everyone shares one browser | Concurrent users with isolated sessions |
| **Data safety** | Lost if user clears browser data | Durable, backed up automatically |
| **Scalability** | Single browser tab | Unlimited clients |

---

## 3. Setup Instructions

### 3.1 Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 3.2 Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (note the project URL and keys)
3. Copy `.env.example` → `.env.local` and fill in credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3.3 Run Migrations

Apply the SQL migration files in order:

```bash
# Option A: Using Supabase CLI
npx supabase db push

# Option B: Manual via SQL Editor in Supabase Dashboard
# Run each file in supabase/migrations/ in numerical order:
#   001_create_tables.sql
#   002_row_level_security.sql
#   003_realtime_and_triggers.sql
```

### 3.4 Generate Types (Optional — already hand-written)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/supabase.ts
```

---

## 4. Database Schema

### Entity Relationship Diagram

```
users ──────────────────── restaurant_access ──── restaurants
  │                              │                    │
  │ (auth_id → auth.users)       │                    ├── categories
  │                              │                    ├── page_content
  │                              │                    ├── component_styles
  │                              │                    ├── layout_config
  │                              │                    ├── theme_customizations
  │                              │                    └── orders
  │                              │
  └──────────────────────────────┘
                                                   products
                                                     ├── addons
                                                     └── variations
                                                           └── variation_options
```

### Tables Summary

| Table | Rows per Venue | PK | Storage |
|-------|---------------|-----|---------|
| `restaurants` | 1 | `id` (slug) | Columns |
| `categories` | ~5-15 | `(restaurant_id, id)` | Columns |
| `products` | ~10-100 | `id` | Columns |
| `addons` | ~0-50 | `id` | Columns |
| `variations` | ~0-30 | `id` | Columns |
| `variation_options` | ~0-100 | `id` | Columns |
| `page_content` | 1 | `restaurant_id` | JSONB |
| `component_styles` | 1 | `restaurant_id` | JSONB |
| `layout_config` | 1 | `restaurant_id` | JSONB |
| `theme_customizations` | 0-20 | `(restaurant_id, theme_id)` | JSONB |
| `orders` | growing | `id` | Columns + JSONB items |
| `users` | global | `id` (UUID) | Columns |
| `restaurant_access` | per user×venue | `(user_id, restaurant_id)` | Columns |

### Why JSONB for PageContent/Styles/Layout?

These structures have 50-121 fields each and change frequently during development. Using JSONB:
- Avoids 200+ column ALTER TABLEs when adding fields
- Keeps migration scripts simple
- Allows the TypeScript type to be the single source of truth
- Minimal query performance impact (these are always loaded whole)

Relational tables (products, categories, addons, variations) use proper columns for:
- Efficient filtering, sorting, and JOIN operations
- Foreign key cascade deletes
- RLS per-row authorization

---

## 5. Service Layer Architecture

The service files in `src/services/` provide an abstraction layer between the UI components and Supabase:

```
┌──────────────────────────────────────────────┐
│              React Components                 │
│         (pages, admin editors, hooks)         │
└──────────────────┬───────────────────────────┘
                   │ calls
                   ▼
┌──────────────────────────────────────────────┐
│              Service Layer                    │
│  authService.ts      → Auth + users + roles   │
│  restaurantService.ts → Venues + CMS data     │
│  productService.ts   → Products + categories  │
│  orderService.ts     → Orders + realtime      │
└──────────────────┬───────────────────────────┘
                   │ uses
                   ▼
┌──────────────────────────────────────────────┐
│          Supabase Client                      │
│  supabase.ts       → Browser client (anon)    │
│  supabase-server.ts → Server client (admin)   │
└──────────────────────────────────────────────┘
```

Each service maps 1:1 with its corresponding Zustand store:

| Service | Replaces Store | Key Functions |
|---------|---------------|---------------|
| `authService` | `authStore` | `signIn`, `signUp`, `getCurrentUserProfile`, `assignRestaurantRole` |
| `restaurantService` | `cmsStore` (restaurant + CMS parts) | `getFullVenueData`, `savePageContent`, `saveComponentStyles`, `saveLayoutConfig` |
| `productService` | `cmsStore` (products + categories) | `getFullMenu`, `createProduct`, `syncAddons`, `syncVariations` |
| `orderService` | `orderStore` | `createOrder`, `updateOrderStatus`, `subscribeToOrders` |

---

## 6. Store Migration Map

### Stores That Move to Supabase

| Store | localStorage Key | Target | Migration Strategy |
|-------|-----------------|--------|-------------------|
| `cmsStore` | `saraya-cms` | `restaurants` + `categories` + `products` + `addons` + `variations` + `variation_options` + `page_content` + `component_styles` + `layout_config` + `theme_customizations` | **Replace persist with service calls.** Keep Zustand for client-side cache, but load from / save to Supabase. Remove `persist` middleware. |
| `authStore` | `saraya-auth` | `users` + `restaurant_access` + Supabase Auth | **Replace entirely.** Use Supabase Auth for session management. Use `authService` for profile/role queries. |
| `orderStore` | `saraya-orders` | `orders` | **Replace persist with service + realtime.** Subscribe to live updates via `subscribeToOrders()`. |

### Stores That Stay Local

| Store | localStorage Key | Reason |
|-------|-----------------|--------|
| `languageStore` | `saraya-language` | UI preference, instant toggle, no server value |
| `adminStore` | `saraya-admin` | UI preference (dark mode), no server value |
| `cartStore` | *(none — in-memory)* | Session-scoped shopping cart, no persistence needed |

### Recommended cmsStore Refactoring Pattern

The current `cmsStore` is ~4,480 lines managing everything. Post-migration:

```
cmsStore (simplified)
├── Client-side cache of current venue data
├── Theme presets (static, stay in code)
├── Flat "active" fields for admin editing
├── save() → calls service layer → Supabase
└── load(slug) → calls service layer → hydrates flat fields
```

The `allRestaurants` map and `persist` middleware are removed entirely — Supabase IS the source of truth.

---

## 7. File-by-File Migration Checklist

### Phase 1: Foundation (no UI changes)
- [x] Create `.env.example` and `.env.local`
- [x] Create `src/lib/supabase.ts` (browser client)
- [x] Create `src/lib/supabase-server.ts` (server client)
- [x] Create `src/types/supabase.ts` (DB types)
- [x] Create SQL migrations (3 files)
- [x] Create service layer (4 files)

### Phase 2: Auth Migration
- [ ] Replace `authStore` login/logout with `authService.signIn/signOut`
- [ ] Replace hardcoded passwords with Supabase Auth
- [ ] Update `/admin/[venue]/page.tsx` (login page) to use `signIn()`
- [ ] Update admin layout auth gate to use `getCurrentSession()`
- [ ] Replace `authStore.users` with `authService.getAllUsers()`
- [ ] Replace role checks with `authService.getUserRestaurantAccess()`

### Phase 3: Restaurant & CMS Data
- [ ] Create venues via `restaurantService.createRestaurant()` instead of `cmsStore.createRestaurant()`
- [ ] Load venue data via `restaurantService.getFullVenueData()` instead of `loadVenuePublic()`
- [ ] Save page content via `restaurantService.savePageContent()` instead of `updatePageContent()`
- [ ] Save styles via `restaurantService.saveComponentStyles()` instead of `updateComponentStyles()`
- [ ] Save layout via `restaurantService.saveLayoutConfig()` instead of `updateLayoutConfig()`
- [ ] Remove `allRestaurants` map and `persist` from cmsStore
- [ ] Keep cmsStore as a thin client-side cache layer

### Phase 4: Products & Categories
- [ ] Use `productService.getFullMenu()` to load menu on public pages
- [ ] Use `productService.createProduct()` / `updateProduct()` in admin products editor
- [ ] Use `productService.syncAddons()` / `syncVariations()` when saving products
- [ ] Use `productService.getCategories()` / `upsertCategory()` in categories editor

### Phase 5: Orders + Realtime
- [ ] Replace `orderStore.addOrder()` with `orderService.createOrder()`
- [ ] Replace `orderStore.updateStatus()` with `orderService.updateOrderStatus()`
- [ ] Add `orderService.subscribeToOrders()` in admin orders page for live updates
- [ ] Remove `persist` from orderStore, use as ephemeral local state only

### Phase 6: Cleanup
- [ ] Remove `persist` middleware from cmsStore and authStore
- [ ] Remove `allRestaurants` Record from cmsStore
- [ ] Remove hardcoded user seeds from authStore
- [ ] Update `useCmsData` hook to fetch from service layer
- [ ] Remove `data/restaurants.ts` placeholder
- [ ] Delete old localStorage migration code (version 4 migrate function)
- [ ] Test E2E: create venue → edit menu → view public page → place order → manage order

---

## 8. Authentication Migration

### Before (Current)
```typescript
// authStore.ts — hardcoded passwords
const HARDCODED_PASSWORDS: Record<string, string> = {
  'admin@saraya.dev': 'admin123',
};
// Default password for all other users: 'password'
```

### After (Supabase Auth)
```typescript
// authService.ts — real authentication
import { supabase } from '@/lib/supabase';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}
```

### Auth Flow Changes

| Step | Before | After |
|------|--------|-------|
| **Sign in** | Check hardcoded password map | `supabase.auth.signInWithPassword()` |
| **Session** | `authStore.currentUserId` (localStorage) | Supabase session token (httpOnly cookie) |
| **Auth gate** | Check `authStore.getCurrentUser()` | Check `supabase.auth.getSession()` |
| **Sign out** | `authStore.logout()` clears userId | `supabase.auth.signOut()` invalidates token |
| **User creation** | Push to `authStore.users[]` | `supabase.auth.admin.createUser()` + DB trigger |
| **Role check** | Read `user.restaurantAccess[]` | Query `restaurant_access` table |

### Seed Admin User

After deploying, create the initial admin user:

```sql
-- In Supabase SQL editor, after the admin signs up:
UPDATE public.users
SET platform_role = 'admin'
WHERE email = 'admin@saraya.dev';
```

Or use the Supabase Dashboard Auth section to create the first user, then promote via SQL.

---

## 9. Realtime Orders

The orders table has Realtime enabled (migration 003). Use the `subscribeToOrders()` function from `orderService.ts`:

```typescript
// In the admin orders page component:
import { subscribeToOrders, getOrders } from '@/services/orderService';

useEffect(() => {
  // Initial load
  getOrders(venueSlug).then(setOrders);

  // Live updates
  const unsubscribe = subscribeToOrders(venueSlug, {
    onInsert: (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
      // Play notification sound, show toast, etc.
    },
    onUpdate: (updated) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    },
    onDelete: (deleted) => {
      setOrders(prev => prev.filter(o => o.id !== deleted.id));
    },
  });

  return unsubscribe;
}, [venueSlug]);
```

This replaces the current model where order state is shared through a single browser's localStorage.

---

## 10. Data Migration Script

To migrate existing localStorage data to Supabase, run this one-time script:

```typescript
// scripts/migrate-localstorage-to-supabase.ts
// Run with: npx tsx scripts/migrate-localstorage-to-supabase.ts

import { supabaseAdmin } from '../src/lib/supabase-server';

// 1. Read localStorage data (export it from browser console first as JSON)
import localData from './exported-localstorage.json';

async function migrate() {
  const cmsData = localData['saraya-cms']?.state;
  const authData = localData['saraya-auth']?.state;
  const orderData = localData['saraya-orders']?.state;

  if (!cmsData) throw new Error('No CMS data found');

  // 2. Migrate users
  for (const user of authData?.users ?? []) {
    await supabaseAdmin.from('users').upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      platform_role: user.platformRole,
    });

    // Migrate restaurant access
    for (const access of user.restaurantAccess ?? []) {
      await supabaseAdmin.from('restaurant_access').upsert({
        user_id: user.id,
        restaurant_id: access.restaurantId,
        role: access.role,
      });
    }
  }

  // 3. Migrate restaurants
  for (const [slug, venue] of Object.entries(cmsData.allRestaurants)) {
    const v = venue as any;

    await supabaseAdmin.from('restaurants').upsert({
      id: slug,
      name: v.restaurant.name,
      name_bs: v.restaurant.name_bs ?? null,
      tagline: v.restaurant.tagline,
      tagline_bs: v.restaurant.tagline_bs ?? null,
      image: v.restaurant.image,
      logo: v.restaurant.logo,
      address: v.restaurant.address,
      address_bs: v.restaurant.address_bs ?? null,
      open_hours: v.restaurant.openHours,
      open_hours_bs: v.restaurant.openHours_bs ?? null,
      wifi: v.restaurant.wifi,
      phone: v.restaurant.phone,
      venue_type: v.venueType,
      created_at: v.createdAt,
    });

    // Categories
    for (const [i, cat] of (v.categories ?? []).entries()) {
      await supabaseAdmin.from('categories').upsert({
        id: cat.id,
        restaurant_id: slug,
        label: cat.label,
        label_bs: cat.label_bs ?? null,
        icon: cat.icon,
        color: cat.color,
        sort_order: i,
      });
    }

    // Products + addons + variations
    for (const [i, prod] of (v.products ?? []).entries()) {
      await supabaseAdmin.from('products').upsert({
        id: prod.id,
        restaurant_id: slug,
        category: prod.category,
        name: prod.name,
        name_bs: prod.name_bs ?? null,
        description: prod.description,
        description_bs: prod.description_bs ?? null,
        price: prod.price,
        image: prod.image,
        popular: prod.popular ?? false,
        sort_order: prod.sortOrder ?? i,
      });

      for (const addon of prod.addons ?? []) {
        await supabaseAdmin.from('addons').upsert({
          id: addon.id,
          product_id: prod.id,
          name: addon.name,
          name_bs: addon.name_bs ?? null,
          price: addon.price,
        });
      }

      for (const variation of prod.variations ?? []) {
        await supabaseAdmin.from('variations').upsert({
          id: variation.id,
          product_id: prod.id,
          name: variation.name,
          name_bs: variation.name_bs ?? null,
          required: variation.required,
        });

        for (const option of variation.options ?? []) {
          await supabaseAdmin.from('variation_options').upsert({
            id: option.id,
            variation_id: variation.id,
            label: option.label,
            label_bs: option.label_bs ?? null,
            price_adjustment: option.priceAdjustment,
          });
        }
      }
    }

    // JSONB CMS data
    await supabaseAdmin.from('page_content').upsert({
      restaurant_id: slug,
      content: v.pageContent ?? {},
    });
    await supabaseAdmin.from('component_styles').upsert({
      restaurant_id: slug,
      styles: v.componentStyles ?? {},
    });
    await supabaseAdmin.from('layout_config').upsert({
      restaurant_id: slug,
      config: v.layoutConfig ?? {},
    });

    // Theme customizations
    for (const [themeId, custom] of Object.entries(v.themeCustomizations ?? {})) {
      const c = custom as any;
      await supabaseAdmin.from('theme_customizations').upsert({
        restaurant_id: slug,
        theme_id: themeId,
        component_styles: c.componentStyles ?? {},
        layout_config: c.layoutConfig ?? {},
        page_content: c.pageContent ?? {},
      });
    }
  }

  // 4. Migrate orders
  for (const order of orderData?.orders ?? []) {
    // Need restaurant_id — derive from products or default
    await supabaseAdmin.from('orders').upsert({
      id: order.id,
      restaurant_id: cmsData.restaurant?.name ? Object.keys(cmsData.allRestaurants)[0] : 'default',
      items: order.items,
      table_number: order.tableNumber,
      kitchen_note: order.kitchenNote,
      total: order.total,
      item_count: order.itemCount,
      status: order.status,
      created_at: order.createdAt,
    });
  }

  console.log('✅ Migration complete!');
}

migrate().catch(console.error);
```

### How to Export localStorage

Run this in the browser console on the existing app:

```javascript
// Browser Console → Copy result
copy(JSON.stringify({
  'saraya-cms': JSON.parse(localStorage.getItem('saraya-cms') || '{}'),
  'saraya-auth': JSON.parse(localStorage.getItem('saraya-auth') || '{}'),
  'saraya-orders': JSON.parse(localStorage.getItem('saraya-orders') || '{}'),
}));
// Paste into scripts/exported-localstorage.json
```

---

## 11. Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public anon key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Bypasses RLS — never expose to client |

Files: `.env.example` (template), `.env.local` (actual values, gitignored).

---

## 12. Rollback Strategy

Since the migration is additive:

1. **Service layer is independent** — existing stores continue to work unchanged until you swap calls
2. **Feature flag approach:** Add an env var `NEXT_PUBLIC_USE_SUPABASE=true` and conditionally call service layer vs store methods
3. **Dual-write phase:** During transition, write to both localStorage and Supabase, read from Supabase
4. **Final cutover:** Remove localStorage persist once Supabase is verified stable

```typescript
// Example feature flag pattern:
const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true';

async function loadVenue(slug: string) {
  if (useSupabase) {
    return await restaurantService.getFullVenueData(slug);
  } else {
    return cmsStore.getState().loadVenuePublic(slug);
  }
}
```

---

## Files Created in This Preparation

```
📁 Project Root
├── .env.example                           # Template for Supabase credentials
├── .env.local                             # Actual credentials (gitignored)
├── MIGRATION_GUIDE.md                     # This file
├── supabase/
│   └── migrations/
│       ├── 001_create_tables.sql          # 13 tables
│       ├── 002_row_level_security.sql     # RLS policies + helper functions
│       └── 003_realtime_and_triggers.sql  # Realtime, auto-triggers, updated_at
└── src/
    ├── lib/
    │   ├── supabase.ts                    # Browser client (anon key)
    │   └── supabase-server.ts             # Server client (service role key)
    ├── types/
    │   └── supabase.ts                    # Auto-generated DB types
    └── services/
        ├── authService.ts                 # Auth + users + roles
        ├── restaurantService.ts           # Venues + CMS (content/styles/layout)
        ├── productService.ts              # Products + categories + addons + variations
        └── orderService.ts                # Orders + realtime subscriptions
```

---

> **Next step:** Install `@supabase/supabase-js`, create a Supabase project, fill in `.env.local`, and run the migration SQL files. Then begin Phase 2 (auth migration) from the checklist above.
