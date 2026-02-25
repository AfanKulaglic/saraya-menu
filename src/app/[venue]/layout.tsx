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

  useEffect(() => {
    if (!venue) return;
    const slug = decodeURIComponent(venue);
    // Check if this venue exists
    if (!allRestaurants[slug]) {
      router.replace("/");
      return;
    }
    loadVenuePublic(slug);
    setReady(true);
  }, [venue, allRestaurants, loadVenuePublic, router]);

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
