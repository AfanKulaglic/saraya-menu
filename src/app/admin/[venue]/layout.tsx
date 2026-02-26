"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCmsStore } from "@/store/cmsStore";
import { useAuthStore } from "@/store/authStore";

/**
 * [venue] layout — syncs the URL venue slug to the active restaurant in the store.
 * If the slug doesn't match any known restaurant, redirects back to /admin.
 */
export default function VenueLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const venueSlug = typeof params.venue === "string" ? params.venue : "";
  const [hydrated, setHydrated] = useState(false);

  const allRestaurants = useCmsStore((s) => s.allRestaurants);
  const switchRestaurant = useCmsStore((s) => s.switchRestaurant);
  const loadVenuePublic = useCmsStore((s) => s.loadVenuePublic);
  const activeRestaurantId = useAuthStore((s) => s.activeRestaurantId);
  const setActiveRestaurant = useAuthStore((s) => s.setActiveRestaurant);
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";

  // Check if we're on the venue's role picker page (no sub-route)
  // e.g. /admin/my-venue (exactly 2 segments after splitting)
  const isRolePickerPage = (() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.length === 2; // ['admin', 'venue-slug']
  })();

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    // Wait for store hydration before checking values
    if (!hydrated) return;

    // Check if the venue slug matches a known restaurant
    const matchedId = Object.keys(allRestaurants).find((id) => id === venueSlug);

    if (!matchedId) {
      // Unknown venue slug → go back to venue picker
      router.replace("/admin");
      return;
    }

    // If on role picker page, no auth needed — user hasn't logged in yet
    if (isRolePickerPage) return;

    // For sub-pages, require a logged-in user
    if (!currentUserId) {
      router.replace("/admin");
      return;
    }

    // If the URL venue differs from the active restaurant, switch to it
    if (matchedId !== activeRestaurantId) {
      if (activeRestaurantId) {
        switchRestaurant(activeRestaurantId, matchedId);
      } else {
        // No previous active restaurant — just load the venue data into flat fields
        loadVenuePublic(matchedId);
      }
      setActiveRestaurant(matchedId);
    }
  }, [hydrated, venueSlug, allRestaurants, activeRestaurantId, currentUserId, router, switchRestaurant, loadVenuePublic, setActiveRestaurant, isRolePickerPage]);

  // While resolving, don't render nothing — just pass through
  // The parent layout's gate handles the loading state
  if (!hydrated) return null;
  return <>{children}</>;
}
