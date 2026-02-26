import { Product } from "@/types/product";

// ─── Restaurant Info (generic fallback for SSR) ──────────
export const restaurant = {
  name: "",
  tagline: "",
  image: "",
  logo: "",
  address: "",
  openHours: "",
  wifi: "",
  phone: "",
};

// ─── Category Config (icon + label + color) ──────────────
export interface CategoryInfo {
  id: string;
  label: string;
  icon: string;
  color: string;  // tailwind bg class
}

export const categoryConfig: CategoryInfo[] = [];

// Flat string list kept for backward compat
export const menuCategories: string[] = [];

// Map category name → icon for section headers
export const categoryIcons: Record<string, string> = {};

// ─── Menu Products (empty — venues create their own) ─────
export const products: Product[] = [];
