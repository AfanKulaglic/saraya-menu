"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirects to /admin — venue management is now on the main admin page.
 */
export default function RestaurantsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return null;
}
