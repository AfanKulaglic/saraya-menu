"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Store,
  UtensilsCrossed,
  ChevronRight,
  Coffee,
  Wine,
  UserCog,
  ShieldCheck,
  Shield,
  ArrowLeft,
  CakeSlice,
  Truck,
  Pizza,
  Beer,
  Martini,
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCmsStore, VenueType } from "@/store/cmsStore";
import { useAuthStore } from "@/store/authStore";
import { RestaurantRole, AppUser } from "@/types/auth";
import clsx from "clsx";

// ─── Venue type config ──────────────────────────────────
const VENUE_TYPES: { value: VenueType; label: string; icon: typeof Store; emoji: string; desc: string }[] = [
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed, emoji: "🍽️", desc: "Full-service dining" },
  { value: "cafe",       label: "Café",       icon: Coffee,          emoji: "☕",  desc: "Coffee & light bites" },
  { value: "bar",        label: "Bar",        icon: Wine,            emoji: "🍸",  desc: "Cocktails & spirits" },
  { value: "bakery",     label: "Bakery",     icon: CakeSlice,       emoji: "🧁",  desc: "Pastries & bread" },
  { value: "food-truck", label: "Food Truck", icon: Truck,           emoji: "🚚",  desc: "Street food on wheels" },
  { value: "pizzeria",   label: "Pizzeria",   icon: Pizza,           emoji: "🍕",  desc: "Pizza & Italian" },
  { value: "pub",        label: "Pub",        icon: Beer,            emoji: "🍺",  desc: "Drinks & pub grub" },
  { value: "lounge",     label: "Lounge",     icon: Martini,         emoji: "🍹",  desc: "Premium drinks & vibes" },
];

const VENUE_COLORS: Record<VenueType, { bg: string; text: string; border: string }> = {
  restaurant:  { bg: "bg-primary/10",     text: "text-primary",      border: "border-primary/20" },
  cafe:        { bg: "bg-amber-500/10",   text: "text-amber-600",    border: "border-amber-500/20" },
  bar:         { bg: "bg-purple-500/10",  text: "text-purple-600",   border: "border-purple-500/20" },
  bakery:      { bg: "bg-pink-500/10",    text: "text-pink-600",     border: "border-pink-500/20" },
  "food-truck":{ bg: "bg-orange-500/10",  text: "text-orange-600",   border: "border-orange-500/20" },
  pizzeria:    { bg: "bg-red-500/10",     text: "text-red-600",      border: "border-red-500/20" },
  pub:         { bg: "bg-yellow-500/10",  text: "text-yellow-700",   border: "border-yellow-500/20" },
  lounge:      { bg: "bg-indigo-500/10",  text: "text-indigo-600",   border: "border-indigo-500/20" },
};

const ROLE_CONFIG: Record<RestaurantRole, { label: string; desc: string; color: string; icon: typeof Shield }> = {
  manager:  { label: "Manager",  desc: "Changes prices, categories & products", color: "text-primary",      icon: ShieldCheck },
  employee: { label: "Employee", desc: "Receives & manages orders",              color: "text-accent-green", icon: Shield },
};

// Hardcoded passwords for the simulated login
const HARDCODED_PASSWORDS: Record<string, string> = {
  "admin@saraya.dev": "admin123",
  "marco@bellacucina.com": "marco123",
  "sofia@bellacucina.com": "sofia123",
};

export default function VenueRolePicker() {
  const params = useParams();
  const router = useRouter();
  const venueSlug = typeof params.venue === "string" ? params.venue : "";

  const allRestaurants = useCmsStore((s) => s.allRestaurants);
  const switchRestaurant = useCmsStore((s) => s.switchRestaurant);
  const loadVenuePublic = useCmsStore((s) => s.loadVenuePublic);
  const activeRestaurantId = useAuthStore((s) => s.activeRestaurantId);
  const setActiveRestaurant = useAuthStore((s) => s.setActiveRestaurant);
  const loginAction = useAuthStore((s) => s.login);
  const users = useAuthStore((s) => s.users);
  const getUserRestaurantRole = useAuthStore((s) => s.getUserRestaurantRole);

  const venueData = allRestaurants[venueSlug];

  // ─── Login form state ──────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Get users with access to this venue
  const venueUsers: AppUser[] = useMemo(() => {
    if (!venueData) return [];
    return users.filter((u) =>
      u.platformRole === "admin" ||
      u.restaurantAccess.some((a) => a.restaurantId === venueSlug)
    );
  }, [users, venueSlug, venueData]);

  const doLogin = (userId: string) => {
    loginAction(userId);
    // Always ensure this venue's data is loaded into flat store fields
    if (activeRestaurantId && activeRestaurantId !== venueSlug) {
      // Switching from a different venue: save current flat data, then load new
      switchRestaurant(activeRestaurantId, venueSlug);
    } else {
      // Same venue or first activation: just load venue data into flat fields
      loadVenuePublic(venueSlug);
    }
    setActiveRestaurant(venueSlug);
    router.push(`/admin/${venueSlug}/restaurant`);
  };

  // Handle quick-select: fill credentials & auto-submit
  const handleQuickSelect = (user: AppUser) => {
    setLoginError("");
    setSelectedUserId(user.id);
    setEmail(user.email);
    const hardcodedPw = HARDCODED_PASSWORDS[user.email] || "password";
    setPassword(hardcodedPw);

    // Simulate a brief login delay for realism
    setIsLoggingIn(true);
    setTimeout(() => {
      setLoginSuccess(true);
      setTimeout(() => {
        doLogin(user.id);
      }, 400);
    }, 600);
  };

  // Handle manual form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email.trim()) {
      setLoginError("Please enter your email address");
      return;
    }
    if (!password.trim()) {
      setLoginError("Please enter your password");
      return;
    }

    // Find matching user by email
    const matchedUser = venueUsers.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!matchedUser) {
      setLoginError("No account found with this email for this venue");
      return;
    }

    // Check hardcoded password
    const correctPw = HARDCODED_PASSWORDS[matchedUser.email];
    if (correctPw && password !== correctPw) {
      setLoginError("Incorrect password");
      return;
    }

    setSelectedUserId(matchedUser.id);
    setIsLoggingIn(true);
    setTimeout(() => {
      setLoginSuccess(true);
      setTimeout(() => {
        doLogin(matchedUser.id);
      }, 400);
    }, 600);
  };

  // If venue doesn't exist, redirect back
  if (!venueData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted text-sm">Venue not found.</p>
      </div>
    );
  }

  const venueType = venueData.venueType || "restaurant";
  const vConf = VENUE_TYPES.find((v) => v.value === venueType) || VENUE_TYPES[0];
  const vColor = VENUE_COLORS[venueType];

  return (
    <div>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push("/admin")}
        className="flex items-center gap-2 text-[13px] font-semibold text-muted hover:text-dark transition mb-6 group"
      >
        <div className="w-7 h-7 rounded-lg bg-bg group-hover:bg-primary/10 flex items-center justify-center transition">
          <ArrowLeft size={14} className="group-hover:text-primary transition" />
        </div>
        Back to venues
      </motion.button>

      {/* Venue header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100/80 mb-8"
      >
        <div className="h-36 bg-gradient-to-br from-primary/20 to-amber-500/10 relative overflow-hidden">
          {venueData.restaurant.image && (
            <img src={venueData.restaurant.image} alt={venueData.restaurant.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-sm bg-white/90", vColor.text, vColor.border)}>
              <vConf.icon size={11} />
              {vConf.label}
            </div>
          </div>
          <div className="absolute bottom-4 left-5">
            <h2 className="text-2xl font-extrabold text-white drop-shadow-md tracking-tight">{venueData.restaurant.name}</h2>
            <p className="text-[12px] text-white/70 font-medium mt-0.5">{venueData.restaurant.tagline || "No tagline set"}</p>
          </div>
        </div>
      </motion.div>

      {/* Login Section */}
      <div className="max-w-[480px] mx-auto">
        {/* Login header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-center mb-6"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <LogIn size={20} className="text-primary" />
          </div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-dark tracking-tight">Sign in</h2>
          <p className="text-[13px] text-muted mt-1.5">Enter your credentials to access this venue</p>
        </motion.div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          onSubmit={handleFormSubmit}
          className="bg-white rounded-2xl shadow-card border border-gray-100/80 p-6 mb-6"
        >
          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/40">
                <Mail size={15} />
              </div>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLoginError(""); }}
                placeholder="you@example.com"
                disabled={isLoggingIn}
                className={clsx(
                  "w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50/50 text-dark text-[13px] font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white placeholder:text-muted/40",
                  loginError ? "border-red-300" : "border-gray-200",
                  isLoggingIn && "opacity-60 cursor-not-allowed"
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/40">
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                placeholder="••••••••"
                disabled={isLoggingIn}
                className={clsx(
                  "w-full pl-10 pr-11 py-3 rounded-xl border bg-gray-50/50 text-dark text-[13px] font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white placeholder:text-muted/40",
                  loginError ? "border-red-300" : "border-gray-200",
                  isLoggingIn && "opacity-60 cursor-not-allowed"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {loginError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-[12px] text-accent-red font-medium mb-3"
              >
                {loginError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className={clsx(
              "w-full py-3 rounded-xl text-[13px] font-bold transition flex items-center justify-center gap-2",
              loginSuccess
                ? "bg-accent-green text-white"
                : isLoggingIn
                ? "bg-primary/80 text-white cursor-wait"
                : "bg-gradient-to-r from-primary to-amber-500 text-white hover:brightness-105 shadow-glow"
            )}
          >
            {loginSuccess ? (
              <>
                <CheckCircle size={15} />
                Signed in!
              </>
            ) : isLoggingIn ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={15} />
                Sign In
              </>
            )}
          </button>
        </motion.form>

        {/* Divider — or pick an account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider">or sign in as</span>
          <div className="flex-1 h-px bg-gray-200" />
        </motion.div>

        {/* Quick-select user cards */}
        <div className="space-y-2.5">
          {venueUsers.map((user, i) => {
            const isPlatformAdmin = user.platformRole === "admin";
            const role = getUserRestaurantRole(user.id, venueSlug);
            const roleConf = role ? ROLE_CONFIG[role] : null;
            const RoleIcon = isPlatformAdmin ? ShieldCheck : roleConf?.icon || Shield;
            const roleLabel = isPlatformAdmin ? "Admin (Full Access)" : roleConf?.label || "Viewer";
            const roleColor = isPlatformAdmin ? "text-primary" : roleConf?.color || "text-muted";
            const isSelected = selectedUserId === user.id && isLoggingIn;

            return (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + i * 0.05, duration: 0.3 }}
                onClick={() => !isLoggingIn && handleQuickSelect(user)}
                disabled={isLoggingIn}
                className={clsx(
                  "w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-soft border transition-all duration-200 group text-left",
                  isSelected
                    ? "border-primary/40 bg-primary/5 shadow-card"
                    : isLoggingIn
                    ? "border-gray-100/80 opacity-50 cursor-not-allowed"
                    : "border-gray-100/80 hover:border-primary/20 hover:shadow-card cursor-pointer"
                )}
              >
                <div className={clsx(
                  "w-11 h-11 rounded-xl bg-bg flex items-center justify-center text-xl shrink-0 transition-transform",
                  !isLoggingIn && "group-hover:scale-105"
                )}>
                  {user.avatar || "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[13px] font-bold text-dark">{user.name}</span>
                  <span className="block text-[11px] text-muted truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSelected ? (
                    <Loader2 size={14} className="text-primary animate-spin" />
                  ) : (
                    <>
                      <RoleIcon size={12} className={roleColor} />
                      <span className={clsx("text-[11px] font-bold", roleColor)}>{roleLabel}</span>
                    </>
                  )}
                </div>
                {!isSelected && (
                  <ChevronRight size={14} className="text-muted/30 group-hover:text-primary transition shrink-0" />
                )}
              </motion.button>
            );
          })}

          {venueUsers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100/80 shadow-soft p-8 text-center"
            >
              <UserCog size={36} className="text-muted/20 mx-auto mb-3" />
              <p className="text-[13px] font-semibold text-dark">No users have access</p>
              <p className="text-[12px] text-muted mt-1">Assign users via the Users & Roles page first</p>
            </motion.div>
          )}
        </div>

        {/* Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] text-muted/50 text-center mt-6"
        >
          This is a simulated login. Select an account above or type credentials manually.
        </motion.p>
      </div>
    </div>
  );
}
