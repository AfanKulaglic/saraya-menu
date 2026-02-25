"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppUser, PlatformRole, RestaurantRole, RestaurantAccess } from "@/types/auth";

// ─── Seed Users ──────────────────────────────────────────

const SEED_USERS: AppUser[] = [
  {
    id: "admin-saraya",
    name: "Saraya Admin",
    email: "admin@saraya.dev",
    avatar: "👑",
    platformRole: "admin",
    restaurantAccess: [
      { restaurantId: "bella-cucina", role: "manager" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "manager-01",
    name: "Marco Rossi",
    email: "marco@bellacucina.com",
    avatar: "👨‍🍳",
    platformRole: "user",
    restaurantAccess: [
      { restaurantId: "bella-cucina", role: "manager" },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: "employee-01",
    name: "Sofia Bianchi",
    email: "sofia@bellacucina.com",
    avatar: "🧑‍💼",
    platformRole: "user",
    restaurantAccess: [
      { restaurantId: "bella-cucina", role: "employee" },
    ],
    createdAt: new Date().toISOString(),
  },
];

// ─── Store Types ─────────────────────────────────────────

interface AuthState {
  // ── Data ──
  users: AppUser[];
  currentUserId: string | null;
  activeRestaurantId: string | null;

  // ── Auth actions ──
  login: (userId: string) => void;
  logout: () => void;
  setActiveRestaurant: (restaurantId: string) => void;

  // ── User CRUD ──
  addUser: (user: Omit<AppUser, "id" | "createdAt">) => void;
  updateUser: (id: string, data: Partial<Omit<AppUser, "id" | "createdAt">>) => void;
  removeUser: (id: string) => void;

  // ── Role assignment ──
  assignRestaurantRole: (userId: string, restaurantId: string, role: RestaurantRole) => void;
  removeRestaurantAccess: (userId: string, restaurantId: string) => void;

  // ── Selectors ──
  getCurrentUser: () => AppUser | null;
  getUserRestaurantRole: (userId: string, restaurantId: string) => RestaurantRole | null;
  getAccessibleRestaurantIds: (userId: string) => string[];
  canAccessRestaurant: (userId: string, restaurantId: string) => boolean;
}

// ─── Helper ──────────────────────────────────────────────

function generateId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Store ───────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      currentUserId: null,
      activeRestaurantId: null,

      // ── Auth ────────────────────────────────
      login: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return;
        // Don't auto-select restaurant — venue is chosen first
        set({
          currentUserId: userId,
        });
      },

      logout: () =>
        set({ currentUserId: null, activeRestaurantId: null }),

      setActiveRestaurant: (restaurantId) =>
        set({ activeRestaurantId: restaurantId }),

      // ── User CRUD ──────────────────────────
      addUser: (userData) =>
        set((s) => ({
          users: [
            ...s.users,
            {
              ...userData,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateUser: (id, data) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id ? { ...u, ...data } : u
          ),
        })),

      removeUser: (id) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== id),
          // If removing current user, log out
          ...(s.currentUserId === id
            ? { currentUserId: null, activeRestaurantId: null }
            : {}),
        })),

      // ── Role assignment ─────────────────────
      assignRestaurantRole: (userId, restaurantId, role) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const existing = u.restaurantAccess.findIndex(
              (a) => a.restaurantId === restaurantId
            );
            const access = [...u.restaurantAccess];
            if (existing >= 0) {
              access[existing] = { restaurantId, role };
            } else {
              access.push({ restaurantId, role });
            }
            return { ...u, restaurantAccess: access };
          }),
        })),

      removeRestaurantAccess: (userId, restaurantId) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            return {
              ...u,
              restaurantAccess: u.restaurantAccess.filter(
                (a) => a.restaurantId !== restaurantId
              ),
            };
          }),
        })),

      // ── Selectors ──────────────────────────
      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId) ?? null;
      },

      getUserRestaurantRole: (userId, restaurantId) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return null;
        // Platform admins always have full access (treated as manager)
        if (user.platformRole === "admin") return "manager";
        const access = user.restaurantAccess.find(
          (a) => a.restaurantId === restaurantId
        );
        return access?.role ?? null;
      },

      getAccessibleRestaurantIds: (userId) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return [];
        // Platform admins can access ALL restaurants
        // (caller must provide the full restaurant list separately)
        if (user.platformRole === "admin") return ["__all__"];
        return user.restaurantAccess.map((a) => a.restaurantId);
      },

      canAccessRestaurant: (userId, restaurantId) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return false;
        if (user.platformRole === "admin") return true;
        return user.restaurantAccess.some(
          (a) => a.restaurantId === restaurantId
        );
      },
    }),
    { name: "bella-cucina-auth" }
  )
);
