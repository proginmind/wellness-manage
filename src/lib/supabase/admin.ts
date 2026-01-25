/**
 * Supabase Admin Client
 * 
 * This client uses the service role key for admin operations
 * that require elevated privileges (like accessing auth.admin APIs)
 * 
 * ⚠️ ONLY use this server-side!
 * ⚠️ Never expose the service role key to the client
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

/**
 * Create a Supabase admin client with service role key
 * Use this ONLY for admin operations that require elevated privileges
 */
export function createAdminClient() {
  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
