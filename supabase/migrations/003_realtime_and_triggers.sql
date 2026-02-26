-- ============================================================
-- Saraya CMS — Supabase Migration: Realtime & Triggers
-- ============================================================
-- Enable realtime subscriptions for orders (live kitchen view)
-- and auto-create a user profile row on Supabase Auth signup.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Enable Realtime on orders table
-- ─────────────────────────────────────────────────────────────
-- This allows the admin orders page to subscribe to live updates
-- instead of polling. Replaces orderStore's local state.

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ─────────────────────────────────────────────────────────────
-- 2. Auto-create app user profile on Auth signup
-- ─────────────────────────────────────────────────────────────
-- When a new user signs up via Supabase Auth, automatically
-- create a row in public.users with their email and auth_id.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (auth_id, name, email, platform_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────
-- 3. Auto-create CMS rows when a restaurant is created
-- ─────────────────────────────────────────────────────────────
-- Ensures page_content, component_styles, and layout_config
-- rows always exist for every restaurant.

CREATE OR REPLACE FUNCTION public.handle_new_restaurant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.page_content (restaurant_id) VALUES (NEW.id);
  INSERT INTO public.component_styles (restaurant_id) VALUES (NEW.id);
  INSERT INTO public.layout_config (restaurant_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_restaurant_created
  AFTER INSERT ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_restaurant();

-- ─────────────────────────────────────────────────────────────
-- 4. Updated_at tracking (optional quality-of-life)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.restaurants     ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.products        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.page_content    ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.component_styles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.layout_config   ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.orders          ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_page_content_updated_at
  BEFORE UPDATE ON public.page_content
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_component_styles_updated_at
  BEFORE UPDATE ON public.component_styles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_layout_config_updated_at
  BEFORE UPDATE ON public.layout_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
