export interface SelectedVariation {
  variationName: string;
  optionLabel: string;
  priceAdjustment: number;
}

export interface CartItem {
  id: string;
  cartKey: string;         // unique key: productId + variation combo
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedVariations?: SelectedVariation[];
}
