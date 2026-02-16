/**
 * Supabase Admin Client
 *
 * This client uses the secret key for admin operations
 * that require elevated privileges (like accessing auth.admin APIs)
 *
 * ⚠️ ONLY use this server-side!
 * ⚠️ Never expose the secret key to the client
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Create a Supabase admin client with secret key
 * Use this ONLY for admin operations that require elevated privileges
 */
export function createAdminClient() {
  return createClient(supabaseUrl!, supabaseSecretKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
