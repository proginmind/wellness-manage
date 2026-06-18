/**
 * Seed the application database with demo data for local or remote Supabase.
 *
 * Usage:
 *   pnpm db:seed              # seed / refresh demo org data
 *   pnpm db:seed -- --reset   # wipe all users + data, then seed
 *
 * Reads configuration from .env.local. Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY
 *
 * Optional seed settings (in .env.local):
 *   SEED_OWNER_EMAIL=owner@example.com
 *   SEED_OWNER_PASSWORD=password123
 *   SEED_CREATE_AUTH_USERS=owner   # owner | all | false
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const ORG_NAME = "Wellness Center Demo";
const DEFAULT_OWNER_EMAIL = "owner@example.com";
const DEFAULT_OWNER_PASSWORD = "password123";

const STAFF = [
  {
    email: "staff1@example.com",
    firstName: "Alice",
    lastName: "Johnson",
    description: "Certified massage therapist",
    dateOfBirth: "1992-03-15",
    phone: "+1234567891",
  },
  {
    email: "staff2@example.com",
    firstName: "Bob",
    lastName: "Martinez",
    description: "Experienced yoga instructor",
    dateOfBirth: "1988-07-22",
    phone: "+1234567892",
  },
] as const;

const CLIENTS = [
  {
    firstName: "Emma",
    lastName: "Johnson",
    email: "emma.johnson@example.com",
    dob: "1992-05-20",
    joined: "2025-01-15",
  },
  {
    firstName: "Liam",
    lastName: "Smith",
    email: "liam.smith@example.com",
    dob: "1988-11-03",
    joined: "2025-02-20",
  },
  {
    firstName: "Olivia",
    lastName: "Brown",
    email: "olivia.brown@example.com",
    dob: "1995-03-14",
    joined: "2025-03-10",
  },
  {
    firstName: "Noah",
    lastName: "Davis",
    email: "noah.davis@example.com",
    dob: "1990-07-22",
    joined: "2025-04-05",
  },
  {
    firstName: "Ava",
    lastName: "Martinez",
    email: "ava.martinez@example.com",
    dob: "1993-09-18",
    joined: "2025-05-12",
  },
] as const;

const CATEGORIES = [
  { name: "Massage Therapy", description: "Therapeutic massage services", color: "#9333EA" },
  { name: "Yoga & Fitness", description: "Yoga classes and fitness programs", color: "#059669" },
] as const;

const SERVICES = [
  {
    key: "swedish",
    name: "Swedish Massage",
    description: "Relaxing full-body massage",
    duration: 60,
    price: 80,
    color: "#9333EA",
    categoryKey: "massage" as const,
  },
  {
    key: "yoga",
    name: "Vinyasa Yoga",
    description: "Dynamic flowing yoga practice",
    duration: 60,
    price: 25,
    color: "#059669",
    categoryKey: "yoga" as const,
  },
] as const;

type ServiceKey = (typeof SERVICES)[number]["key"];
type CategoryKey = "massage" | "yoga";
type AuthUsersMode = "owner" | "all" | "false";

interface SeedConfig {
  ownerEmail: string;
  ownerPassword: string;
  createAuthUsers: AuthUsersMode;
  resetBefore: boolean;
}

const GREEN = "\x1b[32m";
const BLUE = "\x1b[34m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const NC = "\x1b[0m";

function log(msg: string): void {
  console.log(msg);
}

function success(msg: string): void {
  log(`${GREEN}✅ ${msg}${NC}`);
}

function info(msg: string): void {
  log(`${BLUE}${msg}${NC}`);
}

function warn(msg: string): void {
  log(`${YELLOW}⚠️  ${msg}${NC}`);
}

function fail(msg: string): never {
  console.error(`${RED}❌ ${msg}${NC}`);
  process.exit(1);
}

function loadEnvLocal(): void {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) {
    fail(".env.local not found. Create it with your Supabase URL and service role key.");
  }

  const content = readFileSync(path, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parseConfig(): SeedConfig {
  const resetBefore = process.argv.includes("--reset");
  const ownerEmail = process.env.SEED_OWNER_EMAIL?.trim() || DEFAULT_OWNER_EMAIL;
  const ownerPassword = process.env.SEED_OWNER_PASSWORD?.trim() || DEFAULT_OWNER_PASSWORD;
  const authMode = (process.env.SEED_CREATE_AUTH_USERS?.trim().toLowerCase() ||
    "owner") as AuthUsersMode;

  if (!["owner", "all", "false"].includes(authMode)) {
    fail('SEED_CREATE_AUTH_USERS must be "owner", "all", or "false"');
  }

  return { ownerEmail, ownerPassword, createAuthUsers: authMode, resetBefore };
}

function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    fail(
      "Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) in .env.local"
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]!;
}

function time(hour: number, minute = 0): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

interface VisitSeed {
  memberIndex: number;
  serviceKey: ServiceKey;
  staffKey: "owner" | "staff1" | "staff2";
  daysOffset: number;
  hour: number;
  status: "pending" | "completed" | "cancelled";
}

const VISITS: VisitSeed[] = [
  {
    memberIndex: 0,
    serviceKey: "swedish",
    staffKey: "owner",
    daysOffset: -21,
    hour: 10,
    status: "completed",
  },
  {
    memberIndex: 1,
    serviceKey: "swedish",
    staffKey: "staff1",
    daysOffset: -14,
    hour: 11,
    status: "completed",
  },
  {
    memberIndex: 2,
    serviceKey: "yoga",
    staffKey: "staff2",
    daysOffset: -14,
    hour: 9,
    status: "completed",
  },
  {
    memberIndex: 3,
    serviceKey: "swedish",
    staffKey: "staff1",
    daysOffset: -10,
    hour: 14,
    status: "completed",
  },
  {
    memberIndex: 4,
    serviceKey: "yoga",
    staffKey: "staff2",
    daysOffset: -7,
    hour: 10,
    status: "completed",
  },
  {
    memberIndex: 0,
    serviceKey: "swedish",
    staffKey: "owner",
    daysOffset: -5,
    hour: 15,
    status: "completed",
  },
  {
    memberIndex: 1,
    serviceKey: "yoga",
    staffKey: "staff2",
    daysOffset: -3,
    hour: 11,
    status: "completed",
  },
  {
    memberIndex: 2,
    serviceKey: "swedish",
    staffKey: "staff1",
    daysOffset: -5,
    hour: 10,
    status: "cancelled",
  },
  {
    memberIndex: 3,
    serviceKey: "yoga",
    staffKey: "staff2",
    daysOffset: -2,
    hour: 16,
    status: "cancelled",
  },
  {
    memberIndex: 0,
    serviceKey: "swedish",
    staffKey: "owner",
    daysOffset: 1,
    hour: 10,
    status: "pending",
  },
  {
    memberIndex: 1,
    serviceKey: "yoga",
    staffKey: "staff2",
    daysOffset: 2,
    hour: 11,
    status: "pending",
  },
  {
    memberIndex: 2,
    serviceKey: "swedish",
    staffKey: "staff1",
    daysOffset: 4,
    hour: 14,
    status: "pending",
  },
  {
    memberIndex: 3,
    serviceKey: "swedish",
    staffKey: "owner",
    daysOffset: 6,
    hour: 9,
    status: "pending",
  },
];

async function deleteAllAuthUsers(supabase: SupabaseClient): Promise<void> {
  let page = 1;
  const perPage = 100;
  let totalDeleted = 0;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) fail(`Failed to list auth users: ${error.message}`);

    const users = data.users;
    if (users.length === 0) break;

    for (const user of users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) fail(`Failed to delete auth user ${user.email}: ${deleteError.message}`);
      totalDeleted++;
    }

    if (users.length < perPage) break;
    page++;
  }

  if (totalDeleted > 0) {
    success(`Deleted ${totalDeleted} auth user(s)`);
  } else {
    info("No auth users to delete");
  }
}

async function resetAllData(supabase: SupabaseClient): Promise<void> {
  warn("Resetting all application data and auth users...");

  await deleteAllAuthUsers(supabase);

  const { data: owners, error: ownersError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "owner");
  if (ownersError) fail(`Failed to list owner profiles: ${ownersError.message}`);

  if (owners && owners.length > 0) {
    const ownerIds = owners.map((o) => o.id);
    const { error: deleteOwnersError } = await supabase
      .from("profiles")
      .delete()
      .in("id", ownerIds);
    if (deleteOwnersError) fail(`Failed to delete owner profiles: ${deleteOwnersError.message}`);
    success(`Deleted ${ownerIds.length} organization(s) via owner profile cascade`);
  }

  const { error: orphanError } = await supabase.from("profiles").delete().not("id", "is", null);
  if (orphanError) fail(`Failed to delete remaining profiles: ${orphanError.message}`);

  success("Database reset complete");
}

async function createAndLinkAuthUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
  fullName: string
): Promise<void> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, user_id")
    .eq("email", email)
    .maybeSingle();
  if (profileError) fail(`Failed to look up profile for ${email}: ${profileError.message}`);
  if (!profile) {
    warn(`No profile found for ${email} — skipping auth user creation`);
    return;
  }

  if (profile.user_id) {
    info(`Auth already linked for ${email}`);
    return;
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  let userId = created?.user?.id;

  if (createError) {
    if (!createError.message.toLowerCase().includes("already")) {
      fail(`Failed to create auth user ${email}: ${createError.message}`);
    }

    const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
    });
    if (listError) fail(`Failed to list users for ${email}: ${listError.message}`);
    const existing = listed.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existing) fail(`Auth user ${email} reported as existing but could not be found`);
    userId = existing.id;
    info(`Auth user already exists for ${email}`);
  } else {
    success(`Created auth user: ${email}`);
  }

  const { error: linkError } = await supabase
    .from("profiles")
    .update({ user_id: userId })
    .eq("id", profile.id)
    .is("user_id", null);
  if (linkError) fail(`Failed to link profile for ${email}: ${linkError.message}`);

  success(`Linked profile to auth user: ${email}`);
}

async function createAuthUsers(supabase: SupabaseClient, config: SeedConfig): Promise<void> {
  if (config.createAuthUsers === "false") {
    info("Skipping auth user creation (SEED_CREATE_AUTH_USERS=false)");
    return;
  }

  info("Creating auth users and linking to profiles...");

  await createAndLinkAuthUser(supabase, config.ownerEmail, config.ownerPassword, "John Smith");

  if (config.createAuthUsers === "all") {
    for (const staff of STAFF) {
      await createAndLinkAuthUser(
        supabase,
        staff.email,
        config.ownerPassword,
        `${staff.firstName} ${staff.lastName}`
      );
    }
  }

  console.log();
}

async function getOrCreateOwner(
  supabase: SupabaseClient,
  ownerEmail: string
): Promise<{ id: string; organizationId: string }> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, organization_id")
    .eq("email", ownerEmail)
    .eq("role", "owner")
    .maybeSingle();

  if (existing?.id && existing.organization_id) {
    return { id: existing.id, organizationId: existing.organization_id };
  }

  let ownerId = existing?.id;
  if (!ownerId) {
    const { data: owner, error } = await supabase
      .from("profiles")
      .insert({
        role: "owner",
        email: ownerEmail,
        first_name: "John",
        last_name: "Smith",
        description: "Wellness center owner and licensed massage therapist",
        date_of_birth: "1985-06-15",
        phone_number: "+1234567890",
      })
      .select("id")
      .single();
    if (error) fail(`Failed to create owner profile: ${error.message}`);
    ownerId = owner.id;
    success("Created owner profile");
  }

  const { data: orgExisting } = await supabase
    .from("organizations")
    .select("id")
    .eq("name", ORG_NAME)
    .maybeSingle();

  let orgId = orgExisting?.id;
  if (!orgId) {
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);
    const { data: org, error } = await supabase
      .from("organizations")
      .insert({
        name: ORG_NAME,
        owner_id: ownerId,
        trial_ends_at: trialEnds.toISOString(),
        currency: "USD",
      })
      .select("id")
      .single();
    if (error) fail(`Failed to create organization: ${error.message}`);
    orgId = org.id;
    success(`Created organization: ${ORG_NAME}`);
  }

  const { error: linkError } = await supabase
    .from("profiles")
    .update({ organization_id: orgId })
    .eq("id", ownerId);
  if (linkError) fail(`Failed to link owner to organization: ${linkError.message}`);

  await supabase.from("organization_contact").upsert(
    {
      organization_id: orgId,
      phone: "+1 (555) 234-5678",
      email: "hello@wellnesscenter.example.com",
      address: {
        line1: "123 Serenity Lane",
        line2: "Suite 200",
        city: "San Francisco",
        state: "CA",
        postalCode: "94102",
        country: "US",
      },
      social_links: {
        website: "https://wellnesscenter.example.com",
        instagram: "https://instagram.com/wellnesscenter",
      },
    },
    { onConflict: "organization_id" }
  );

  return { id: ownerId, organizationId: orgId };
}

async function clearOrgData(supabase: SupabaseClient, orgId: string): Promise<void> {
  const tables = [
    "visits",
    "staff_availability",
    "profiles_event_types",
    "event_types",
    "event_categories",
    "members",
  ] as const;

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("organization_id", orgId);
    if (error) fail(`Failed to clear ${table}: ${error.message}`);
  }

  const { error: staffError } = await supabase
    .from("profiles")
    .delete()
    .eq("organization_id", orgId)
    .eq("role", "staff");
  if (staffError) fail(`Failed to clear staff profiles: ${staffError.message}`);
}

async function seed(): Promise<void> {
  loadEnvLocal();
  const config = parseConfig();
  const supabase = createAdminClient();

  info("========================================");
  info("🌱 Seeding application database");
  info("========================================");
  info(`📡 ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  info(`👤 Owner email: ${config.ownerEmail}`);
  if (config.resetBefore) {
    warn("--reset enabled: all existing data and auth users will be removed");
  }
  console.log();

  if (config.resetBefore) {
    await resetAllData(supabase);
    console.log();
  }

  const owner = await getOrCreateOwner(supabase, config.ownerEmail);
  const orgId = owner.organizationId;

  await clearOrgData(supabase, orgId);
  info("Cleared existing org seed data");

  const { data: staffRows, error: staffError } = await supabase
    .from("profiles")
    .insert(
      STAFF.map((s) => ({
        organization_id: orgId,
        role: "staff",
        email: s.email,
        first_name: s.firstName,
        last_name: s.lastName,
        description: s.description,
        date_of_birth: s.dateOfBirth,
        phone_number: s.phone,
      }))
    )
    .select("id, email");
  if (staffError) fail(`Failed to create staff: ${staffError.message}`);

  const staffIds = {
    staff1: staffRows!.find((r) => r.email === "staff1@example.com")!.id,
    staff2: staffRows!.find((r) => r.email === "staff2@example.com")!.id,
  };
  success("Created 2 staff profiles");

  const categoryIds: Record<CategoryKey, string> = {} as Record<CategoryKey, string>;
  const categoryKeyByName: Record<string, CategoryKey> = {
    "Massage Therapy": "massage",
    "Yoga & Fitness": "yoga",
  };

  for (const cat of CATEGORIES) {
    const { data, error } = await supabase
      .from("event_categories")
      .insert({
        organization_id: orgId,
        name: cat.name,
        description: cat.description,
        color: cat.color,
      })
      .select("id, name")
      .single();
    if (error) fail(`Failed to create category ${cat.name}: ${error.message}`);
    categoryIds[categoryKeyByName[data.name]!] = data.id;
  }
  success("Created 2 event categories");

  const serviceIds: Record<
    ServiceKey,
    {
      id: string;
      name: string;
      duration: number;
      price: number;
      categoryName: string;
      categoryColor: string;
    }
  > = {} as Record<
    ServiceKey,
    {
      id: string;
      name: string;
      duration: number;
      price: number;
      categoryName: string;
      categoryColor: string;
    }
  >;

  for (const svc of SERVICES) {
    const category = svc.categoryKey === "massage" ? CATEGORIES[0] : CATEGORIES[1];
    const { data, error } = await supabase
      .from("event_types")
      .insert({
        organization_id: orgId,
        name: svc.name,
        description: svc.description,
        duration: svc.duration,
        price: svc.price,
        color: svc.color,
        category_id: categoryIds[svc.categoryKey],
      })
      .select("id")
      .single();
    if (error) fail(`Failed to create service ${svc.name}: ${error.message}`);
    serviceIds[svc.key] = {
      id: data.id,
      name: svc.name,
      duration: svc.duration,
      price: svc.price,
      categoryName: category.name,
      categoryColor: category.color,
    };
  }
  success("Created 2 services");

  const eventTypeAssignments = [
    { profile_id: owner.id, event_type_id: serviceIds.swedish.id },
    { profile_id: staffIds.staff1, event_type_id: serviceIds.swedish.id },
    { profile_id: staffIds.staff2, event_type_id: serviceIds.yoga.id },
  ];

  const { error: assignError } = await supabase
    .from("profiles_event_types")
    .insert(eventTypeAssignments.map((row) => ({ ...row, organization_id: orgId })));
  if (assignError) fail(`Failed to assign services to staff: ${assignError.message}`);
  success("Assigned services (owner: massage, staff1: massage, staff2: yoga)");

  const availabilityRows = [
    ...[1, 2, 3, 4, 5].map((day) => ({
      organization_id: orgId,
      profile_id: owner.id,
      day_of_week: day,
      start_time: "09:00:00",
      end_time: "17:00:00",
    })),
    ...[2, 3, 4, 5, 6].map((day) => ({
      organization_id: orgId,
      profile_id: staffIds.staff1,
      day_of_week: day,
      start_time: "10:00:00",
      end_time: "18:00:00",
    })),
    ...[1, 3, 5].map((day) => ({
      organization_id: orgId,
      profile_id: staffIds.staff2,
      day_of_week: day,
      start_time: "08:00:00",
      end_time: "16:00:00",
    })),
  ];

  const { error: availError } = await supabase.from("staff_availability").insert(availabilityRows);
  if (availError) fail(`Failed to create staff availability: ${availError.message}`);
  success("Created staff availability (owner + 2 staff)");

  const { data: members, error: membersError } = await supabase
    .from("members")
    .insert(
      CLIENTS.map((c) => ({
        organization_id: orgId,
        first_name: c.firstName,
        last_name: c.lastName,
        email: c.email,
        date_of_birth: c.dob,
        date_joined: c.joined,
        status: "active",
      }))
    )
    .select("id");
  if (membersError) fail(`Failed to create members: ${membersError.message}`);
  success(`Created ${members!.length} clients`);

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const staffProfileIds: Record<VisitSeed["staffKey"], string> = {
    owner: owner.id,
    staff1: staffIds.staff1,
    staff2: staffIds.staff2,
  };

  const visitRows = VISITS.map((v) => {
    const svc = serviceIds[v.serviceKey];
    const memberId = members![v.memberIndex]!.id;
    return {
      organization_id: orgId,
      member_id: memberId,
      staff_id: staffProfileIds[v.staffKey],
      event_type_id: svc.id,
      event_type_name: svc.name,
      event_type_duration: svc.duration,
      event_type_price: svc.price,
      event_type_currency: "USD",
      event_type_category_name: svc.categoryName,
      event_type_category_color: svc.categoryColor,
      date: addDays(today, v.daysOffset),
      time: time(v.hour),
      status: v.status,
      notes: v.status === "cancelled" ? "Client rescheduled" : null,
    };
  });

  const { error: visitsError } = await supabase.from("visits").insert(visitRows);
  if (visitsError) fail(`Failed to create visits: ${visitsError.message}`);

  const pendingUpcoming = visitRows.filter(
    (v) => v.status === "pending" && v.date >= addDays(today, 0) && v.date < addDays(today, 7)
  ).length;
  const completedRecent = visitRows.filter(
    (v) => v.status === "completed" && v.date >= addDays(today, -30)
  ).length;

  success(
    `Created ${visitRows.length} visits (${pendingUpcoming} upcoming pending, ${completedRecent} completed in last 30 days)`
  );

  await createAuthUsers(supabase, config);

  console.log();
  info("========================================");
  success("Seeding complete!");
  info("========================================");
  console.log();
  info("Summary:");
  log("  • 1 owner (massage staff) + 2 staff with availability");
  log("  • 5 clients, 2 categories, 2 services");
  log("  • Past & future appointments for dashboard charts");
  console.log();
  if (config.createAuthUsers !== "false") {
    info("Log in with:");
    log(`  • ${config.ownerEmail} / ${config.ownerPassword}`);
    if (config.createAuthUsers === "all") {
      log(`  • staff1@example.com / ${config.ownerPassword}`);
      log(`  • staff2@example.com / ${config.ownerPassword}`);
    }
  }
  console.log();
}

seed().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
