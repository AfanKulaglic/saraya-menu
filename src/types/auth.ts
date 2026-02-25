// ─── Multi-Restaurant Role System ────────────────────────
// Two-tier roles:
//   Platform (Saraya) roles: admin, user
//   Restaurant (Client) roles: manager, employee

/** Type of venue */
export type VenueType = 'restaurant' | 'cafe' | 'bar' | 'bakery' | 'food-truck' | 'pizzeria' | 'pub' | 'lounge';

/** Platform-level roles (Saraya / developer level) */
export type PlatformRole = 'admin' | 'user';

/** Per-restaurant client roles */
export type RestaurantRole = 'manager' | 'employee';

/** Mapping of a user's access to a specific restaurant */
export interface RestaurantAccess {
  restaurantId: string;
  role: RestaurantRole;
}

/** Application user (platform-level) */
export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  platformRole: PlatformRole;
  restaurantAccess: RestaurantAccess[];
  createdAt: string;
}

/** Minimal restaurant reference in the auth context */
export interface RestaurantMeta {
  id: string;
  name: string;
  logo: string;
  venueType: VenueType;
  createdAt: string;
}
