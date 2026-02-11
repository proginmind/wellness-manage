/**
 * Server-side authentication utilities
 * Use these instead of manual auth checks in pages/components
 */

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { buildRoute } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Get the current authenticated user or redirect to login
 * Use this in Server Components that require authentication
 *
 * @example
 * export default async function MembersPage() {
 *   const user = await requireAuth();
 *   // user is guaranteed to exist here
 * }
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildRoute.login());
  }

  return user;
}

/**
 * Get the current user if authenticated, or null if not
 * Use this in Server Components that work for both auth/unauth users
 *
 * @example
 * export default async function HomePage() {
 *   const user = await getUser();
 *   if (user) {
 *     // Show authenticated content
 *   } else {
 *     // Show public content
 *   }
 * }
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

/**
 * Check if user is authenticated without redirecting
 * Returns boolean instead of user object
 *
 * @example
 * export default async function NavBar() {
 *   const isAuthenticated = await isAuth();
 *   // Show different nav items based on auth state
 * }
 */
export async function isAuth(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

/**
 * Require authentication and redirect to a specific path if not authenticated
 * Useful for cases where you want to redirect somewhere other than login
 *
 * @example
 * const user = await requireAuthOr(buildRoute.home());
 */
export async function requireAuthOr(redirectPath: string): Promise<User> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectPath);
  }

  return user;
}
