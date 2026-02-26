"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCmsStore } from "@/store/cmsStore";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function VenueLayout({ children }: { children: React.ReactNode }) {
  const { venue } = useParams<{ venue: string }>();
  const router = useRouter();
  const loadVenuePublic = useCmsStore((s) => s.loadVenuePublic);
  const allRestaurants = useCmsStore((s) => s.allRestaurants);
  const [ready, setReady] = useState(false);
  const [storeHydrated, setStoreHydrated] = useState(false);

  // Wait for Zustand persist to finish hydrating from localStorage
  useEffect(() => {
    if (useCmsStore.persist.hasHydrated()) {
      setStoreHydrated(true);
    } else {
      const unsub = useCmsStore.persist.onFinishHydration(() =>
        setStoreHydrated(true)
      );
      return unsub;
    }
  }, []);

  useEffect(() => {
    if (!venue) return;

    // In preview mode (admin LivePreview iframe), data arrives via postMessage.
    // Skip the venue existence check to avoid a hydration race condition.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("preview") === "1") {
        setReady(true);
        return;
      }
    }

    // Don't check allRestaurants until the store has hydrated
    if (!storeHydrated) return;

    const slug = decodeURIComponent(venue);
    // Check if this venue exists
    if (!allRestaurants[slug]) {
      router.replace("/");
      return;
    }
    loadVenuePublic(slug);
    setReady(true);
  }, [venue, allRestaurants, loadVenuePublic, router, storeHydrated]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <LanguageSwitcher />
      {children}
    </>
  );
}
