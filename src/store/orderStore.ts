import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, OrderStatus } from "@/types/order";
import { CartItem } from "@/types/cart";

type OrderState = {
  orders: Order[];
  addOrder: (data: {
    items: CartItem[];
    tableNumber: string;
    kitchenNote: string;
    total: number;
    itemCount: number;
  }) => string; // returns order id
  updateStatus: (orderId: string, status: OrderStatus) => void;
  removeOrder: (orderId: string) => void;
  clearAllOrders: () => void;
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],

      addOrder: (data) => {
        const id = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const order: Order = {
          id,
          items: data.items,
          tableNumber: data.tableNumber,
          kitchenNote: data.kitchenNote,
          total: data.total,
          itemCount: data.itemCount,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return id;
      },

      updateStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        })),

      removeOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
        })),

      clearAllOrders: () => set({ orders: [] }),
    }),
    { name: "bella-cucina-orders" }
  )
);
