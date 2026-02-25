import { create } from "zustand";
import { CartItem } from "@/types/cart";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, qty: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const key = item.cartKey || item.id;
      const existing = state.items.find((i) => (i.cartKey || i.id) === key);
      if (existing) {
        return {
          items: state.items.map((i) =>
            (i.cartKey || i.id) === key
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...item, cartKey: key }] };
    }),

  removeItem: (cartKey) =>
    set((state) => ({
      items: state.items.filter((i) => (i.cartKey || i.id) !== cartKey),
    })),

  updateQuantity: (cartKey, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => (i.cartKey || i.id) !== cartKey)
          : state.items.map((i) =>
              (i.cartKey || i.id) === cartKey ? { ...i, quantity: qty } : i
            ),
    })),

  getTotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),

  clearCart: () => set({ items: [] }),
}));
