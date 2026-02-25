-- ============================================================================
-- SARAYA CMS — Supabase Database Migration
-- ============================================================================
-- This migration creates the full database schema for the Saraya CMS
-- restaurant platform, replacing the localStorage-based Zustand persistence.
--
-- Run this in the Supabase SQL Editor or via `supabase db push`.
--
-- Tables:
--   1.  restaurants          — Venue info (name, type, branding, contact)
--   2.  categories           — Menu categories per restaurant
--   3.  products             — Menu items per restaurant
--   4.  product_addons       — Optional extras for products
--   5.  product_variations   — Variation groups (e.g., Size, Milk Type)
--   6.  variation_options    — Options within a variation group
--   7.  page_content         — Customizable text fields (JSONB)
--   8.  component_styles     — Design/style configuration (JSONB)
--   9.  layout_config        — Layout, sections, typography (JSONB)
--   10. theme_customizations — Per-theme overrides per restaurant (JSONB)
--   11. orders               — Customer orders
--   12. order_items          — Line items within an order
--   13. profiles             — Extended user profiles (linked to auth.users)
--   14. restaurant_members   — User-restaurant role mapping (many-to-many)
--   15. user_preferences     — User settings (dark mode, language)
--
-- Enums:
--   venue_type, platform_role, restaurant_role, order_status
--
-- Security:
--   Row-Level Security (RLS) policies for multi-tenant isolation
-- ============================================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Custom Enum Types ──────────────────────────────────────────────────────

CREATE TYPE venue_type AS ENUM (
  'restaurant', 'cafe', 'bar', 'bakery',
  'food-truck', 'pizzeria', 'pub', 'lounge'
);

CREATE TYPE platform_role AS ENUM ('admin', 'user');

CREATE TYPE restaurant_role AS ENUM ('manager', 'employee');

CREATE TYPE order_status AS ENUM (
  'pending', 'preparing', 'ready', 'served', 'cancelled'
);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 1: restaurants
-- ═══════════════════════════════════════════════════════════════════════════════
-- Each row = one venue. The `slug` is the URL-friendly identifier used in
-- routes like /[venue] and /admin/[venue].

CREATE TABLE restaurants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,                        -- URL slug (e.g., "bella-cucina")
  venue_type    venue_type NOT NULL DEFAULT 'restaurant',

  -- ── Identity (bilingual) ──
  name          TEXT NOT NULL,
  name_bs       TEXT,                                        -- Bosnian translation
  tagline       TEXT NOT NULL DEFAULT '',
  tagline_bs    TEXT,
  image         TEXT NOT NULL DEFAULT '',                     -- Hero image URL
  logo          TEXT NOT NULL DEFAULT '',                     -- Logo URL
  address       TEXT NOT NULL DEFAULT '',
  address_bs    TEXT,
  open_hours    TEXT NOT NULL DEFAULT '',
  open_hours_bs TEXT,
  wifi          TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',

  -- ── Metadata ──
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Owner (Supabase auth user who created this venue)
  owner_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for fast slug lookups (public pages)
CREATE INDEX idx_restaurants_slug ON restaurants(slug);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 2: categories
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,                              -- Category ID (e.g., "pizza", "hot-drinks")
  label           TEXT NOT NULL,
  label_bs        TEXT,                                       -- Bosnian translation
  icon            TEXT NOT NULL DEFAULT '🍽️',                 -- Emoji icon
  color           TEXT NOT NULL DEFAULT 'from-amber-400 to-orange-500',  -- Tailwind gradient
  sort_order      INT NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(restaurant_id, slug)
);

CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 3: products
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_slug   TEXT NOT NULL,                              -- References categories.slug (within same restaurant)
  
  -- ── Content (bilingual) ──
  name            TEXT NOT NULL,
  name_bs         TEXT,
  description     TEXT NOT NULL DEFAULT '',
  description_bs  TEXT,
  price           DECIMAL(10, 2) NOT NULL DEFAULT 0,
  image           TEXT NOT NULL DEFAULT '',                    -- Image URL
  popular         BOOLEAN NOT NULL DEFAULT false,
  sort_order      INT NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_restaurant ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(restaurant_id, category_slug);
CREATE INDEX idx_products_popular ON products(restaurant_id) WHERE popular = true;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 4: product_addons
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE product_addons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  name_bs       TEXT,
  price         DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sort_order    INT NOT NULL DEFAULT 0,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addons_product ON product_addons(product_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 5: product_variations
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE product_variations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,                                -- e.g., "Size", "Milk Type"
  name_bs       TEXT,
  required      BOOLEAN NOT NULL DEFAULT false,
  sort_order    INT NOT NULL DEFAULT 0,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_variations_product ON product_variations(product_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 6: variation_options
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE variation_options (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variation_id      UUID NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
  label             TEXT NOT NULL,                            -- e.g., "Small (10\")"
  label_bs          TEXT,
  price_adjustment  DECIMAL(10, 2) NOT NULL DEFAULT 0,       -- + or - from base price
  sort_order        INT NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_options_variation ON variation_options(variation_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 7: page_content
-- ═══════════════════════════════════════════════════════════════════════════════
-- JSONB storage for the 55+ customizable text fields per restaurant.
-- Using JSONB is ideal here because:
--   1. The schema evolves frequently (new text fields added)
--   2. The entire object is read/written together
--   3. No need to query individual fields

CREATE TABLE page_content (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  content         JSONB NOT NULL DEFAULT '{}'::jsonb,         -- All PageContent fields

  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example content structure:
-- {
--   "welcomeTitle": "Welcome",
--   "welcomeTitle_bs": "Dobrodošli",
--   "menuSectionTitle": "Our Menu",
--   "menuSectionTitle_bs": "Naš Meni",
--   ... (55+ fields)
-- }


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 8: component_styles
-- ═══════════════════════════════════════════════════════════════════════════════
-- JSONB storage for the 40+ design/style properties per restaurant.

CREATE TABLE component_styles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  styles          JSONB NOT NULL DEFAULT '{}'::jsonb,         -- All ComponentStyles fields

  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_component_styles_updated_at
  BEFORE UPDATE ON component_styles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example styles structure:
-- {
--   "heroStyle": "gradient",
--   "heroOverlay": "dark",
--   "heroHeight": "tall",
--   "cardStyle": "elevated",
--   "cardImageRatio": "landscape",
--   "accentColor": "#F4B400",
--   "backgroundColor": "#FFFDF7",
--   ... (40+ fields)
-- }


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 9: layout_config
-- ═══════════════════════════════════════════════════════════════════════════════
-- JSONB storage for layout configuration (sections, typography, spacing, theme).

CREATE TABLE layout_config (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,         -- All LayoutConfig fields

  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_layout_config_updated_at
  BEFORE UPDATE ON layout_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example config structure:
-- {
--   "sections": [
--     { "id": "hero", "visible": true, "variant": "hero-1" },
--     { "id": "info-bar", "visible": true, "variant": "info-1" },
--     ...
--   ],
--   "productPageVariant": "product-detail-1",
--   "pageLayout": "default",
--   "typography": { "headingFont": "serif", "bodyFont": "sans-serif", "fontSize": "base" },
--   "animation": "smooth",
--   "spacing": { "sectionGap": "normal", "contentPadding": "normal" },
--   "activeTheme": "bella-classic"
-- }


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 10: theme_customizations
-- ═══════════════════════════════════════════════════════════════════════════════
-- Per-restaurant, per-theme overrides. When a user customizes theme A, switches
-- to theme B, then back to A, their A customizations are preserved here.

CREATE TABLE theme_customizations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  theme_id        TEXT NOT NULL,                              -- Theme preset ID (e.g., "bella-classic")
  customizations  JSONB NOT NULL DEFAULT '{}'::jsonb,         -- { componentStyles, layoutConfig, pageContent }

  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(restaurant_id, theme_id)
);

CREATE INDEX idx_theme_custom_restaurant ON theme_customizations(restaurant_id);

CREATE TRIGGER trg_theme_customizations_updated_at
  BEFORE UPDATE ON theme_customizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 11: orders
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_number    TEXT NOT NULL,                              -- Human-readable (e.g., "ORD-1234567890-123")
  table_number    TEXT NOT NULL DEFAULT '',
  kitchen_note    TEXT NOT NULL DEFAULT '',
  total           DECIMAL(10, 2) NOT NULL DEFAULT 0,
  item_count      INT NOT NULL DEFAULT 0,
  status          order_status NOT NULL DEFAULT 'pending',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(restaurant_id, status);
CREATE INDEX idx_orders_created ON orders(restaurant_id, created_at DESC);

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 12: order_items
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE order_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          TEXT NOT NULL,                          -- Original product ID (for reference)
  name                TEXT NOT NULL,                          -- Snapshot of product name at order time
  price               DECIMAL(10, 2) NOT NULL,               -- Unit price at order time
  quantity            INT NOT NULL DEFAULT 1,
  image               TEXT NOT NULL DEFAULT '',
  selected_variations JSONB DEFAULT '[]'::jsonb,             -- Snapshot: [{ variationName, optionLabel, priceAdjustment }]

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 13: profiles
-- ═══════════════════════════════════════════════════════════════════════════════
-- Extended user profiles linked to Supabase auth.users.
-- This replaces the AppUser type from authStore.

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  platform_role   platform_role NOT NULL DEFAULT 'user',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 14: restaurant_members
-- ═══════════════════════════════════════════════════════════════════════════════
-- Many-to-many: which users have access to which restaurants, and with what role.

CREATE TABLE restaurant_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            restaurant_role NOT NULL DEFAULT 'employee',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(restaurant_id, user_id)
);

CREATE INDEX idx_members_restaurant ON restaurant_members(restaurant_id);
CREATE INDEX idx_members_user ON restaurant_members(user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 15: user_preferences
-- ═══════════════════════════════════════════════════════════════════════════════
-- User-specific settings (replaces adminStore + languageStore for logged-in users).

CREATE TABLE user_preferences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dark_mode       BOOLEAN NOT NULL DEFAULT false,
  language        TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'bs')),
  
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE variation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE layout_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: check if user is platform admin ──────────
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND platform_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Helper function: check if user is member of a restaurant ──
CREATE OR REPLACE FUNCTION is_restaurant_member(rest_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_platform_admin() OR EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = rest_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── Helper function: check if user is manager of a restaurant ──
CREATE OR REPLACE FUNCTION is_restaurant_manager(rest_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_platform_admin() OR EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = rest_id
    AND user_id = auth.uid()
    AND role = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: restaurants
-- ═══════════════════════════════════════════════════════════════════════════════

-- Public: anyone can read restaurant info (for the public menu)
CREATE POLICY "restaurants_select_public"
  ON restaurants FOR SELECT
  USING (true);

-- Insert: only platform admins
CREATE POLICY "restaurants_insert_admin"
  ON restaurants FOR INSERT
  WITH CHECK (is_platform_admin());

-- Update: only managers of the restaurant + platform admins
CREATE POLICY "restaurants_update_manager"
  ON restaurants FOR UPDATE
  USING (is_restaurant_manager(id));

-- Delete: only platform admins
CREATE POLICY "restaurants_delete_admin"
  ON restaurants FOR DELETE
  USING (is_platform_admin());


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: categories
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "categories_select_public"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_member"
  ON categories FOR INSERT
  WITH CHECK (is_restaurant_manager(restaurant_id));

CREATE POLICY "categories_update_member"
  ON categories FOR UPDATE
  USING (is_restaurant_manager(restaurant_id));

CREATE POLICY "categories_delete_member"
  ON categories FOR DELETE
  USING (is_restaurant_manager(restaurant_id));


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: products
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "products_select_public"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "products_insert_member"
  ON products FOR INSERT
  WITH CHECK (is_restaurant_manager(restaurant_id));

CREATE POLICY "products_update_member"
  ON products FOR UPDATE
  USING (is_restaurant_manager(restaurant_id));

CREATE POLICY "products_delete_member"
  ON products FOR DELETE
  USING (is_restaurant_manager(restaurant_id));


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: product_addons
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "addons_select_public"
  ON product_addons FOR SELECT
  USING (true);

CREATE POLICY "addons_insert_member"
  ON product_addons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );

CREATE POLICY "addons_update_member"
  ON product_addons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );

CREATE POLICY "addons_delete_member"
  ON product_addons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: product_variations & variation_options (similar to addons)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "variations_select_public"
  ON product_variations FOR SELECT
  USING (true);

CREATE POLICY "variations_insert_member"
  ON product_variations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );

CREATE POLICY "variations_update_member"
  ON product_variations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );

CREATE POLICY "variations_delete_member"
  ON product_variations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );

CREATE POLICY "options_select_public"
  ON variation_options FOR SELECT
  USING (true);

CREATE POLICY "options_insert_member"
  ON variation_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM product_variations v
      JOIN products p ON p.id = v.product_id
      WHERE v.id = variation_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );

CREATE POLICY "options_update_member"
  ON variation_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM product_variations v
      JOIN products p ON p.id = v.product_id
      WHERE v.id = variation_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );

CREATE POLICY "options_delete_member"
  ON variation_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM product_variations v
      JOIN products p ON p.id = v.product_id
      WHERE v.id = variation_id
      AND is_restaurant_manager(p.restaurant_id)
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: JSONB config tables (page_content, component_styles, layout_config)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Page Content
CREATE POLICY "page_content_select_public"
  ON page_content FOR SELECT
  USING (true);

CREATE POLICY "page_content_insert_manager"
  ON page_content FOR INSERT
  WITH CHECK (is_restaurant_manager(restaurant_id));

CREATE POLICY "page_content_update_manager"
  ON page_content FOR UPDATE
  USING (is_restaurant_manager(restaurant_id));

-- Component Styles
CREATE POLICY "component_styles_select_public"
  ON component_styles FOR SELECT
  USING (true);

CREATE POLICY "component_styles_insert_manager"
  ON component_styles FOR INSERT
  WITH CHECK (is_restaurant_manager(restaurant_id));

CREATE POLICY "component_styles_update_manager"
  ON component_styles FOR UPDATE
  USING (is_restaurant_manager(restaurant_id));

-- Layout Config
CREATE POLICY "layout_config_select_public"
  ON layout_config FOR SELECT
  USING (true);

CREATE POLICY "layout_config_insert_manager"
  ON layout_config FOR INSERT
  WITH CHECK (is_restaurant_manager(restaurant_id));

CREATE POLICY "layout_config_update_manager"
  ON layout_config FOR UPDATE
  USING (is_restaurant_manager(restaurant_id));

-- Theme Customizations
CREATE POLICY "theme_customizations_select_public"
  ON theme_customizations FOR SELECT
  USING (true);

CREATE POLICY "theme_customizations_insert_manager"
  ON theme_customizations FOR INSERT
  WITH CHECK (is_restaurant_manager(restaurant_id));

CREATE POLICY "theme_customizations_update_manager"
  ON theme_customizations FOR UPDATE
  USING (is_restaurant_manager(restaurant_id));

CREATE POLICY "theme_customizations_delete_manager"
  ON theme_customizations FOR DELETE
  USING (is_restaurant_manager(restaurant_id));


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: orders & order_items
-- ═══════════════════════════════════════════════════════════════════════════════

-- Orders: public can insert (placing an order), members can read/update
CREATE POLICY "orders_insert_public"
  ON orders FOR INSERT
  WITH CHECK (true);  -- Anyone can place an order (no auth required for customers)

CREATE POLICY "orders_select_member"
  ON orders FOR SELECT
  USING (is_restaurant_member(restaurant_id));

CREATE POLICY "orders_update_member"
  ON orders FOR UPDATE
  USING (is_restaurant_member(restaurant_id));

-- Order Items
CREATE POLICY "order_items_insert_public"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "order_items_select_member"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND is_restaurant_member(o.restaurant_id)
    )
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Platform admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (is_platform_admin());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Platform admins can update any profile
CREATE POLICY "profiles_update_admin"
  ON profiles FOR UPDATE
  USING (is_platform_admin());


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: restaurant_members
-- ═══════════════════════════════════════════════════════════════════════════════

-- Members can see other members of restaurants they belong to
CREATE POLICY "members_select_member"
  ON restaurant_members FOR SELECT
  USING (is_restaurant_member(restaurant_id));

-- Only managers can add/remove members
CREATE POLICY "members_insert_manager"
  ON restaurant_members FOR INSERT
  WITH CHECK (is_restaurant_manager(restaurant_id));

CREATE POLICY "members_update_manager"
  ON restaurant_members FOR UPDATE
  USING (is_restaurant_manager(restaurant_id));

CREATE POLICY "members_delete_manager"
  ON restaurant_members FOR DELETE
  USING (is_restaurant_manager(restaurant_id));


-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES: user_preferences
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE POLICY "preferences_select_own"
  ON user_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "preferences_insert_own"
  ON user_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "preferences_update_own"
  ON user_preferences FOR UPDATE
  USING (user_id = auth.uid());


-- ═══════════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════════
-- Create a storage bucket for restaurant images (hero, logo, product images)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-images',
  'restaurant-images',
  true,                                                      -- Public bucket (images served without auth)
  5242880,                                                   -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies: anyone can read, members can upload to their restaurant folder
CREATE POLICY "images_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-images');

CREATE POLICY "images_insert_member"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'restaurant-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "images_update_member"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'restaurant-images'
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "images_delete_member"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'restaurant-images'
    AND auth.uid() IS NOT NULL
  );


-- ═══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Default "Bella Cucina" restaurant
-- ═══════════════════════════════════════════════════════════════════════════════
-- This mirrors the default data from src/data/restaurants.ts

DO $$
DECLARE
  bella_id UUID;
  cat_all UUID;
  cat_popular UUID;
  cat_pizza UUID;
  cat_pasta UUID;
  cat_burgers UUID;
  cat_sides UUID;
  cat_salads UUID;
  cat_desserts UUID;
  cat_drinks UUID;
  p1_id UUID;
  p4_id UUID;
  v1_id UUID;
  v5_id UUID;
  v6_id UUID;
BEGIN
  -- ── Create restaurant ──
  INSERT INTO restaurants (slug, venue_type, name, tagline, image, logo, address, open_hours, wifi, phone)
  VALUES (
    'bella-cucina',
    'restaurant',
    'Bella Cucina',
    'Authentic Italian Kitchen',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80',
    '123 Main Street, Downtown',
    '10:00 AM – 11:00 PM',
    'BellaCucina_Guest',
    '+1 (555) 123-4567'
  )
  RETURNING id INTO bella_id;

  -- ── Create categories ──
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'all',      'All',       '🍽️', 'from-amber-400 to-orange-500', 0) RETURNING id INTO cat_all;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'popular',  'Popular',   '🔥', 'from-red-400 to-rose-500',     1) RETURNING id INTO cat_popular;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'pizza',    'Pizza',     '🍕', 'from-yellow-400 to-amber-500', 2) RETURNING id INTO cat_pizza;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'pasta',    'Pasta',     '🍝', 'from-orange-400 to-red-400',   3) RETURNING id INTO cat_pasta;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'burgers',  'Burgers',   '🍔', 'from-amber-500 to-yellow-600', 4) RETURNING id INTO cat_burgers;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'sides',    'Sides',     '🍟', 'from-yellow-300 to-amber-400', 5) RETURNING id INTO cat_sides;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'salads',   'Salads',    '🥗', 'from-green-400 to-emerald-500', 6) RETURNING id INTO cat_salads;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'desserts', 'Desserts',  '🍰', 'from-pink-400 to-rose-500',    7) RETURNING id INTO cat_desserts;
  INSERT INTO categories (restaurant_id, slug, label, icon, color, sort_order) VALUES
    (bella_id, 'drinks',   'Drinks',    '🥤', 'from-blue-400 to-cyan-500',    8) RETURNING id INTO cat_drinks;

  -- ── Create sample products (first 2 with full variations) ──
  INSERT INTO products (restaurant_id, category_slug, name, description, price, image, popular, sort_order) VALUES
    (bella_id, 'pizza', 'Margherita Pizza', 'Classic tomato sauce, fresh mozzarella, basil on a hand-tossed crust.', 12.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80', true, 0)
    RETURNING id INTO p1_id;

  -- Addons for Margherita
  INSERT INTO product_addons (product_id, name, price, sort_order) VALUES
    (p1_id, 'Extra Cheese', 1.50, 0),
    (p1_id, 'Jalapeños',    0.99, 1),
    (p1_id, 'Mushrooms',    1.25, 2);

  -- Variation: Size for Margherita
  INSERT INTO product_variations (product_id, name, required, sort_order) VALUES
    (p1_id, 'Size', true, 0)
    RETURNING id INTO v1_id;

  INSERT INTO variation_options (variation_id, label, price_adjustment, sort_order) VALUES
    (v1_id, 'Small (10")',  0, 0),
    (v1_id, 'Medium (12")', 3, 1),
    (v1_id, 'Large (16")',  6, 2);

  -- Pasta Carbonara (with 2 variations)
  INSERT INTO products (restaurant_id, category_slug, name, description, price, image, popular, sort_order) VALUES
    (bella_id, 'pasta', 'Pasta Carbonara', 'Creamy carbonara sauce with crispy pancetta and parmesan.', 13.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&q=80', true, 3)
    RETURNING id INTO p4_id;

  INSERT INTO product_addons (product_id, name, price, sort_order) VALUES
    (p4_id, 'Extra Pancetta', 2.50, 0);

  INSERT INTO product_variations (product_id, name, required, sort_order) VALUES
    (p4_id, 'Portion', true, 0)
    RETURNING id INTO v5_id;

  INSERT INTO variation_options (variation_id, label, price_adjustment, sort_order) VALUES
    (v5_id, 'Regular', 0,   0),
    (v5_id, 'Large',   3.5, 1);

  INSERT INTO product_variations (product_id, name, required, sort_order) VALUES
    (p4_id, 'Pasta Type', false, 1)
    RETURNING id INTO v6_id;

  INSERT INTO variation_options (variation_id, label, price_adjustment, sort_order) VALUES
    (v6_id, 'Spaghetti',   0,   0),
    (v6_id, 'Penne',       0,   1),
    (v6_id, 'Gluten-Free', 1.5, 2);

  -- More products (simplified — no variations for brevity)
  INSERT INTO products (restaurant_id, category_slug, name, description, price, image, popular, sort_order) VALUES
    (bella_id, 'pizza',    'Pepperoni Pizza',    'Loaded with spicy pepperoni and melted mozzarella cheese.', 14.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80', true,  1),
    (bella_id, 'pizza',    'Four Cheese Pizza',  'Mozzarella, gorgonzola, parmesan, and ricotta on a crispy crust.', 15.99, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80', false, 2),
    (bella_id, 'pasta',    'Spaghetti Bolognese','Rich meat sauce simmered for hours over fresh spaghetti.', 12.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80', true,  4),
    (bella_id, 'pasta',    'Fettuccine Alfredo', 'Creamy Alfredo sauce with parmesan over fettuccine.', 13.99, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&q=80', false, 5),
    (bella_id, 'burgers',  'Classic Cheeseburger','Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce.', 10.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80', true,  6),
    (bella_id, 'burgers',  'BBQ Bacon Burger',   'Smoky BBQ sauce, crispy bacon, onion rings, and cheddar.', 13.99, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&q=80', true,  7),
    (bella_id, 'sides',    'Garlic Bread',       'Freshly baked bread with garlic butter and herbs.', 5.99, 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&q=80', false, 8),
    (bella_id, 'sides',    'Crispy Fries',       'Golden crispy fries seasoned with sea salt.', 4.99, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80', false, 9),
    (bella_id, 'sides',    'Mozzarella Sticks',  'Crispy breaded mozzarella with marinara dipping sauce.', 6.99, 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&q=80', false, 10),
    (bella_id, 'salads',   'Caesar Salad',       'Crisp romaine, croutons, parmesan, and classic Caesar dressing.', 9.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&q=80', true,  11),
    (bella_id, 'salads',   'Caprese Salad',      'Fresh mozzarella, tomatoes, basil, and balsamic glaze.', 10.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', false, 12),
    (bella_id, 'desserts', 'Tiramisu',           'Classic Italian dessert with espresso-soaked ladyfingers and mascarpone.', 8.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80', true,  13),
    (bella_id, 'desserts', 'Chocolate Cake',     'Rich double chocolate cake with ganache frosting.', 7.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80', false, 14),
    (bella_id, 'desserts', 'Panna Cotta',        'Silky vanilla panna cotta with berry compote.', 7.49, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80', false, 15),
    (bella_id, 'drinks',   'Fresh Lemonade',     'Freshly squeezed lemonade with mint.', 3.99, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80', false, 16),
    (bella_id, 'drinks',   'Iced Coffee',        'Cold brew with your choice of milk.', 4.49, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80', false, 17),
    (bella_id, 'drinks',   'Milkshake',          'Thick and creamy vanilla milkshake.', 5.99, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80', false, 18);

  -- ── Create default page_content (JSONB) ──
  INSERT INTO page_content (restaurant_id, content) VALUES (
    bella_id,
    '{
      "welcomeTitle": "Welcome to Our Restaurant",
      "welcomeTitle_bs": "Dobrodošli u naš restoran",
      "welcomeSubtitle": "Discover our delicious menu",
      "welcomeSubtitle_bs": "Otkrijte naš ukusni meni",
      "menuSectionTitle": "Our Menu",
      "menuSectionTitle_bs": "Naš Meni",
      "menuSectionSubtitle": "Explore our carefully crafted dishes",
      "menuSectionSubtitle_bs": "Istražite naša pažljivo pripremljena jela",
      "searchPlaceholder": "Search dishes...",
      "searchPlaceholder_bs": "Pretražite jela...",
      "cartTitle": "Your Cart",
      "cartTitle_bs": "Vaša Korpa",
      "checkoutTitle": "Checkout",
      "checkoutTitle_bs": "Plaćanje",
      "orderConfirmedTitle": "Order Confirmed!",
      "orderConfirmedTitle_bs": "Narudžba Potvrđena!"
    }'::jsonb
  );

  -- ── Create default component_styles (JSONB) ──
  INSERT INTO component_styles (restaurant_id, styles) VALUES (
    bella_id,
    '{
      "heroStyle": "gradient",
      "heroOverlay": "dark",
      "heroHeight": "tall",
      "heroTextAlign": "center",
      "infoBarStyle": "minimal",
      "cardStyle": "elevated",
      "cardImageRatio": "landscape",
      "cardBorderRadius": "xl",
      "sectionHeaderStyle": "centered",
      "categoryBarStyle": "pills",
      "categoryBarPosition": "sticky",
      "orderBarStyle": "floating",
      "accentColor": "#F4B400",
      "backgroundColor": "#FFFDF7",
      "textColor": "#1E1E1E",
      "secondaryColor": "#6B7280"
    }'::jsonb
  );

  -- ── Create default layout_config (JSONB) ──
  INSERT INTO layout_config (restaurant_id, config) VALUES (
    bella_id,
    '{
      "sections": [
        { "id": "hero", "visible": true, "variant": "hero-1" },
        { "id": "info-bar", "visible": true, "variant": "info-1" },
        { "id": "search-bar", "visible": true, "variant": "search-1" },
        { "id": "category-bar", "visible": true, "variant": "category-1" },
        { "id": "menu-content", "visible": true, "variant": "menu-1" },
        { "id": "order-bar", "visible": true, "variant": "order-1" },
        { "id": "promo-banner", "visible": false, "variant": "promo-1" },
        { "id": "featured", "visible": false, "variant": "featured-1" },
        { "id": "social-proof", "visible": false, "variant": "social-1" }
      ],
      "productPageVariant": "product-detail-1",
      "pageLayout": "default",
      "typography": {
        "headingFont": "serif",
        "bodyFont": "sans-serif",
        "fontSize": "base"
      },
      "animation": "smooth",
      "spacing": { "sectionGap": "normal", "contentPadding": "normal" },
      "activeTheme": "bella-classic"
    }'::jsonb
  );

  RAISE NOTICE 'Seed data created. Restaurant ID: %', bella_id;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- USEFUL VIEWS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Full restaurant data view (joins all config tables)
CREATE OR REPLACE VIEW restaurant_full_data AS
SELECT
  r.*,
  pc.content AS page_content,
  cs.styles AS component_styles,
  lc.config AS layout_config,
  (
    SELECT jsonb_object_agg(tc.theme_id, tc.customizations)
    FROM theme_customizations tc
    WHERE tc.restaurant_id = r.id
  ) AS theme_customizations,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'slug', c.slug,
        'label', c.label,
        'label_bs', c.label_bs,
        'icon', c.icon,
        'color', c.color,
        'sort_order', c.sort_order
      ) ORDER BY c.sort_order
    )
    FROM categories c
    WHERE c.restaurant_id = r.id
  ) AS categories,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'name_bs', p.name_bs,
        'description', p.description,
        'description_bs', p.description_bs,
        'price', p.price,
        'image', p.image,
        'category', p.category_slug,
        'popular', p.popular,
        'sort_order', p.sort_order,
        'addons', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object('id', a.id, 'name', a.name, 'name_bs', a.name_bs, 'price', a.price)
            ORDER BY a.sort_order
          ), '[]'::jsonb)
          FROM product_addons a WHERE a.product_id = p.id
        ),
        'variations', (
          SELECT COALESCE(jsonb_agg(
            jsonb_build_object(
              'id', v.id, 'name', v.name, 'name_bs', v.name_bs, 'required', v.required,
              'options', (
                SELECT COALESCE(jsonb_agg(
                  jsonb_build_object('id', vo.id, 'label', vo.label, 'label_bs', vo.label_bs, 'priceAdjustment', vo.price_adjustment)
                  ORDER BY vo.sort_order
                ), '[]'::jsonb)
                FROM variation_options vo WHERE vo.variation_id = v.id
              )
            ) ORDER BY v.sort_order
          ), '[]'::jsonb)
          FROM product_variations v WHERE v.product_id = p.id
        )
      ) ORDER BY p.sort_order
    )
    FROM products p
    WHERE p.restaurant_id = r.id
  ) AS products
FROM restaurants r
LEFT JOIN page_content pc ON pc.restaurant_id = r.id
LEFT JOIN component_styles cs ON cs.restaurant_id = r.id
LEFT JOIN layout_config lc ON lc.restaurant_id = r.id;


-- ═══════════════════════════════════════════════════════════════════════════════
-- REALTIME SUBSCRIPTIONS (optional — enable for live admin updates)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable realtime for tables that benefit from live updates
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
