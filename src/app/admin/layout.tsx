"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Store,
  Tags,
  UtensilsCrossed,
  ArrowLeft,
  RotateCcw,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Database,
  FileText,
  Moon,
  Sun,
  ClipboardList,
  Users,
  Building2,
  LogOut,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCmsStore } from "@/store/cmsStore";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { RestaurantRole } from "@/types/auth";
import clsx from "clsx";

// ─── Nav item definitions ──────────────────────────────────
interface NavItem {
  /** For "Venues" this is "/admin", for sub-pages this is the path suffix e.g. "restaurant" */
  path: string;
  label: string;
  icon: typeof Store;
  desc: string;
  minRole?: RestaurantRole | null;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { path: "/admin", label: "Venues", icon: Building2, desc: "All restaurants, cafés & bars" },
  { path: "restaurant", label: "Restaurant", icon: Store, desc: "Name, images, info", minRole: "manager" },
  { path: "products", label: "Products", icon: UtensilsCrossed, desc: "Menu items & categories", minRole: "manager" },
  { path: "page-content", label: "Page Content", icon: FileText, desc: "All frontend text", minRole: "manager" },
  { path: "orders", label: "Orders", icon: ClipboardList, desc: "Customer orders" },
];

const platformNavItems: NavItem[] = [
  { path: "users", label: "Users & Roles", icon: Users, desc: "Manage access", adminOnly: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const restaurant = useCmsStore((s) => s.restaurant);
  const allRestaurants = useCmsStore((s) => s.allRestaurants);
  const resetToDefaults = useCmsStore((s) => s.resetToDefaults);
  const switchRestaurant = useCmsStore((s) => s.switchRestaurant);
  const darkMode = useAdminStore((s) => s.darkMode);
  const toggleDarkMode = useAdminStore((s) => s.toggleDarkMode);

  const currentUser = useAuthStore((s) => s.getCurrentUser());
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const activeRestaurantId = useAuthStore((s) => s.activeRestaurantId);
  const setActiveRestaurant = useAuthStore((s) => s.setActiveRestaurant);
  const logout = useAuthStore((s) => s.logout);
  const getUserRestaurantRole = useAuthStore((s) => s.getUserRestaurantRole);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  // Determine page type from URL segments
  const urlSegments = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);
  // /admin → venue grid, /admin/[venue] → role picker (both use "venue page" layout)
  const isOnVenuePage = pathname === "/admin" || (urlSegments.length === 2 && urlSegments[0] === "admin");

  // Extract venue slug from URL: /admin/[venue]/... → second segment
  const venueSlug = useMemo(() => {
    if (urlSegments.length >= 2 && urlSegments[0] === "admin" && urlSegments[1] !== undefined) {
      return pathname === "/admin" ? null : urlSegments[1];
    }
    return null;
  }, [pathname, urlSegments]);

  // Build a full href from a nav item's path suffix and the current venue slug
  const getHref = (item: NavItem) => {
    if (item.path === "/admin") return "/admin";
    return venueSlug ? `/admin/${venueSlug}/${item.path}` : `/admin/${activeRestaurantId || "_"}/${item.path}`;
  };

  // Check if a nav item is active based on the current pathname
  const isItemActive = (item: NavItem) => {
    if (item.path === "/admin") return pathname === "/admin";
    return pathname.includes(`/${item.path}`);
  };

  // ─── Gate: redirect sub-routes to /admin if no venue+user selected ──
  // Also redirect /admin → active venue when already logged in
  useEffect(() => {
    if (!isOnVenuePage && (!activeRestaurantId || !currentUserId)) {
      router.replace("/admin");
    }
    if (pathname === "/admin" && activeRestaurantId && currentUserId) {
      router.replace(`/admin/${activeRestaurantId}/restaurant`);
    }
  }, [pathname, isOnVenuePage, activeRestaurantId, currentUserId, router]);

  const handleReset = () => {
    resetToDefaults();
    setShowResetConfirm(false);
  };

  const currentRestaurantRole = useMemo(() => {
    if (!currentUser || !activeRestaurantId) return null;
    return getUserRestaurantRole(currentUser.id, activeRestaurantId);
  }, [currentUser, activeRestaurantId, getUserRestaurantRole]);

  const visibleNavItems = useMemo(() => {
    if (!currentUser) return navItems.filter((item) => !item.minRole);
    const isAdmin = currentUser.platformRole === "admin";
    return navItems.filter((item) => {
      if (!item.minRole) return true;
      if (isAdmin) return true;
      if (!currentRestaurantRole) return false;
      if (currentRestaurantRole === "manager") return true;
      if (currentRestaurantRole === "employee") return !item.minRole || item.minRole === "employee";
      return false;
    });
  }, [currentUser, currentRestaurantRole]);

  const visiblePlatformNav = useMemo(() => {
    if (!currentUser) return [];
    return platformNavItems.filter((item) => {
      if (item.adminOnly) return currentUser.platformRole === "admin";
      return true;
    });
  }, [currentUser]);

  const allNavItems = [...navItems, ...platformNavItems];
  const currentPage = allNavItems.find((item) => isItemActive(item));

  const accessibleRestaurants = useMemo(() => {
    if (!currentUser) return [];
    const ids = Object.keys(allRestaurants);
    if (currentUser.platformRole === "admin") return ids;
    return ids.filter((id) =>
      currentUser.restaurantAccess.some((a) => a.restaurantId === id)
    );
  }, [currentUser, allRestaurants]);

  const handleSwitchRestaurant = (toId: string) => {
    if (!activeRestaurantId || toId === activeRestaurantId) return;
    switchRestaurant(activeRestaurantId, toId);
    setActiveRestaurant(toId);
    setShowRestaurantPicker(false);
    // Update URL to reflect the new venue slug
    if (venueSlug) {
      const restOfPath = pathname.replace(`/admin/${venueSlug}`, "");
      router.push(`/admin/${toId}${restOfPath}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  // ─── Hydration guard: prevent SSR/client mismatch ──
  if (!hydrated) {
    return <div className="fixed inset-0 z-[60] bg-bg" />;
  }

  // ─── Venue selector page: full sidebar chrome, consistent with sub-routes ──────────
  if (isOnVenuePage) {
    return (
      <div className={clsx("fixed inset-0 z-[60] flex bg-bg", darkMode && "admin-dark")} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* ── Sidebar ── */}
        <aside className={clsx("fixed lg:static inset-y-0 left-0 z-50 w-[272px] bg-white flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 shadow-card border-r border-gray-100/80", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
          {/* Logo */}
          <div className="h-[72px] flex items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-glow">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <div>
                <span className="font-extrabold text-dark text-[15px] tracking-tight">Saraya CMS</span>
                <span className="block text-[10px] text-muted font-medium -mt-0.5">Venue Manager</span>
              </div>
            </div>
            <button className="lg:hidden p-1.5 rounded-xl hover:bg-bg text-muted transition" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="px-5 mb-1"><div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" /></div>

          {/* Navigation — Venues active, others greyed out */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold text-muted/50 uppercase tracking-[0.15em] mb-2">Navigation</p>
            {navItems.map((item) => {
              const isActive = item.path === "/admin";
              const isDisabled = item.path !== "/admin";
              return isDisabled ? (
                <div key={item.path} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium opacity-30 cursor-not-allowed">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-bg text-muted"><item.icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight text-muted">{item.label}</span>
                    <span className="block text-[10px] mt-0.5 text-muted/50">{item.desc}</span>
                  </div>
                </div>
              ) : (
                <Link key={item.path} href="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium bg-primary/10 text-dark shadow-sm relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-amber-500 text-white shadow-sm"><item.icon size={16} /></div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold leading-tight">{item.label}</span>
                    <span className="block text-[10px] mt-0.5 text-primary/60">{item.desc}</span>
                  </div>
                  <ChevronRight size={14} className="text-primary/40" />
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="px-4 mt-auto"><div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" /></div>
          <div className="p-3 space-y-1">
            {currentUser && (
              <div className="mx-1 mb-2 p-3 rounded-2xl bg-bg border border-primary/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-base shrink-0">{currentUser.avatar || "👤"}</div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-bold text-dark truncate">{currentUser.name}</span>
                    <span className="block text-[9px] text-muted">{currentUser.platformRole === "admin" ? "Platform Admin" : "User"}</span>
                  </div>
                  <button onClick={handleLogout} className="text-muted hover:text-accent-red transition" title="Sign Out"><LogOut size={13} /></button>
                </div>
              </div>
            )}
            <div className="mx-1 mb-2 p-3 rounded-2xl bg-bg border border-primary/10">
              <div className="flex items-center gap-2 mb-1"><Database size={11} className="text-primary" /><span className="text-[9px] font-bold text-dark uppercase tracking-wider">Local Storage</span></div>
              <p className="text-[9px] text-muted leading-relaxed">Data saved in browser. No cloud sync.</p>
            </div>
            <Link href={`/${activeRestaurantId}`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-muted hover:text-dark hover:bg-bg transition"><ArrowLeft size={15} />Back to Menu</Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-bg">
          <header className="h-[64px] bg-white/95 backdrop-blur-md border-b border-gray-100/80 flex items-center px-4 lg:px-8 gap-4 shrink-0 sticky top-0 z-10 shadow-soft">
            <button className="lg:hidden p-2 -ml-1 hover:bg-bg rounded-xl transition" onClick={() => setSidebarOpen(true)}><Menu size={20} className="text-dark" /></button>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 size={15} className="text-primary" /></div>
              <div className="min-w-0"><h1 className="text-[15px] font-extrabold text-dark truncate">Venues</h1></div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleDarkMode} className={clsx("w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200", darkMode ? "bg-primary/15 text-primary" : "bg-bg text-muted hover:text-dark hover:bg-gray-100")} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div key="sun" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.2 }}><Sun size={16} /></motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.2 }}><Moon size={16} /></motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              <Link href={`/${activeRestaurantId}`} target="_blank" className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-primary to-amber-500 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-glow hover:brightness-105 transition">View Menu</Link>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="p-5 lg:p-8">
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  // ─── Gate: if not on venue page and missing context, show nothing (redirect happens via useEffect) ──
  if (!activeRestaurantId || !allRestaurants[activeRestaurantId] || !currentUserId || !currentUser) {
    return null;
  }

  // ─── Full admin panel with sidebar ────────────────────────
  return (
    <div className={clsx("fixed inset-0 z-[60] flex bg-bg", darkMode && "admin-dark")} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={clsx("fixed lg:static inset-y-0 left-0 z-50 w-[272px] bg-white flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 shadow-card border-r border-gray-100/80", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        {/* Logo */}
        <div className="h-[72px] flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center shadow-glow">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <div>
              <span className="font-extrabold text-dark text-[15px] tracking-tight">Saraya CMS</span>
              <span className="block text-[10px] text-muted font-medium -mt-0.5">Restaurant Manager</span>
            </div>
          </div>
          <button className="lg:hidden p-1.5 rounded-xl hover:bg-bg text-muted transition" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="px-5 mb-1"><div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" /></div>

        {/* Restaurant selector */}
        <div className="px-3 mb-2 relative">
          <button
            onClick={() => setShowRestaurantPicker(!showRestaurantPicker)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-bg border border-primary/10 hover:border-primary/20 transition text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center overflow-hidden shrink-0">
              {allRestaurants[activeRestaurantId]?.restaurant.image ? (
                <img src={allRestaurants[activeRestaurantId].restaurant.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store size={14} className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[12px] font-bold text-dark truncate">{restaurant.name}</span>
              <span className="block text-[9px] text-muted">{currentRestaurantRole === "manager" ? "Manager" : "Employee"}</span>
            </div>
            <ChevronDown size={14} className={clsx("text-muted transition-transform", showRestaurantPicker && "rotate-180")} />
          </button>
          <AnimatePresence>
            {showRestaurantPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-3 right-3 mt-1 bg-white rounded-xl shadow-elevated border border-gray-100/80 z-30 overflow-hidden"
              >
                {accessibleRestaurants.map((rId) => {
                  const rData = allRestaurants[rId];
                  if (!rData) return null;
                  const isSelected = rId === activeRestaurantId;
                  return (
                    <button key={rId} onClick={() => handleSwitchRestaurant(rId)} className={clsx("w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-bg", isSelected && "bg-primary/5")}>
                      <div className="w-7 h-7 rounded-lg bg-bg overflow-hidden shrink-0">
                        {rData.restaurant.image ? <img src={rData.restaurant.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Store size={12} className="text-muted" /></div>}
                      </div>
                      <span className={clsx("text-[12px] font-semibold truncate", isSelected ? "text-primary" : "text-dark")}>{rData.restaurant.name}</span>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-primary ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-muted/50 uppercase tracking-[0.15em] mb-2">Restaurant</p>
          {visibleNavItems.filter((item) => item.path !== "/admin").map((item) => {
            const href = getHref(item);
            const isActive = isItemActive(item);
            return (
              <Link key={item.path} href={href} onClick={() => setSidebarOpen(false)} className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative", isActive ? "bg-primary/10 text-dark shadow-sm" : "text-muted hover:text-dark hover:bg-bg")}>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />}
                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center transition-all", isActive ? "bg-gradient-to-br from-primary to-amber-500 text-white shadow-sm" : "bg-bg text-muted group-hover:text-dark")}><item.icon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[13px] font-semibold leading-tight">{item.label}</span>
                  <span className={clsx("block text-[10px] mt-0.5", isActive ? "text-primary/60" : "text-muted/50")}>{item.desc}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-primary/40" />}
              </Link>
            );
          })}
          {visiblePlatformNav.length > 0 && (
            <>
              <div className="pt-3"><p className="px-3 text-[10px] font-bold text-muted/50 uppercase tracking-[0.15em] mb-2">Platform</p></div>
              {visiblePlatformNav.map((item) => {
                const href = getHref(item);
                const isActive = isItemActive(item);
                return (
                  <Link key={item.path} href={href} onClick={() => setSidebarOpen(false)} className={clsx("flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative", isActive ? "bg-primary/10 text-dark shadow-sm" : "text-muted hover:text-dark hover:bg-bg")}>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />}
                    <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center transition-all", isActive ? "bg-gradient-to-br from-primary to-amber-500 text-white shadow-sm" : "bg-bg text-muted group-hover:text-dark")}><item.icon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[13px] font-semibold leading-tight">{item.label}</span>
                      <span className={clsx("block text-[10px] mt-0.5", isActive ? "text-primary/60" : "text-muted/50")}>{item.desc}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-primary/40" />}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 mt-auto"><div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" /></div>
        <div className="p-3 space-y-1">
          <div className="mx-1 mb-2 p-3 rounded-2xl bg-bg border border-primary/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-base shrink-0">{currentUser.avatar || "👤"}</div>
              <div className="flex-1 min-w-0">
                <span className="block text-[11px] font-bold text-dark truncate">{currentUser.name}</span>
                <span className="block text-[9px] text-muted">{currentRestaurantRole === "manager" ? "Manager" : "Employee"}</span>
              </div>
            </div>
          </div>
          <div className="mx-1 mb-2 p-3 rounded-2xl bg-bg border border-primary/10">
            <div className="flex items-center gap-2 mb-1"><Database size={11} className="text-primary" /><span className="text-[9px] font-bold text-dark uppercase tracking-wider">Local Storage</span></div>
            <p className="text-[9px] text-muted leading-relaxed">Data saved in browser. No cloud sync.</p>
          </div>
          <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-accent-red/70 hover:text-accent-red hover:bg-red-50 transition w-full"><RotateCcw size={15} />Reset to Defaults</button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-muted hover:text-dark hover:bg-bg transition w-full"><LogOut size={15} />Sign Out</button>
          <Link href={`/${activeRestaurantId}`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-muted hover:text-dark hover:bg-bg transition"><ArrowLeft size={15} />Back to Menu</Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg">
        <header className="h-[64px] bg-white/95 backdrop-blur-md border-b border-gray-100/80 flex items-center px-4 lg:px-8 gap-4 shrink-0 sticky top-0 z-10 shadow-soft">
          <button className="lg:hidden p-2 -ml-1 hover:bg-bg rounded-xl transition" onClick={() => setSidebarOpen(true)}><Menu size={20} className="text-dark" /></button>
          <div className="flex items-center gap-3 min-w-0">
            {currentPage && (
              <>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><currentPage.icon size={15} className="text-primary" /></div>
                <div className="min-w-0"><h1 className="text-[15px] font-extrabold text-dark truncate">{currentPage.label}</h1></div>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleDarkMode} className={clsx("w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200", darkMode ? "bg-primary/15 text-primary" : "bg-bg text-muted hover:text-dark hover:bg-gray-100")} title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div key="sun" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.2 }}><Sun size={16} /></motion.div>
                ) : (
                  <motion.div key="moon" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.2 }}><Moon size={16} /></motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            <div className="hidden sm:flex items-center gap-1.5 glass rounded-full px-3 py-1.5 shadow-sm border border-primary/10">
              {currentUser.platformRole === "admin" ? <ShieldCheck size={11} className="text-primary" /> : <Shield size={11} className="text-accent-blue" />}
              <span className="text-[11px] font-semibold text-dark">{currentRestaurantRole === "manager" ? "Manager" : currentRestaurantRole === "employee" ? "Employee" : "Viewer"}</span>
            </div>
            <Link href={`/${activeRestaurantId}`} target="_blank" className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-primary to-amber-500 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-glow hover:brightness-105 transition">View Menu</Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className={clsx(pathname.includes("/page-content") || pathname.includes("/products") ? "max-w-none" : "p-5 lg:p-8")}>
            {children}
          </motion.div>
        </main>
      </div>

      {/* ── Reset modal ── */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: "spring", damping: 25 }} className="bg-white rounded-3xl p-6 max-w-[380px] w-full shadow-elevated">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><RotateCcw size={22} className="text-accent-red" /></div>
              <h3 className="text-lg font-extrabold text-dark text-center">Reset All Data?</h3>
              <p className="text-sm text-muted mt-2 text-center leading-relaxed">This will restore all restaurant info, categories, and products to their original defaults. This cannot be undone.</p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-dark hover:bg-bg transition">Cancel</button>
                <button onClick={handleReset} className="flex-1 py-3 rounded-2xl bg-accent-red text-white text-sm font-bold hover:brightness-110 transition shadow-lg shadow-red-200">Reset Everything</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
