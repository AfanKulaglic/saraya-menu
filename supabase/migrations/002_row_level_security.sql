-- ============================================================
-- Saraya CMS — Supabase Migration: Row Level Security
-- ============================================================
-- RLS policies ensure data isolation:
--   • Public visitors can READ restaurant/menu data
--   • Only authenticated staff can WRITE their assigned venues
--   • Only platform admins can manage users & create venues
-- ============================================================

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variation_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_styles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_config     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders            ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- Helper: Get the app user row for the current Supabase auth user
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid() AND platform_role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_restaurant_role(
  p_restaurant_id TEXT,
  p_role TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_access ra
    JOIN public.users u ON u.id = ra.user_id
    WHERE u.auth_id = auth.uid()
      AND ra.restaurant_id = p_restaurant_id
      AND (p_role IS NULL OR ra.role = p_role)
  ) OR public.is_platform_admin();
$$;

-- ═══════════════════════════════════════════════════════════
-- RESTAURANTS — Public read, admin/manager write
-- ═══════════════════════════════════════════════════════════

-- Anyone can view restaurants (public menu pages)
CREATE POLICY "restaurants_select_public"
  ON public.restaurants FOR SELECT
  USING (true);

-- Platform admins can create venues
CREATE POLICY "restaurants_insert_admin"
  ON public.restaurants FOR INSERT
  WITH CHECK (public.is_platform_admin());

-- Managers of the venue (or platform admins) can update
CREATE POLICY "restaurants_update_manager"
  ON public.restaurants FOR UPDATE
  USING (public.has_restaurant_role(id, 'manager'));

-- Only platform admins can delete venues
CREATE POLICY "restaurants_delete_admin"
  ON public.restaurants FOR DELETE
  USING (public.is_platform_admin());

-- ═══════════════════════════════════════════════════════════
-- CATEGORIES — Public read, manager write
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_manager"
  ON public.categories FOR INSERT
  WITH CHECK (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "categories_update_manager"
  ON public.categories FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "categories_delete_manager"
  ON public.categories FOR DELETE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

-- ═══════════════════════════════════════════════════════════
-- PRODUCTS — Public read, manager write
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products_insert_manager"
  ON public.products FOR INSERT
  WITH CHECK (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "products_update_manager"
  ON public.products FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "products_delete_manager"
  ON public.products FOR DELETE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

-- ═══════════════════════════════════════════════════════════
-- ADDONS — Public read, manager write (via product's restaurant)
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "addons_select_public"
  ON public.addons FOR SELECT
  USING (true);

CREATE POLICY "addons_insert_manager"
  ON public.addons FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

CREATE POLICY "addons_update_manager"
  ON public.addons FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

CREATE POLICY "addons_delete_manager"
  ON public.addons FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

-- ═══════════════════════════════════════════════════════════
-- VARIATIONS & OPTIONS — same pattern as addons
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "variations_select_public"
  ON public.variations FOR SELECT
  USING (true);

CREATE POLICY "variations_insert_manager"
  ON public.variations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

CREATE POLICY "variations_update_manager"
  ON public.variations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

CREATE POLICY "variations_delete_manager"
  ON public.variations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

CREATE POLICY "variation_options_select_public"
  ON public.variation_options FOR SELECT
  USING (true);

CREATE POLICY "variation_options_insert_manager"
  ON public.variation_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.variations v
      JOIN public.products p ON p.id = v.product_id
      WHERE v.id = variation_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

CREATE POLICY "variation_options_update_manager"
  ON public.variation_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.variations v
      JOIN public.products p ON p.id = v.product_id
      WHERE v.id = variation_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

CREATE POLICY "variation_options_delete_manager"
  ON public.variation_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.variations v
      JOIN public.products p ON p.id = v.product_id
      WHERE v.id = variation_id
        AND public.has_restaurant_role(p.restaurant_id, 'manager')
    )
  );

-- ═══════════════════════════════════════════════════════════
-- PAGE CONTENT / COMPONENT STYLES / LAYOUT CONFIG
-- Public read, manager write
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "page_content_select_public"
  ON public.page_content FOR SELECT USING (true);
CREATE POLICY "page_content_upsert_manager"
  ON public.page_content FOR INSERT
  WITH CHECK (public.has_restaurant_role(restaurant_id, 'manager'));
CREATE POLICY "page_content_update_manager"
  ON public.page_content FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "component_styles_select_public"
  ON public.component_styles FOR SELECT USING (true);
CREATE POLICY "component_styles_upsert_manager"
  ON public.component_styles FOR INSERT
  WITH CHECK (public.has_restaurant_role(restaurant_id, 'manager'));
CREATE POLICY "component_styles_update_manager"
  ON public.component_styles FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "layout_config_select_public"
  ON public.layout_config FOR SELECT USING (true);
CREATE POLICY "layout_config_upsert_manager"
  ON public.layout_config FOR INSERT
  WITH CHECK (public.has_restaurant_role(restaurant_id, 'manager'));
CREATE POLICY "layout_config_update_manager"
  ON public.layout_config FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

-- ═══════════════════════════════════════════════════════════
-- THEME CUSTOMIZATIONS — Public read, manager write
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "theme_customizations_select_public"
  ON public.theme_customizations FOR SELECT USING (true);
CREATE POLICY "theme_customizations_insert_manager"
  ON public.theme_customizations FOR INSERT
  WITH CHECK (public.has_restaurant_role(restaurant_id, 'manager'));
CREATE POLICY "theme_customizations_update_manager"
  ON public.theme_customizations FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));
CREATE POLICY "theme_customizations_delete_manager"
  ON public.theme_customizations FOR DELETE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

-- ═══════════════════════════════════════════════════════════
-- ORDERS — Staff read, any authenticated user can insert
-- ═══════════════════════════════════════════════════════════

-- Staff of the venue can read all orders
CREATE POLICY "orders_select_staff"
  ON public.orders FOR SELECT
  USING (public.has_restaurant_role(restaurant_id));

-- Customers (anon / authenticated) can create orders
CREATE POLICY "orders_insert_public"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Staff can update order status
CREATE POLICY "orders_update_staff"
  ON public.orders FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id));

-- Only managers can delete orders
CREATE POLICY "orders_delete_manager"
  ON public.orders FOR DELETE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

-- ═══════════════════════════════════════════════════════════
-- USERS & RESTAURANT_ACCESS — Admin-managed
-- ═══════════════════════════════════════════════════════════

-- Users can read their own profile; admins can read all
CREATE POLICY "users_select"
  ON public.users FOR SELECT
  USING (auth_id = auth.uid() OR public.is_platform_admin());

-- Only admins create users (or self-insert on signup via trigger)
CREATE POLICY "users_insert_admin"
  ON public.users FOR INSERT
  WITH CHECK (public.is_platform_admin() OR auth_id = auth.uid());

CREATE POLICY "users_update"
  ON public.users FOR UPDATE
  USING (auth_id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "users_delete_admin"
  ON public.users FOR DELETE
  USING (public.is_platform_admin());

-- Restaurant access: visible to venue managers and admins
CREATE POLICY "restaurant_access_select"
  ON public.restaurant_access FOR SELECT
  USING (
    user_id = public.current_app_user_id()
    OR public.has_restaurant_role(restaurant_id, 'manager')
  );

CREATE POLICY "restaurant_access_insert_admin"
  ON public.restaurant_access FOR INSERT
  WITH CHECK (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "restaurant_access_update_admin"
  ON public.restaurant_access FOR UPDATE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));

CREATE POLICY "restaurant_access_delete_admin"
  ON public.restaurant_access FOR DELETE
  USING (public.has_restaurant_role(restaurant_id, 'manager'));
