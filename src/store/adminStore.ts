"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    { name: "bella-cucina-admin" }
  )
);
