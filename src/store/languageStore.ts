"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppLanguage } from "@/types/cms";

interface LanguageState {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (lang) => set({ language: lang }),
      toggleLanguage: () =>
        set({ language: get().language === "en" ? "bs" : "en" }),
    }),
    {
      name: "saraya-language",
    }
  )
);
