export interface Addon {
  id: string;
  name: string;
  name_bs?: string;
  price: number;
}

export interface VariationOption {
  id: string;
  label: string;
  label_bs?: string;
  priceAdjustment: number;
}

export interface Variation {
  id: string;
  name: string;
  name_bs?: string;
  required: boolean;
  options: VariationOption[];
}

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  name_bs?: string;
  description: string;
  description_bs?: string;
  price: number;
  image: string;
  category: string;
  addons?: Addon[];
  variations?: Variation[];
  popular?: boolean;
  sortOrder?: number;
}
