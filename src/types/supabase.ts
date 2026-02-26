// ─── Auto-generated Supabase Database Types ─────────────
// In production, regenerate this file with:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/supabase.ts
//
// This hand-written version matches our migration SQL and
// provides type safety until the CLI-generated version is ready.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          name: string;
          email: string;
          avatar: string | null;
          platform_role: 'admin' | 'user';
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          name: string;
          email: string;
          avatar?: string | null;
          platform_role?: 'admin' | 'user';
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          name?: string;
          email?: string;
          avatar?: string | null;
          platform_role?: 'admin' | 'user';
          created_at?: string;
        };
      };

      restaurants: {
        Row: {
          id: string;
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
          venue_type: 'restaurant' | 'cafe' | 'bar' | 'bakery' | 'food-truck' | 'pizzeria' | 'pub' | 'lounge';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
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
          venue_type?: 'restaurant' | 'cafe' | 'bar' | 'bakery' | 'food-truck' | 'pizzeria' | 'pub' | 'lounge';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
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
          venue_type?: 'restaurant' | 'cafe' | 'bar' | 'bakery' | 'food-truck' | 'pizzeria' | 'pub' | 'lounge';
        };
      };

      restaurant_access: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          role: 'manager' | 'employee';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          role?: 'manager' | 'employee';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          restaurant_id?: string;
          role?: 'manager' | 'employee';
        };
      };

      categories: {
        Row: {
          id: string;
          restaurant_id: string;
          label: string;
          label_bs: string | null;
          icon: string;
          color: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          restaurant_id: string;
          label: string;
          label_bs?: string | null;
          icon?: string;
          color?: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          label?: string;
          label_bs?: string | null;
          icon?: string;
          color?: string;
          sort_order?: number;
        };
      };

      products: {
        Row: {
          id: string;
          restaurant_id: string;
          category: string;
          name: string;
          name_bs: string | null;
          description: string;
          description_bs: string | null;
          price: number;
          image: string;
          popular: boolean;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          id: string;
          restaurant_id: string;
          category: string;
          name: string;
          name_bs?: string | null;
          description?: string;
          description_bs?: string | null;
          price?: number;
          image?: string;
          popular?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          category?: string;
          name?: string;
          name_bs?: string | null;
          description?: string;
          description_bs?: string | null;
          price?: number;
          image?: string;
          popular?: boolean;
          sort_order?: number;
        };
      };

      addons: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          name_bs: string | null;
          price: number;
        };
        Insert: {
          id: string;
          product_id: string;
          name: string;
          name_bs?: string | null;
          price?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          name_bs?: string | null;
          price?: number;
        };
      };

      variations: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          name_bs: string | null;
          required: boolean;
        };
        Insert: {
          id: string;
          product_id: string;
          name: string;
          name_bs?: string | null;
          required?: boolean;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          name_bs?: string | null;
          required?: boolean;
        };
      };

      variation_options: {
        Row: {
          id: string;
          variation_id: string;
          label: string;
          label_bs: string | null;
          price_adjustment: number;
        };
        Insert: {
          id: string;
          variation_id: string;
          label: string;
          label_bs?: string | null;
          price_adjustment?: number;
        };
        Update: {
          id?: string;
          variation_id?: string;
          label?: string;
          label_bs?: string | null;
          price_adjustment?: number;
        };
      };

      page_content: {
        Row: {
          restaurant_id: string;
          content: Json;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          content?: Json;
        };
        Update: {
          restaurant_id?: string;
          content?: Json;
          updated_at?: string;
        };
      };

      component_styles: {
        Row: {
          restaurant_id: string;
          styles: Json;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          styles?: Json;
        };
        Update: {
          restaurant_id?: string;
          styles?: Json;
          updated_at?: string;
        };
      };

      layout_config: {
        Row: {
          restaurant_id: string;
          config: Json;
          updated_at: string;
        };
        Insert: {
          restaurant_id: string;
          config?: Json;
        };
        Update: {
          restaurant_id?: string;
          config?: Json;
          updated_at?: string;
        };
      };

      theme_customizations: {
        Row: {
          id: string;
          restaurant_id: string;
          theme_id: string;
          component_styles: Json;
          layout_config: Json;
          page_content: Json;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          theme_id: string;
          component_styles?: Json;
          layout_config?: Json;
          page_content?: Json;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          theme_id?: string;
          component_styles?: Json;
          layout_config?: Json;
          page_content?: Json;
        };
      };

      orders: {
        Row: {
          id: string;
          restaurant_id: string;
          items: Json;
          table_number: string;
          kitchen_note: string;
          total: number;
          item_count: number;
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          restaurant_id: string;
          items?: Json;
          table_number?: string;
          kitchen_note?: string;
          total?: number;
          item_count?: number;
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          items?: Json;
          table_number?: string;
          kitchen_note?: string;
          total?: number;
          item_count?: number;
          status?: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
        };
      };
    };

    Functions: {
      current_app_user_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_platform_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_restaurant_role: {
        Args: { p_restaurant_id: string; p_role?: string | null };
        Returns: boolean;
      };
    };
  };
}

// ─── Convenience type aliases ────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
