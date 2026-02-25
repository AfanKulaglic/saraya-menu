// ─── Supabase Data Service ────────────────────────────────────────────────
// High-level functions that mirror the current Zustand store actions but
// use Supabase as the backend instead of localStorage.
//
// Each function here replaces one or more cmsStore / authStore actions.
// The Zustand stores can call these functions and update local state
// on success, providing optimistic UI with server persistence.

import { getSupabase } from "./supabase";
import type { Database } from "./database.types";
import type {
  RestaurantInfo,
  CategoryInfo,
  ProductItem,
  PageContent,
  ComponentStyles,
  LayoutConfig,
} from "@/types/cms";

type Tables = Database["public"]["Tables"];

// ═══════════════════════════════════════════════════════════════════════════════
// RESTAURANT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch a restaurant by slug (public — no auth required).
 * Returns the full restaurant data including categories, products, and config.
 */
export async function fetchRestaurantBySlug(slug: string) {
  const supabase = getSupabase();

  // Use the restaurant_full_data view for a single query
  const { data, error } = await supabase
    .from("restaurant_full_data" as any)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all restaurants (for admin venue grid).
 */
export async function fetchAllRestaurants() {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("restaurants")
    .select(`
      *,
      categories (id, slug, label, label_bs, icon, color, sort_order),
      products (id, name, category_slug, popular)
    `)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Create a new restaurant with default data.
 * Replaces: cmsStore.createRestaurant()
 */
export async function createRestaurant(input: {
  slug: string;
  name: string;
  venueType: string;
  heroImage: string;
  categories: { slug: string; label: string; label_bs?: string; icon: string; color: string }[];
  products: { name: string; name_bs?: string; description: string; description_bs?: string; price: number; image: string; categorySlug: string; popular?: boolean }[];
}) {
  const supabase = getSupabase();

  // 1. Create restaurant
  const { data: restaurant, error: restError } = await supabase
    .from("restaurants")
    .insert({
      slug: input.slug,
      venue_type: input.venueType as any,
      name: input.name,
      tagline: `Welcome to ${input.name}`,
      image: input.heroImage,
      open_hours: "10:00 AM - 10:00 PM",
    })
    .select()
    .single();

  if (restError) throw restError;
  const restaurantId = restaurant.id;

  // 2. Create categories
  const { error: catError } = await supabase.from("categories").insert(
    input.categories.map((c, i) => ({
      restaurant_id: restaurantId,
      slug: c.slug,
      label: c.label,
      label_bs: c.label_bs || null,
      icon: c.icon,
      color: c.color,
      sort_order: i,
    }))
  );
  if (catError) throw catError;

  // 3. Create products
  const { error: prodError } = await supabase.from("products").insert(
    input.products.map((p, i) => ({
      restaurant_id: restaurantId,
      category_slug: p.categorySlug,
      name: p.name,
      name_bs: p.name_bs || null,
      description: p.description,
      description_bs: p.description_bs || null,
      price: p.price,
      image: p.image,
      popular: p.popular || false,
      sort_order: i,
    }))
  );
  if (prodError) throw prodError;

  // 4. Create default JSONB config rows
  await Promise.all([
    supabase.from("page_content").insert({ restaurant_id: restaurantId, content: {} }),
    supabase.from("component_styles").insert({ restaurant_id: restaurantId, styles: {} }),
    supabase.from("layout_config").insert({ restaurant_id: restaurantId, config: {} }),
  ]);

  return restaurant;
}

/**
 * Delete a restaurant and all associated data (CASCADE handles children).
 * Replaces: cmsStore.deleteRestaurant()
 */
export async function deleteRestaurant(restaurantId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", restaurantId);
  if (error) throw error;
}

/**
 * Update restaurant info.
 * Replaces: cmsStore.updateRestaurant()
 */
export async function updateRestaurant(
  restaurantId: string,
  data: Partial<Tables["restaurants"]["Update"]>
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurants")
    .update(data)
    .eq("id", restaurantId);
  if (error) throw error;
}


// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function addCategory(
  restaurantId: string,
  category: { slug: string; label: string; label_bs?: string; icon: string; color: string; sortOrder: number }
) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      restaurant_id: restaurantId,
      slug: category.slug,
      label: category.label,
      label_bs: category.label_bs || null,
      icon: category.icon,
      color: category.color,
      sort_order: category.sortOrder,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  categoryId: string,
  data: Partial<Tables["categories"]["Update"]>
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", categoryId);
  if (error) throw error;
}

export async function deleteCategory(categoryId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);
  if (error) throw error;
}

export async function reorderCategories(
  categoryIds: { id: string; sortOrder: number }[]
) {
  const supabase = getSupabase();
  // Batch update by using Promise.all
  await Promise.all(
    categoryIds.map(({ id, sortOrder }) =>
      supabase.from("categories").update({ sort_order: sortOrder }).eq("id", id)
    )
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch full product with addons and variations.
 */
export async function fetchProduct(productId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_addons (id, name, name_bs, price, sort_order),
      product_variations (
        id, name, name_bs, required, sort_order,
        variation_options (id, label, label_bs, price_adjustment, sort_order)
      )
    `)
    .eq("id", productId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add a new product with its addons and variations.
 * Replaces: cmsStore.addProduct()
 */
export async function addProduct(
  restaurantId: string,
  product: ProductItem
) {
  const supabase = getSupabase();

  // 1. Insert product
  const { data: newProduct, error: prodError } = await supabase
    .from("products")
    .insert({
      restaurant_id: restaurantId,
      category_slug: product.category,
      name: product.name,
      name_bs: (product as any).name_bs || null,
      description: product.description,
      description_bs: (product as any).description_bs || null,
      price: product.price,
      image: product.image,
      popular: product.popular || false,
      sort_order: product.sortOrder || 0,
    })
    .select()
    .single();

  if (prodError) throw prodError;

  // 2. Insert addons
  if (product.addons?.length) {
    await supabase.from("product_addons").insert(
      product.addons.map((a, i) => ({
        product_id: newProduct.id,
        name: a.name,
        name_bs: (a as any).name_bs || null,
        price: a.price,
        sort_order: i,
      }))
    );
  }

  // 3. Insert variations + options
  if (product.variations?.length) {
    for (let vi = 0; vi < product.variations.length; vi++) {
      const v = product.variations[vi];
      const { data: newVar, error: varError } = await supabase
        .from("product_variations")
        .insert({
          product_id: newProduct.id,
          name: v.name,
          name_bs: (v as any).name_bs || null,
          required: v.required,
          sort_order: vi,
        })
        .select()
        .single();

      if (varError) throw varError;

      if (v.options?.length) {
        await supabase.from("variation_options").insert(
          v.options.map((o, oi) => ({
            variation_id: newVar.id,
            label: o.label,
            label_bs: (o as any).label_bs || null,
            price_adjustment: o.priceAdjustment,
            sort_order: oi,
          }))
        );
      }
    }
  }

  return newProduct;
}

/**
 * Update a product (basic fields only — addons/variations updated separately).
 * Replaces: cmsStore.updateProduct()
 */
export async function updateProduct(
  productId: string,
  data: Partial<Tables["products"]["Update"]>
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", productId);
  if (error) throw error;
}

/**
 * Delete a product (CASCADE removes addons, variations, options).
 * Replaces: cmsStore.removeProduct()
 */
export async function deleteProduct(productId: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
}


// ═══════════════════════════════════════════════════════════════════════════════
// JSONB CONFIG OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Update page content (JSONB merge).
 * Replaces: cmsStore.updatePageContent()
 */
export async function updatePageContent(
  restaurantId: string,
  content: Partial<PageContent>
) {
  const supabase = getSupabase();

  // Fetch current content, merge, and update
  const { data: existing } = await supabase
    .from("page_content")
    .select("content")
    .eq("restaurant_id", restaurantId)
    .single();

  const merged = { ...(existing?.content as object || {}), ...content };

  const { error } = await supabase
    .from("page_content")
    .upsert({
      restaurant_id: restaurantId,
      content: merged,
    });
  if (error) throw error;
}

/**
 * Update component styles (JSONB merge).
 * Replaces: cmsStore.updateComponentStyles()
 */
export async function updateComponentStyles(
  restaurantId: string,
  styles: Partial<ComponentStyles>
) {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("component_styles")
    .select("styles")
    .eq("restaurant_id", restaurantId)
    .single();

  const merged = { ...(existing?.styles as object || {}), ...styles };

  const { error } = await supabase
    .from("component_styles")
    .upsert({
      restaurant_id: restaurantId,
      styles: merged,
    });
  if (error) throw error;
}

/**
 * Update layout config (JSONB merge).
 * Replaces: cmsStore.updateLayoutConfig()
 */
export async function updateLayoutConfig(
  restaurantId: string,
  config: Partial<LayoutConfig>
) {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("layout_config")
    .select("config")
    .eq("restaurant_id", restaurantId)
    .single();

  const merged = { ...(existing?.config as object || {}), ...config };

  const { error } = await supabase
    .from("layout_config")
    .upsert({
      restaurant_id: restaurantId,
      config: merged,
    });
  if (error) throw error;
}

/**
 * Save per-theme customizations.
 * Replaces: cmsStore.applyTheme() save logic.
 */
export async function saveThemeCustomization(
  restaurantId: string,
  themeId: string,
  customizations: {
    componentStyles?: Partial<ComponentStyles>;
    layoutConfig?: Partial<LayoutConfig>;
    pageContent?: Partial<PageContent>;
  }
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("theme_customizations")
    .upsert({
      restaurant_id: restaurantId,
      theme_id: themeId,
      customizations: customizations as any,
    });
  if (error) throw error;
}

/**
 * Fetch all theme customizations for a restaurant.
 */
export async function fetchThemeCustomizations(restaurantId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("theme_customizations")
    .select("theme_id, customizations")
    .eq("restaurant_id", restaurantId);

  if (error) throw error;

  // Convert array to Record<themeId, customization>
  const result: Record<string, any> = {};
  for (const row of data || []) {
    result[row.theme_id] = row.customizations;
  }
  return result;
}


// ═══════════════════════════════════════════════════════════════════════════════
// ORDER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Place a new order.
 * Replaces: orderStore.addOrder()
 */
export async function placeOrder(
  restaurantId: string,
  order: {
    tableNumber: string;
    kitchenNote: string;
    items: { productId: string; name: string; price: number; quantity: number; image: string; selectedVariations?: any[] }[];
  }
) {
  const supabase = getSupabase();

  const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;

  // 1. Create order
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({
      restaurant_id: restaurantId,
      order_number: orderNumber,
      table_number: order.tableNumber,
      kitchen_note: order.kitchenNote,
      total,
      item_count: itemCount,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Create order items
  const { error: itemsError } = await supabase.from("order_items").insert(
    order.items.map((i) => ({
      order_id: newOrder.id,
      product_id: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: i.image,
      selected_variations: i.selectedVariations || [],
    }))
  );
  if (itemsError) throw itemsError;

  return newOrder;
}

/**
 * Update order status.
 * Replaces: orderStore.updateStatus()
 */
export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status: status as any })
    .eq("id", orderId);
  if (error) throw error;
}

/**
 * Fetch orders for a restaurant.
 */
export async function fetchOrders(restaurantId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}


// ═══════════════════════════════════════════════════════════════════════════════
// AUTH / USER OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get current user's profile.
 */
export async function fetchCurrentProfile() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's restaurant memberships.
 */
export async function fetchUserMemberships(userId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("restaurant_members")
    .select(`
      restaurant_id,
      role,
      restaurants (id, slug, name, venue_type, image)
    `)
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

/**
 * Get all members of a restaurant.
 */
export async function fetchRestaurantMembers(restaurantId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("restaurant_members")
    .select(`
      *,
      profiles (id, name, email, avatar_url, platform_role)
    `)
    .eq("restaurant_id", restaurantId);

  if (error) throw error;
  return data;
}

/**
 * Add a member to a restaurant.
 * Replaces: authStore.assignRestaurantRole()
 */
export async function addRestaurantMember(
  restaurantId: string,
  userId: string,
  role: "manager" | "employee"
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurant_members")
    .upsert({
      restaurant_id: restaurantId,
      user_id: userId,
      role,
    });
  if (error) throw error;
}

/**
 * Remove a member from a restaurant.
 * Replaces: authStore.removeRestaurantAccess()
 */
export async function removeRestaurantMember(
  restaurantId: string,
  userId: string
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("restaurant_members")
    .delete()
    .eq("restaurant_id", restaurantId)
    .eq("user_id", userId);
  if (error) throw error;
}


// ═══════════════════════════════════════════════════════════════════════════════
// USER PREFERENCES
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchUserPreferences(userId: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export async function updateUserPreferences(
  userId: string,
  prefs: { dark_mode?: boolean; language?: string }
) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: userId,
      ...prefs,
    });
  if (error) throw error;
}


// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Upload an image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(
  restaurantSlug: string,
  file: File,
  folder: "hero" | "logo" | "products" | "categories" = "products"
) {
  const supabase = getSupabase();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${restaurantSlug}/${folder}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("restaurant-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("restaurant-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
