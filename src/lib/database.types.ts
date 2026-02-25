// ─── Supabase Database Types ──────────────────────────────────────────────
// Auto-generated types for the Supabase schema.
// In production, run: npx supabase gen types typescript > src/lib/database.types.ts
// This is a manual version matching our 001_initial_schema.sql migration.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type VenueType =
  | "restaurant"
  | "cafe"
  | "bar"
  | "bakery"
  | "food-truck"
  | "pizzeria"
  | "pub"
  | "lounge";

export type PlatformRole = "admin" | "user";
export type RestaurantRole = "manager" | "employee";
export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string;
          slug: string;
          venue_type: VenueType;
          name: string;
          name_bs: string | null;
          tagline: string;
          tagline_bs: string | null;
          image: string;
          logo: string;
          address: string;
          address_bs: string | null;
          open_hours: string;
          open_hours_bs: string | null;
          wifi: string;
          phone: string;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          venue_type?: VenueType;
          name: string;
          name_bs?: string | null;
          tagline?: string;
          tagline_bs?: string | null;
          image?: string;
          logo?: string;
          address?: string;
          address_bs?: string | null;
          open_hours?: string;
          open_hours_bs?: string | null;
          wifi?: string;
          phone?: string;
          owner_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["restaurants"]["Insert"]>;
      };

      categories: {
        Row: {
          id: string;
          restaurant_id: string;
          slug: string;
          label: string;
          label_bs: string | null;
          icon: string;
          color: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          slug: string;
          label: string;
          label_bs?: string | null;
          icon?: string;
          color?: string;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };

      products: {
        Row: {
          id: string;
          restaurant_id: string;
          category_slug: string;
          name: string;
          name_bs: string | null;
          description: string;
          description_bs: string | null;
          price: number;
          image: string;
          popular: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          category_slug: string;
          name: string;
          name_bs?: string | null;
          description?: string;
          description_bs?: string | null;
          price?: number;
          image?: string;
          popular?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };

      product_addons: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          name_bs: string | null;
          price: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          name_bs?: string | null;
          price?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_addons"]["Insert"]>;
      };

      product_variations: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          name_bs: string | null;
          required: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          name_bs?: string | null;
          required?: boolean;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_variations"]["Insert"]>;
      };

      variation_options: {
        Row: {
          id: string;
          variation_id: string;
          label: string;
          label_bs: string | null;
          price_adjustment: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          variation_id: string;
          label: string;
          label_bs?: string | null;
          price_adjustment?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["variation_options"]["Insert"]>;
      };

      page_content: {
        Row: {
          id: string;
          restaurant_id: string;
          content: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          content?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["page_content"]["Insert"]>;
      };

      component_styles: {
        Row: {
          id: string;
          restaurant_id: string;
          styles: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          styles?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["component_styles"]["Insert"]>;
      };

      layout_config: {
        Row: {
          id: string;
          restaurant_id: string;
          config: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          config?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["layout_config"]["Insert"]>;
      };

      theme_customizations: {
        Row: {
          id: string;
          restaurant_id: string;
          theme_id: string;
          customizations: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          theme_id: string;
          customizations?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["theme_customizations"]["Insert"]>;
      };

      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          order_number: string;
          table_number: string;
          kitchen_note: string;
          total: number;
          item_count: number;
          status: OrderStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          order_number: string;
          table_number?: string;
          kitchen_note?: string;
          total?: number;
          item_count?: number;
          status?: OrderStatus;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          name: string;
          price: number;
          quantity: number;
          image: string;
          selected_variations: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          name: string;
          price: number;
          quantity?: number;
          image?: string;
          selected_variations?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
      };

      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          platform_role: PlatformRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          platform_role?: PlatformRole;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      restaurant_members: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          role: RestaurantRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          role?: RestaurantRole;
        };
        Update: Partial<Database["public"]["Tables"]["restaurant_members"]["Insert"]>;
      };

      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          dark_mode: boolean;
          language: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dark_mode?: boolean;
          language?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_preferences"]["Insert"]>;
      };
    };

    Views: {
      restaurant_full_data: {
        Row: Database["public"]["Tables"]["restaurants"]["Row"] & {
          page_content: Json | null;
          component_styles: Json | null;
          layout_config: Json | null;
          theme_customizations: Json | null;
          categories: Json | null;
          products: Json | null;
        };
      };
    };

    Functions: {
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_restaurant_member: {
        Args: { rest_id: string };
        Returns: boolean;
      };
      is_restaurant_manager: {
        Args: { rest_id: string };
        Returns: boolean;
      };
    };

    Enums: {
      venue_type: VenueType;
      platform_role: PlatformRole;
      restaurant_role: RestaurantRole;
      order_status: OrderStatus;
    };
  };
}
