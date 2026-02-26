-- ============================================================
-- Saraya CMS — Supabase Migration: Core Tables
-- ============================================================
-- This migration creates all tables needed to replace the
-- localStorage-backed Zustand stores with a Supabase Postgres
-- database. Run this via `supabase db push` or the SQL editor.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. USERS (replaces authStore.users)
-- ─────────────────────────────────────────────────────────────
-- Uses Supabase Auth (auth.users) for actual authentication.
-- This table stores the app-level profile & platform role.
CREATE TABLE public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id       UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  avatar        TEXT,
  platform_role TEXT NOT NULL DEFAULT 'user'
                CHECK (platform_role IN ('admin', 'user')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Application users with platform-level roles (admin / user).';

-- ─────────────────────────────────────────────────────────────
-- 2. RESTAURANTS (replaces allRestaurants keys + RestaurantInfo)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.restaurants (
  id            TEXT PRIMARY KEY,                -- slug, e.g. "bella-cucina"
  name          TEXT NOT NULL,
  name_bs       TEXT,
  tagline       TEXT NOT NULL DEFAULT '',
  tagline_bs    TEXT,
  image         TEXT NOT NULL DEFAULT '',        -- hero image URL
  logo          TEXT NOT NULL DEFAULT '',        -- logo URL
  address       TEXT NOT NULL DEFAULT '',
  address_bs    TEXT,
  open_hours    TEXT NOT NULL DEFAULT '',
  open_hours_bs TEXT,
  wifi          TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  venue_type    TEXT NOT NULL DEFAULT 'restaurant'
                CHECK (venue_type IN (
                  'restaurant','cafe','bar','bakery',
                  'food-truck','pizzeria','pub','lounge'
                )),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.restaurants IS 'Each row is one venue/restaurant with basic info. The PK (id) is the URL slug.';

-- ─────────────────────────────────────────────────────────────
-- 3. RESTAURANT ACCESS (replaces AppUser.restaurantAccess[])
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.restaurant_access (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  role          TEXT NOT NULL DEFAULT 'employee'
                CHECK (role IN ('manager', 'employee')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, restaurant_id)
);

COMMENT ON TABLE public.restaurant_access IS 'Per-restaurant role assignments. One user can have one role per restaurant.';

-- ─────────────────────────────────────────────────────────────
-- 4. CATEGORIES (replaces categories: CategoryInfo[])
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.categories (
  id            TEXT NOT NULL,                   -- e.g. "main-course"
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  label         TEXT NOT NULL,
  label_bs      TEXT,
  icon          TEXT NOT NULL DEFAULT '🍽️',      -- emoji
  color         TEXT NOT NULL DEFAULT 'from-amber-400 to-orange-500',
  sort_order    INT NOT NULL DEFAULT 0,
  PRIMARY KEY (restaurant_id, id)
);

COMMENT ON TABLE public.categories IS 'Menu categories per restaurant. Composite PK (restaurant_id, id).';

-- ─────────────────────────────────────────────────────────────
-- 5. PRODUCTS (replaces products: ProductItem[])
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.products (
  id            TEXT PRIMARY KEY,                -- UUID string
  restaurant_id TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,                   -- references categories.id
  name          TEXT NOT NULL,
  name_bs       TEXT,
  description   TEXT NOT NULL DEFAULT '',
  description_bs TEXT,
  price         NUMERIC(10,2) NOT NULL DEFAULT 0,
  image         TEXT NOT NULL DEFAULT '',
  popular       BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_products_restaurant ON public.products(restaurant_id);

COMMENT ON TABLE public.products IS 'Individual menu items. Each belongs to one restaurant and one category.';

-- ─────────────────────────────────────────────────────────────
-- 6. ADDONS (replaces ProductItem.addons[])
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.addons (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  name_bs       TEXT,
  price         NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_addons_product ON public.addons(product_id);

COMMENT ON TABLE public.addons IS 'Extra items that can be added to a product (e.g., extra cheese).';

-- ─────────────────────────────────────────────────────────────
-- 7. VARIATIONS (replaces ProductItem.variations[])
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.variations (
  id            TEXT PRIMARY KEY,
  product_id    TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,                   -- e.g. "Size"
  name_bs       TEXT,
  required      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_variations_product ON public.variations(product_id);

COMMENT ON TABLE public.variations IS 'Product variation groups (e.g., Size, Crust Type).';

-- ─────────────────────────────────────────────────────────────
-- 8. VARIATION OPTIONS (replaces Variation.options[])
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.variation_options (
  id               TEXT PRIMARY KEY,
  variation_id     TEXT NOT NULL REFERENCES public.variations(id) ON DELETE CASCADE,
  label            TEXT NOT NULL,                -- e.g. "Large"
  label_bs         TEXT,
  price_adjustment NUMERIC(10,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_variation_options_variation ON public.variation_options(variation_id);

COMMENT ON TABLE public.variation_options IS 'Individual options within a variation group (e.g., Small/Medium/Large).';

-- ─────────────────────────────────────────────────────────────
-- 9. PAGE CONTENT (replaces pageContent: PageContent)
-- ─────────────────────────────────────────────────────────────
-- Stored as JSONB because PageContent has 121+ fields that change
-- often during development. This keeps the schema flexible.
CREATE TABLE public.page_content (
  restaurant_id TEXT PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
  content       JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.page_content IS 'All editable frontend text for a venue (121+ bilingual fields). Stored as JSONB for flexibility.';

-- ─────────────────────────────────────────────────────────────
-- 10. COMPONENT STYLES (replaces componentStyles: ComponentStyles)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.component_styles (
  restaurant_id TEXT PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
  styles        JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.component_styles IS 'Visual styling for all components (colors, sizes, toggles). Stored as JSONB.';

-- ─────────────────────────────────────────────────────────────
-- 11. LAYOUT CONFIG (replaces layoutConfig: LayoutConfig)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.layout_config (
  restaurant_id TEXT PRIMARY KEY REFERENCES public.restaurants(id) ON DELETE CASCADE,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.layout_config IS 'Page structure config: section ordering, variants, typography, animation. Stored as JSONB.';

-- ─────────────────────────────────────────────────────────────
-- 12. THEME CUSTOMIZATIONS (replaces themeCustomizations)
-- ─────────────────────────────────────────────────────────────
-- One row per restaurant × theme. Stores overrides the user made
-- to a theme preset so switching themes preserves tweaks.
CREATE TABLE public.theme_customizations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  theme_id        TEXT NOT NULL,                  -- ThemePresetId, e.g. "dark-elegance"
  component_styles JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout_config   JSONB NOT NULL DEFAULT '{}'::jsonb,
  page_content    JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (restaurant_id, theme_id)
);

COMMENT ON TABLE public.theme_customizations IS 'Per-theme overrides for each venue. Allows switching themes without losing edits.';

-- ─────────────────────────────────────────────────────────────
-- 13. ORDERS (replaces orderStore)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE public.orders (
  id             TEXT PRIMARY KEY,               -- e.g. "ORD-1709123456-abc"
  restaurant_id  TEXT NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  items          JSONB NOT NULL DEFAULT '[]'::jsonb,  -- CartItem[] snapshot
  table_number   TEXT NOT NULL DEFAULT '',
  kitchen_note   TEXT NOT NULL DEFAULT '',
  total          NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_count     INT NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','preparing','ready','served','cancelled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

COMMENT ON TABLE public.orders IS 'Customer orders. Items stored as JSONB snapshot at order time.';
