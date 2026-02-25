# Supabase Migration Guide — Saraya CMS

## Overview

This guide walks you through migrating the Saraya CMS restaurant platform from **localStorage** (Zustand persist) to **Supabase** (PostgreSQL + Auth + Storage + Realtime).

---

## Files Created

| File | Purpose |
|------|---------|
| [docs/PROJECT_LOGIC.md](../docs/PROJECT_LOGIC.md) | Complete project architecture documentation |
| [supabase/migrations/001_initial_schema.sql](001_initial_schema.sql) | Full database schema, RLS policies, seed data |
| [src/lib/supabase.ts](../src/lib/supabase.ts) | Supabase client configuration |
| [src/lib/database.types.ts](../src/lib/database.types.ts) | TypeScript types for the database schema |
| [src/lib/supabase-data.ts](../src/lib/supabase-data.ts) | Data service layer (CRUD operations) |

---

## Step 1: Supabase Project Setup

### 1a. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon key** from Settings → API

### 1b. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1c. Create Environment File
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 2: Run the Database Migration

### Option A: Supabase Dashboard (easiest)
1. Go to your Supabase Dashboard → SQL Editor
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

### Option B: Supabase CLI
```bash
npm install -g supabase
supabase init
supabase link --project-ref your-project-ref
supabase db push
```

---

## Step 3: Schema Mapping

### localStorage → Supabase Table Mapping

| localStorage Key | Zustand Store | Supabase Table(s) |
|---|---|---|
| `bella-cucina-cms` → `allRestaurants` | cmsStore | `restaurants` + `categories` + `products` + `product_addons` + `product_variations` + `variation_options` |
| `bella-cucina-cms` → `pageContent` | cmsStore | `page_content` (JSONB) |
| `bella-cucina-cms` → `componentStyles` | cmsStore | `component_styles` (JSONB) |
| `bella-cucina-cms` → `layoutConfig` | cmsStore | `layout_config` (JSONB) |
| `bella-cucina-cms` → `themeCustomizations` | cmsStore | `theme_customizations` |
| `bella-cucina-auth` → `users` | authStore | `auth.users` + `profiles` |
| `bella-cucina-auth` → `restaurantAccess` | authStore | `restaurant_members` |
| `bella-cucina-orders` | orderStore | `orders` + `order_items` |
| `bella-cucina-admin` | adminStore | `user_preferences` (dark_mode) |
| `bella-cucina-language` | languageStore | `user_preferences` (language) |

### Key Design Decisions

| Current (localStorage) | Supabase Design | Reason |
|---|---|---|
| Products stored with inline `addons[]` and `variations[]` | Separate tables: `product_addons`, `product_variations`, `variation_options` | Proper relational modeling, easier CRUD, no JSON mutation |
| `pageContent` is 110+ flat fields | JSONB column in `page_content` table | Schema flexibility — new fields added without migration |
| `componentStyles` is 40+ flat fields | JSONB column in `component_styles` table | Same reason — evolving design properties |
| `layoutConfig` has nested objects | JSONB column in `layout_config` table | Complex nested structure (sections, typography, etc.) |
| `themeCustomizations` is `Record<themeId, {...}>` | Separate table with `(restaurant_id, theme_id)` unique key | Better querying, individual theme CRUD |
| Auth is simple object array | Supabase Auth + `profiles` table | Real authentication with JWT, password hashing |
| Cart in ephemeral Zustand | Stays client-side (Zustand) | Cart is session-scoped, no need for persistence |

---

## Step 4: Incremental Migration Strategy

You don't need to migrate everything at once. Here's a recommended phased approach:

### Phase 1: Auth Migration (Week 1)
Replace the mock auth system with Supabase Auth.

**Changes:**
1. Replace `authStore.ts` login/logout with Supabase Auth:
   ```typescript
   // Before (mock):
   login: (userId) => set({ currentUserId: userId })
   
   // After (Supabase):
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password',
   });
   ```
2. The `profiles` table auto-creates on signup via the DB trigger
3. Replace `authStore.users` array with queries to `profiles` + `restaurant_members`
4. Keep `authStore` as a thin client-side cache (read from Supabase, cache in Zustand)

### Phase 2: Read Path Migration (Week 2)
Make public pages read from Supabase instead of localStorage.

**Changes:**
1. Update `useCmsData.ts` to fetch from Supabase on initial load:
   ```typescript
   // Use the restaurant_full_data view
   const { data } = await supabase
     .from('restaurant_full_data')
     .select('*')
     .eq('slug', venueSlug)
     .single();
   ```
2. Replace `loadVenuePublic()` with `fetchRestaurantBySlug()` from `supabase-data.ts`
3. Keep Zustand for client-side state (cart, UI state) — just populate it from Supabase data
4. Use Next.js Server Components where possible for initial data fetch

### Phase 3: Write Path Migration (Week 3)
Make admin edits persist to Supabase.

**Changes:**
1. Update each admin action to call `supabase-data.ts` functions:
   - `addProduct()` → `supabaseData.addProduct()`
   - `updatePageContent()` → `supabaseData.updatePageContent()`
   - etc.
2. Pattern: **Optimistic UI** — update Zustand immediately, then sync to Supabase:
   ```typescript
   // In the store action:
   updateProduct: async (id, data) => {
     // 1. Optimistic update (instant UI)
     set((s) => ({
       products: s.products.map((p) => p.id === id ? { ...p, ...data } : p),
     }));
     // 2. Persist to Supabase
     await supabaseData.updateProduct(id, data);
   }
   ```
3. Remove `saveActiveToAllRestaurants()` — Supabase persists per-table, no need for bulk snapshots

### Phase 4: Orders & Realtime (Week 4)
Move orders to Supabase and enable realtime updates.

**Changes:**
1. Replace `orderStore.addOrder()` with `supabaseData.placeOrder()`
2. Enable Supabase Realtime for the `orders` table (already in migration SQL)
3. Subscribe to order updates in the admin orders page:
   ```typescript
   const channel = supabase
     .channel('orders')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'orders',
       filter: `restaurant_id=eq.${restaurantId}`,
     }, (payload) => {
       // Update local order list
     })
     .subscribe();
   ```

### Phase 5: Image Upload (Week 5)
Replace Unsplash URLs with Supabase Storage uploads.

**Changes:**
1. Add image upload UI to product/restaurant editors
2. Use `supabaseData.uploadImage()` to upload to the `restaurant-images` bucket
3. Store the returned public URL in the product/restaurant record

---

## Step 5: What Stays Client-Side

These stores should **remain in Zustand** (no Supabase migration needed):

| Store | Reason |
|---|---|
| `cartStore` | Already ephemeral (not persisted). Session-scoped. |
| `adminStore` (partial) | Dark mode is a UI preference — can stay client-side or sync to `user_preferences` |
| `languageStore` | Can stay client-side for unauthenticated users; sync for logged-in users |
| LivePreview postMessage system | Pure client-side iframe communication — no persistence needed |
| Theme presets (THEME_PRESETS[]) | Static data — stays in the codebase, not in the database |

---

## Step 6: Entity Relationship Diagram

```
auth.users (Supabase Auth)
    │
    ├──→ profiles (1:1) ── platform_role
    │
    ├──→ restaurant_members (M:N) ── restaurant_role
    │         │
    │         ▼
    │    restaurants ◄─── venue_type
    │         │
    │         ├──→ categories (1:M)
    │         │
    │         ├──→ products (1:M)
    │         │       │
    │         │       ├──→ product_addons (1:M)
    │         │       │
    │         │       └──→ product_variations (1:M)
    │         │               │
    │         │               └──→ variation_options (1:M)
    │         │
    │         ├──→ page_content (1:1) ── JSONB
    │         ├──→ component_styles (1:1) ── JSONB
    │         ├──→ layout_config (1:1) ── JSONB
    │         ├──→ theme_customizations (1:M per theme)
    │         │
    │         └──→ orders (1:M)
    │                 │
    │                 └──→ order_items (1:M)
    │
    └──→ user_preferences (1:1)
```

---

## Step 7: Security Model

### Supabase Auth replaces the mock auth

| Current Mock | Supabase Equivalent |
|---|---|
| `authStore.login(userId)` | `supabase.auth.signInWithPassword()` |
| `authStore.logout()` | `supabase.auth.signOut()` |
| `AppUser.platformRole` | `profiles.platform_role` |
| `RestaurantAccess[]` | `restaurant_members` table |

### Row-Level Security (RLS) Summary

| Table | Public Read | Who Can Write |
|---|---|---|
| `restaurants` | ✅ | Platform admins (create/delete), Managers (update) |
| `categories` | ✅ | Managers of the restaurant |
| `products` | ✅ | Managers of the restaurant |
| `product_addons` | ✅ | Managers (via product ownership) |
| `product_variations` | ✅ | Managers (via product ownership) |
| `variation_options` | ✅ | Managers (via variation → product ownership) |
| `page_content` | ✅ | Managers of the restaurant |
| `component_styles` | ✅ | Managers of the restaurant |
| `layout_config` | ✅ | Managers of the restaurant |
| `theme_customizations` | ✅ | Managers of the restaurant |
| `orders` | Members only | Anyone can insert (customers), Members can update |
| `profiles` | Own + admins | Own profile |
| `restaurant_members` | Members | Managers |
| `user_preferences` | Own | Own |

---

## Step 8: Clean Up After Migration

Once fully migrated, you can remove:

1. **Zustand persist config** from `cmsStore`, `authStore`, `orderStore` — no more `localStorage`
2. **`allRestaurants` map** in cmsStore — replaced by the `restaurants` table
3. **`switchRestaurant` / `loadVenuePublic` / `saveActiveToAllRestaurants`** — replaced by direct DB queries
4. **Persist migration logic** (v1 → v2 → v3) — no longer needed
5. **Seed data file** (`src/data/restaurants.ts`) — replaced by database seed

Keep the cmsStore for **client-side state only** (current active data for rendering, cart, UI state).

---

## Summary

| What | Before | After |
|---|---|---|
| Data storage | localStorage (5MB limit) | PostgreSQL (unlimited) |
| Auth | Mock (no passwords) | Supabase Auth (JWT, OAuth) |
| Authorization | Client-side role checks | RLS policies (server-enforced) |
| Images | External URLs (Unsplash) | Supabase Storage bucket |
| Multi-tenant | Client-side allRestaurants map | Proper relational tables with FK constraints |
| Real-time | None | Supabase Realtime (orders, products) |
| Offline | Full offline (localStorage) | Online-first, with Zustand client cache |
