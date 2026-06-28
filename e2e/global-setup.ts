import { execSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

interface LocalSupabaseStatus {
  API_URL: string;
  ANON_KEY: string;
  SERVICE_ROLE_KEY: string;
}

function getLocalSupabaseStatus(): LocalSupabaseStatus {
  const output = execSync("pnpx supabase status -o json", {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  return JSON.parse(output) as LocalSupabaseStatus;
}

async function ensureOwnerAuthUser(
  status: LocalSupabaseStatus,
  email: string,
  password: string
): Promise<void> {
  const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await admin
    .from("profiles")
    .select("id, user_id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    throw new Error(
      `No profile for ${email}. Run: pnpm supabase:db:reset (migrations + scripts/seed-db.ts)`
    );
  }

  if (profile.user_id) {
    return;
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "John Smith" },
  });

  let userId = created?.user?.id;

  if (createError) {
    const message = createError.message.toLowerCase();
    if (!message.includes("already")) {
      throw createError;
    }

    const { data: listed, error: listError } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    if (listError) throw listError;

    userId = listed.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id;
    if (!userId) {
      throw new Error(`Auth user ${email} exists but could not be resolved`);
    }
  }

  const { error: linkError } = await admin
    .from("profiles")
    .update({ user_id: userId })
    .eq("id", profile.id)
    .is("user_id", null);

  if (linkError) throw linkError;
}

export default async function globalSetup(): Promise<void> {
  const email = process.env.E2E_OWNER_EMAIL ?? "owner@example.com";
  const password = process.env.E2E_OWNER_PASSWORD ?? "password123";

  let status: LocalSupabaseStatus;
  try {
    status = getLocalSupabaseStatus();
  } catch {
    throw new Error("Local Supabase is not running. Start it with: pnpm supabase:start");
  }

  if (!status.API_URL.includes("127.0.0.1") && !status.API_URL.includes("localhost")) {
    throw new Error(
      `E2E tests require local Supabase (got ${status.API_URL}). Check pnpx supabase status.`
    );
  }

  await ensureOwnerAuthUser(status, email, password);
}
