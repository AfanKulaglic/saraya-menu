// ─── Restaurant Service ──────────────────────────────────
// Replaces: cmsStore's allRestaurants CRUD + flat field management
// Handles: Restaurant info, page content, styles, layout, themes

import { supabase } from '@/lib/supabase';
import type { Tables, InsertDto, UpdateDto } from '@/types/supabase';
import type { PageContent, ComponentStyles, LayoutConfig } from '@/types/cms';

export type RestaurantRow = Tables<'restaurants'>;

// ─── Restaurant CRUD ─────────────────────────────────────

export async function getAllRestaurants(): Promise<RestaurantRow[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRestaurant(slug: string): Promise<RestaurantRow | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', slug)
    .single();

  if (error?.code === 'PGRST116') return null; // not found
  if (error) throw error;
  return data;
}

export async function createRestaurant(restaurant: InsertDto<'restaurants'>): Promise<RestaurantRow> {
  const { data, error } = await supabase
    .from('restaurants')
    .insert(restaurant)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRestaurant(slug: string, updates: UpdateDto<'restaurants'>): Promise<RestaurantRow> {
  const { data, error } = await supabase
    .from('restaurants')
    .update(updates)
    .eq('id', slug)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRestaurant(slug: string) {
  const { error } = await supabase.from('restaurants').delete().eq('id', slug);
  if (error) throw error;
}

// ─── Page Content (JSONB) ────────────────────────────────

export async function getPageContent(restaurantId: string): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('page_content')
    .select('content')
    .eq('restaurant_id', restaurantId)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data?.content as unknown as PageContent;
}

export async function savePageContent(restaurantId: string, content: PageContent) {
  const { error } = await supabase
    .from('page_content')
    .upsert(
      { restaurant_id: restaurantId, content: content as any },
      { onConflict: 'restaurant_id' }
    );

  if (error) throw error;
}

// ─── Component Styles (JSONB) ────────────────────────────

export async function getComponentStyles(restaurantId: string): Promise<ComponentStyles | null> {
  const { data, error } = await supabase
    .from('component_styles')
    .select('styles')
    .eq('restaurant_id', restaurantId)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data?.styles as unknown as ComponentStyles;
}

export async function saveComponentStyles(restaurantId: string, styles: ComponentStyles) {
  const { error } = await supabase
    .from('component_styles')
    .upsert(
      { restaurant_id: restaurantId, styles: styles as any },
      { onConflict: 'restaurant_id' }
    );

  if (error) throw error;
}

// ─── Layout Config (JSONB) ───────────────────────────────

export async function getLayoutConfig(restaurantId: string): Promise<LayoutConfig | null> {
  const { data, error } = await supabase
    .from('layout_config')
    .select('config')
    .eq('restaurant_id', restaurantId)
    .single();

  if (error?.code === 'PGRST116') return null;
  if (error) throw error;
  return data?.config as unknown as LayoutConfig;
}

export async function saveLayoutConfig(restaurantId: string, config: LayoutConfig) {
  const { error } = await supabase
    .from('layout_config')
    .upsert(
      { restaurant_id: restaurantId, config: config as any },
      { onConflict: 'restaurant_id' }
    );

  if (error) throw error;
}

// ─── Theme Customizations ────────────────────────────────

export async function getThemeCustomizations(restaurantId: string) {
  const { data, error } = await supabase
    .from('theme_customizations')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (error) throw error;

  // Convert array to Record<themeId, customization>
  const map: Record<string, {
    component_styles: ComponentStyles;
    layout_config: LayoutConfig;
    page_content: PageContent;
  }> = {};

  for (const row of data ?? []) {
    map[row.theme_id] = {
      component_styles: row.component_styles as unknown as ComponentStyles,
      layout_config: row.layout_config as unknown as LayoutConfig,
      page_content: row.page_content as unknown as PageContent,
    };
  }

  return map;
}

export async function saveThemeCustomization(
  restaurantId: string,
  themeId: string,
  customization: {
    componentStyles: ComponentStyles;
    layoutConfig: LayoutConfig;
    pageContent: PageContent;
  }
) {
  const { error } = await supabase
    .from('theme_customizations')
    .upsert(
      {
        restaurant_id: restaurantId,
        theme_id: themeId,
        component_styles: customization.componentStyles as any,
        layout_config: customization.layoutConfig as any,
        page_content: customization.pageContent as any,
      },
      { onConflict: 'restaurant_id,theme_id' }
    );

  if (error) throw error;
}

// ─── Full Venue Data (convenience) ───────────────────────
// Loads everything for a venue in one go (for public pages)

export async function getFullVenueData(slug: string) {
  const [restaurant, pageContent, componentStyles, layoutConfig, themeCustomizations] =
    await Promise.all([
      getRestaurant(slug),
      getPageContent(slug),
      getComponentStyles(slug),
      getLayoutConfig(slug),
      getThemeCustomizations(slug),
    ]);

  if (!restaurant) return null;

  return {
    restaurant,
    pageContent,
    componentStyles,
    layoutConfig,
    themeCustomizations,
  };
}
