import { cache } from "react";

import { EventCategory } from "@/types/event-category";
import { EventType } from "@/types/event-type";
import { Member, MemberStatus } from "@/types/member";
import { Organization } from "@/types/organization";
import { Profile } from "@/types/profile";
import { Visit, VisitStatus } from "@/types/visit";
import { UserRole } from "@/lib/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { MemberFormValues } from "@/lib/validations/member";

import { VisitFormValues } from "../validations/visit";

// ============================================================================
// DATABASE ROW TYPES (snake_case from PostgreSQL)
// ============================================================================

interface OrganizationRow {
  id: string;
  name: string;
  owner_id: string;
  currency: string;
  stripe_customer_id?: string | null;
  trial_ends_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  user_id: string | null;
  organization_id: string;
  email: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  description?: string | null;
  date_of_birth?: string | null;
  phone_number?: string | null;
  avatar_image?: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberRow {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  image: string | null;
  date_of_birth: string;
  date_joined: string;
  status: MemberStatus;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CONVERTERS: Database Row ↔ TypeScript Type
// ============================================================================

export function dbToOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    currency: row.currency ?? "USD",
    stripeCustomerId: row.stripe_customer_id ?? undefined,
    trialEndsAt: row.trial_ends_at ? new Date(row.trial_ends_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function dbToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id ?? "",
    organizationId: row.organization_id,
    email: row.email,
    role: row.role,
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    description: row.description || undefined,
    dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
    phoneNumber: row.phone_number || undefined,
    avatarImage: row.avatar_image || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function dbToMember(row: MemberRow): Member {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phoneNumber: row.phone_number || undefined,
    image: row.image || undefined,
    dateOfBirth: new Date(row.date_of_birth),
    dateJoined: new Date(row.date_joined),
    status: row.status,
    archivedAt: row.archived_at ? new Date(row.archived_at) : undefined,
  };
}

export function memberToDb(
  member: Partial<Member>
): Partial<Omit<MemberRow, "id" | "organization_id" | "created_at" | "updated_at">> {
  const db: Partial<Omit<MemberRow, "id" | "organization_id" | "created_at" | "updated_at">> = {};

  if (member.firstName !== undefined) db.first_name = member.firstName;
  if (member.lastName !== undefined) db.last_name = member.lastName;
  if (member.email !== undefined) db.email = member.email;
  if (member.phoneNumber !== undefined) db.phone_number = member.phoneNumber || null;
  if (member.image !== undefined) db.image = member.image || null;
  if (member.dateOfBirth !== undefined)
    db.date_of_birth = member.dateOfBirth.toISOString().split("T")[0];
  if (member.dateJoined !== undefined)
    db.date_joined = member.dateJoined.toISOString().split("T")[0];
  if (member.status !== undefined) db.status = member.status;
  if (member.archivedAt !== undefined)
    db.archived_at = member.archivedAt ? member.archivedAt.toISOString() : null;

  return db;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current user's profile (includes organization_id and role)
 */
/**
 * Get current user's profile
 * @param userId - User ID to fetch profile for (required to avoid redundant auth calls)
 * @throws Error if profile not found
 */
// Wrapped with React cache() to deduplicate calls within a single request.
// Multiple server components calling this concurrently will share one DB query.
export const getCurrentUserProfile = cache(async function getCurrentUserProfile(
  userId: string
): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  // PGRST116 (no rows) is expected before onboarding completes — not a real error
  if (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch user profile");
  }
  if (!data) {
    throw new Error("User profile not found");
  }

  return dbToProfile(data);
});

/**
 * Update current user's profile
 * @param userId - User ID
 * @param updates - Partial profile updates
 * @returns Updated profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    description?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    avatarImage?: string;
  }
): Promise<Profile> {
  const supabase = await createClient();

  const dbUpdates: Partial<ProfileRow> = {};
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
  if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
  if (updates.avatarImage !== undefined) dbUpdates.avatar_image = updates.avatarImage;

  const { data, error } = await supabase
    .from("profiles")
    .update(dbUpdates)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }

  return dbToProfile(data);
}

/**
 * Create a staff profile for the organization (no auth account required).
 * Uses admin client — profiles table has no INSERT RLS for session users.
 */
export async function createStaffProfile(
  organizationId: string,
  formData: {
    email: string;
    firstName: string;
    lastName: string;
    description?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    avatarImage?: string;
  }
): Promise<Profile> {
  const admin = createAdminClient();
  const email = formData.email.trim();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("organization_id", organizationId)
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    throw new Error("A staff member with this email already exists in your organization");
  }

  const { data, error } = await admin
    .from("profiles")
    .insert({
      organization_id: organizationId,
      role: "staff",
      email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      description: formData.description || null,
      date_of_birth: formData.dateOfBirth || null,
      phone_number: formData.phoneNumber || null,
      avatar_image: formData.avatarImage || null,
      user_id: null,
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Error creating staff profile:", error);
    throw new Error("Failed to create staff profile");
  }

  return dbToProfile(data as ProfileRow);
}

/**
 * Create a new organization and owner profile atomically.
 * Uses the admin client to bypass RLS (the user has no profile yet).
 */
export async function createOrganizationWithOwner(
  userId: string,
  email: string,
  name: string,
  currency: string
): Promise<{ organization: Organization; profile: Profile }> {
  const admin = createAdminClient();

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  // 1. Create profile first — org.owner_id references profiles.id
  const { data: profileRow, error: profileError } = await admin
    .from("profiles")
    .insert({ user_id: userId, email, role: "owner" })
    .select()
    .single();

  if (profileError) throw new Error(`Failed to create profile: ${profileError.message}`);
  if (!profileRow) throw new Error("Profile insert returned no data");

  // 2. Create org with owner_id pointing to the new profile
  const { data: orgRow, error: orgError } = await admin
    .from("organizations")
    .insert({
      name,
      owner_id: profileRow.id,
      currency,
      trial_ends_at: trialEndsAt.toISOString(),
    })
    .select()
    .single();

  if (orgError) throw new Error(`Failed to create organization: ${orgError.message}`);
  if (!orgRow) throw new Error("Organization insert returned no data");

  // 3. Link profile back to the org
  const { error: updateError } = await admin
    .from("profiles")
    .update({ organization_id: orgRow.id })
    .eq("id", profileRow.id);

  if (updateError)
    throw new Error(`Failed to link profile to organization: ${updateError.message}`);

  return {
    organization: dbToOrganization(orgRow as OrganizationRow),
    profile: dbToProfile({ ...profileRow, organization_id: orgRow.id } as ProfileRow),
  };
}

/**
 * Get organization by Stripe customer ID
 */
export async function getOrganizationByStripeCustomerId(
  stripeCustomerId: string
): Promise<Organization | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (error || !data) return null;
  return dbToOrganization(data);
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single();

  if (error || !data) {
    console.error("Error fetching organization:", error);
    return null;
  }

  return dbToOrganization(data);
}

/**
 * Update the currency for an organization
 */
export async function updateOrganizationCurrency(
  organizationId: string,
  currency: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ currency })
    .eq("id", organizationId);

  if (error) {
    console.error("Error updating organization currency:", error);
    throw new Error("Failed to update organization currency");
  }
}

/**
 * Update name and/or currency for an organization
 */
export async function updateOrganization(
  organizationId: string,
  fields: { name?: string; currency?: string; stripeCustomerId?: string; trialEndsAt?: Date | null }
): Promise<void> {
  const supabase = createAdminClient();

  const dbFields: Record<string, unknown> = { ...fields };
  if ("stripeCustomerId" in dbFields) {
    dbFields.stripe_customer_id = dbFields.stripeCustomerId;
    delete dbFields.stripeCustomerId;
  }
  if ("trialEndsAt" in dbFields) {
    dbFields.trial_ends_at = dbFields.trialEndsAt;
    delete dbFields.trialEndsAt;
  }

  const { error } = await supabase.from("organizations").update(dbFields).eq("id", organizationId);

  if (error) {
    console.error("Error updating organization:", error);
    throw new Error("Failed to update organization");
  }
}

/**
 * Get latest subscription for an organization (by created_at DESC)
 */
export async function getLatestSubscriptionByOrganizationId(
  organizationId: string
): Promise<SubscriptionRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data as SubscriptionRow | null;
}

export interface InsertSubscriptionData {
  organizationId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
}

/**
 * Insert a new subscription row (used by Stripe webhooks)
 */
export async function insertSubscription(data: InsertSubscriptionData): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.from("subscriptions").insert({
    organization_id: data.organizationId,
    stripe_subscription_id: data.stripeSubscriptionId,
    stripe_price_id: data.stripePriceId,
    status: data.status,
    current_period_start: data.currentPeriodStart?.toISOString() ?? null,
    current_period_end: data.currentPeriodEnd?.toISOString() ?? null,
    cancel_at_period_end: data.cancelAtPeriodEnd ?? false,
    canceled_at: data.canceledAt?.toISOString() ?? null,
  });

  if (error) {
    console.error("Error inserting subscription:", error);
    throw new Error("Failed to insert subscription");
  }
}

/**
 * Get organization contact info (returns null if not yet created)
 */
export async function getOrganizationContact(
  organizationId: string
): Promise<import("@/types/organization").OrganizationContact | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organization_contact")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching organization contact:", error);
    throw new Error("Failed to fetch organization contact");
  }

  if (!data) return null;

  return {
    organizationId: data.organization_id,
    phone: data.phone ?? undefined,
    email: data.email ?? undefined,
    address: data.address ?? undefined,
    socialLinks: data.social_links ?? undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Create or update organization contact info
 */
export async function upsertOrganizationContact(
  organizationId: string,
  fields: {
    phone?: string;
    email?: string;
    address?: Record<string, unknown>;
    socialLinks?: Record<string, unknown>;
  }
): Promise<import("@/types/organization").OrganizationContact> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("organization_contact")
    .upsert(
      {
        organization_id: organizationId,
        phone: fields.phone ?? null,
        email: fields.email ?? null,
        address: fields.address ?? null,
        social_links: fields.socialLinks ?? null,
      },
      { onConflict: "organization_id" }
    )
    .select()
    .single();

  if (error || !data) {
    console.error("Error upserting organization contact:", error);
    throw new Error("Failed to save organization contact");
  }

  return {
    organizationId: data.organization_id,
    phone: data.phone ?? undefined,
    email: data.email ?? undefined,
    address: data.address ?? undefined,
    socialLinks: data.social_links ?? undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Check if current user is an owner
 */
export async function isCurrentUserOwner(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  try {
    const profile = await getCurrentUserProfile(user.id);
    return profile.role === "owner";
  } catch {
    return false;
  }
}

// ============================================================================
// MEMBER QUERIES (Organization-scoped)
// ============================================================================

/**
 * Get all members with optional search filter (organization-scoped)
 */
export async function getMembers(search?: string): Promise<Member[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  let query = supabase
    .from("members")
    .select("*")
    .eq("organization_id", profile.organizationId)
    .eq("status", "active")
    .order("date_joined", { ascending: false });

  // Apply search filter if provided
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching members:", error);
    throw new Error("Failed to fetch members");
  }

  return (data || []).map(dbToMember);
}

/**
 * Get a single member by ID (organization-scoped via RLS)
 */
export async function getMemberById(id: string): Promise<Member | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .eq("organization_id", profile.organizationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching member:", error);
    throw new Error("Failed to fetch member");
  }

  return dbToMember(data);
}

/**
 * Create a new member (organization-scoped)
 */
export async function createMember(formData: MemberFormValues): Promise<Member> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  const dbData = {
    organization_id: profile.organizationId,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    phone_number: formData.phoneNumber || null,
    image: formData.image || null,
    date_of_birth: formData.dateOfBirth,
    date_joined: formData.dateJoined,
    status: "active" as MemberStatus,
  };

  const { data, error } = await supabase.from("members").insert(dbData).select().single();

  if (error) {
    console.error("Error creating member:", error);
    throw new Error(error.code === "23505" ? "Email already exists" : "Failed to create member");
  }

  return dbToMember(data);
}

/**
 * Update a member
 */
export async function updateMember(id: string, updates: Partial<Member>): Promise<Member> {
  const supabase = await createClient();

  const dbUpdates = memberToDb(updates);

  const { data, error } = await supabase
    .from("members")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating member:", error);
    throw new Error(error.code === "23505" ? "Email already exists" : "Failed to update member");
  }

  return dbToMember(data);
}

/**
 * Archive a member
 */
export async function archiveMember(id: string): Promise<Member> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error archiving member:", error);
    throw new Error("Failed to archive member");
  }

  return dbToMember(data);
}

/**
 * Unarchive a member
 */
export async function unarchiveMember(id: string): Promise<Member> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .update({
      status: "active",
      archived_at: null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error unarchiving member:", error);
    throw new Error("Failed to unarchive member");
  }

  return dbToMember(data);
}

/**
 * Get active members count for an organization
 */
export async function getMembersCount(organizationId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching members count:", error);
    return 0;
  }

  return count ?? 0;
}

/**
 * Get member statistics for dashboard (organization-scoped)
 */
export async function getMemberStats(organizationId: string) {
  const supabase = await createClient();

  // Get all members count
  const { count: total, error: totalError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  if (totalError) {
    console.error("Error fetching total count:", totalError);
    throw new Error("Failed to fetch stats");
  }

  // Get active members count
  const { count: active, error: activeError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  if (activeError) {
    console.error("Error fetching active count:", activeError);
    throw new Error("Failed to fetch stats");
  }

  // Get archived members count
  const { count: archived, error: archivedError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "archived");

  if (archivedError) {
    console.error("Error fetching archived count:", archivedError);
    throw new Error("Failed to fetch stats");
  }

  // Get new members this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: newThisMonth, error: newError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .gte("date_joined", startOfMonth.toISOString().split("T")[0]);

  if (newError) {
    console.error("Error fetching new members count:", newError);
    throw new Error("Failed to fetch stats");
  }

  return {
    total: total || 0,
    active: active || 0,
    archived: archived || 0,
    newThisMonth: newThisMonth || 0,
  };
}

/**
 * Get upcoming visits for dashboard (next 7 days, pending status)
 */
export async function getUpcomingVisits(): Promise<{ visit: Visit; member: Member }[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("visits")
    .select(
      "*, member:members(id, first_name, last_name, email, phone_number, image, date_of_birth, date_joined, status, organization_id, created_at, updated_at)"
    )
    .eq("organization_id", profile.organizationId)
    .gte("date", today)
    .lt("date", nextWeek)
    .eq("status", "pending")
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Error fetching upcoming visits:", error);
    throw new Error("Failed to fetch upcoming visits");
  }

  return (data || []).map((visit) => ({
    visit: dbToVisit(visit),
    member: dbToMember(visit.member),
  }));
}

/**
 * Get monthly revenue (last 30 days, completed visits)
 */
export async function getMonthlyRevenue(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("visits")
    .select("event_type_price")
    .eq("organization_id", profile.organizationId)
    .eq("status", "completed")
    .gte("date", thirtyDaysAgo);

  if (error) {
    console.error("Error fetching revenue data:", error);
    throw new Error("Failed to fetch revenue");
  }

  const revenue = (data || []).reduce((acc, visit) => acc + (visit.event_type_price || 0), 0);

  return revenue;
}

/**
 * Get active staff count for current organization
 */
export async function getActiveStaffCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organizationId)
    .eq("role", "staff");

  if (error) {
    console.error("Error fetching staff count:", error);
    throw new Error("Failed to fetch staff count");
  }

  return count || 0;
}

/**
 * Get revenue chart data (last 4 weeks, completed visits)
 */
export async function getRevenueChartData(): Promise<Array<{ name: string; revenue: number }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("visits")
    .select("date, event_type_price")
    .eq("organization_id", profile.organizationId)
    .eq("status", "completed")
    .gte("date", thirtyDaysAgo)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching chart data:", error);
    throw new Error("Failed to fetch chart data");
  }

  // Group by week and sum revenue
  const weeklyData: Record<string, number> = {};
  const today = new Date();

  (data || []).forEach((visit) => {
    const visitDate = new Date(visit.date);
    const daysDiff = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekNum = Math.floor(daysDiff / 7);

    let weekLabel;
    if (weekNum === 0) {
      weekLabel = "This Week";
    } else if (weekNum === 1) {
      weekLabel = "Last Week";
    } else if (weekNum === 2) {
      weekLabel = "2 Weeks Ago";
    } else {
      weekLabel = "3+ Weeks Ago";
    }

    weeklyData[weekLabel] = (weeklyData[weekLabel] || 0) + (visit.event_type_price || 0);
  });

  // Convert to array format for Recharts
  const chartData = [
    { name: "3+ Weeks Ago", revenue: weeklyData["3+ Weeks Ago"] || 0 },
    { name: "2 Weeks Ago", revenue: weeklyData["2 Weeks Ago"] || 0 },
    { name: "Last Week", revenue: weeklyData["Last Week"] || 0 },
    { name: "This Week", revenue: weeklyData["This Week"] || 0 },
  ];

  return chartData;
}

/**
 * Get visit status distribution for donut chart
 */
export async function getVisitStatusDistribution(): Promise<
  Array<{ name: string; value: number; fill: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  // Get counts for each status
  const { data, error } = await supabase
    .from("visits")
    .select("status")
    .eq("organization_id", profile.organizationId);

  if (error) {
    console.error("Error fetching visit status distribution:", error);
    throw new Error("Failed to fetch visit status distribution");
  }

  // Count visits by status
  const statusCounts: Record<string, number> = {
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  (data || []).forEach((visit) => {
    if (visit.status in statusCounts) {
      statusCounts[visit.status]++;
    }
  });

  // Convert to chart format with colors
  return [
    { name: "Pending", value: statusCounts.pending, fill: "#f59e0b" },
    { name: "Completed", value: statusCounts.completed, fill: "#10b981" },
    { name: "Cancelled", value: statusCounts.cancelled, fill: "#ef4444" },
  ];
}

/**
 * Get revenue by event category for donut chart
 */
export async function getRevenueByCategoryDistribution(): Promise<
  Array<{ name: string; value: number; fill: string }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  // Get completed visits with category snapshot data
  const { data, error } = await supabase
    .from("visits")
    .select("event_type_category_name, event_type_category_color, event_type_price")
    .eq("organization_id", profile.organizationId)
    .eq("status", "completed")
    .not("event_type_category_name", "is", null);

  if (error) {
    console.error("Error fetching revenue by category:", error);
    throw new Error("Failed to fetch revenue by category");
  }

  // Group by category and sum revenue
  const categoryRevenue: Record<string, { revenue: number; color: string }> = {};

  (data || []).forEach((visit) => {
    const categoryName = visit.event_type_category_name || "Uncategorized";
    const categoryColor = visit.event_type_category_color || "#6b7280";

    if (!categoryRevenue[categoryName]) {
      categoryRevenue[categoryName] = { revenue: 0, color: categoryColor };
    }

    categoryRevenue[categoryName].revenue += visit.event_type_price || 0;
  });

  // Convert to chart format
  return Object.entries(categoryRevenue).map(([name, data]) => ({
    name,
    value: data.revenue,
    fill: data.color,
  }));
}

// ============================================================================
// VISITS QUERIES (Organization-scoped)
// ============================================================================

interface VisitRow {
  id: string;
  organization_id: string;
  member_id: string;
  event_type_id: string;
  event_type_name: string;
  event_type_duration: number;
  event_type_price: number;
  event_type_currency: string | null;
  event_type_category_name: string | null;
  event_type_category_color: string | null;
  date: string;
  time: string;
  status: VisitStatus;
  notes: string | null;
  staff_id: string | null;
  created_at: string;
  updated_at: string;
}

export function dbToVisit(row: VisitRow): Visit {
  // Combine date and time to create a proper Date object
  // row.time is stored as TIME in database (e.g., "14:30:00")
  // We need to combine it with the date to create a valid Date object
  const dateStr = row.date; // e.g., "2024-01-15"
  const timeStr = row.time; // e.g., "14:30:00"
  const dateTimeStr = `${dateStr}T${timeStr}`; // e.g., "2024-01-15T14:30:00"

  return {
    id: row.id,
    organizationId: row.organization_id,
    memberId: row.member_id,
    eventTypeId: row.event_type_id,
    eventTypeName: row.event_type_name,
    eventTypeDuration: row.event_type_duration,
    eventTypePrice: row.event_type_price,
    eventTypeCurrency: row.event_type_currency || undefined,
    eventTypeCategoryName: row.event_type_category_name || undefined,
    eventTypeCategoryColor: row.event_type_category_color || undefined,
    date: new Date(row.date),
    time: new Date(dateTimeStr),
    status: row.status,
    notes: row.notes || undefined,
    staffId: row.staff_id || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Get all visits with optional search filter (organization-scoped)
 */
export async function getVisits(search?: string): Promise<{ visit: Visit; member: Member }[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  const query = supabase
    .from("visits")
    .select(
      "*, member:members(id, first_name, last_name, email, image, date_of_birth, date_joined)"
    )
    .eq("organization_id", profile.organizationId)
    .order("date", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching visits:", error);
    throw new Error("Failed to fetch visits");
  }

  return (data || []).map((visit) => {
    return {
      visit: dbToVisit(visit),
      member: dbToMember(visit.member),
    };
  });
}

/**
 * Get all visits for a member (organization-scoped), newest first
 */
export async function getVisitsByMemberId(
  memberId: string,
  organizationId: string
): Promise<Visit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("visits")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("member_id", memberId)
    .order("date", { ascending: false })
    .order("time", { ascending: false });

  if (error) {
    console.error("Error fetching member visits:", error);
    throw new Error("Failed to fetch member visits");
  }

  return (data || []).map(dbToVisit);
}

/**
 * Get a single visit by ID with member details (organization-scoped)
 * @param id - Visit ID
 * @param organizationId - Organization ID (required for organization scoping)
 */
export async function getVisitById(
  id: string,
  organizationId: string
): Promise<{ visit: Visit; member: Member } | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("visits")
    .select(
      "*, member:members(id, first_name, last_name, email, image, date_of_birth, date_joined)"
    )
    .eq("id", id)
    .eq("organization_id", organizationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching visit:", error);
    throw new Error("Failed to fetch visit");
  }

  return {
    visit: dbToVisit(data),
    member: dbToMember(data.member),
  };
}

/**
 * Archive a visit (sets status to cancelled)
 * @param id - Visit ID
 */
export async function archiveVisit(id: string): Promise<Visit> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("visits")
    .update({
      status: "cancelled",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error archiving visit:", error);
    throw new Error("Failed to archive visit");
  }

  return dbToVisit(data);
}

/**
 * Mark a pending visit as completed
 */
export async function completeVisit(id: string, organizationId: string): Promise<Visit> {
  const existing = await getVisitById(id, organizationId);
  if (!existing) {
    throw new Error("Visit not found");
  }
  if (existing.visit.status !== "pending") {
    throw new Error("Only pending visits can be marked as completed");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("visits")
    .update({ status: "completed" })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error || !data) {
    console.error("Error completing visit:", error);
    throw new Error("Failed to complete visit");
  }

  return dbToVisit(data);
}

/**
 * Update an existing visit, refreshing event type snapshot fields if eventTypeId changes
 */
export async function updateVisit(
  id: string,
  organizationId: string,
  formData: {
    memberId: string;
    eventTypeId: string;
    staffId?: string;
    date: string;
    time: string;
    notes?: string;
  }
): Promise<Visit> {
  const supabase = await createClient();

  // Fetch event type snapshot data and org currency in parallel
  const [eventTypeResult, orgResult] = await Promise.all([
    supabase
      .from("event_types")
      .select("name, duration, price, category_id")
      .eq("id", formData.eventTypeId)
      .eq("organization_id", organizationId)
      .single(),
    supabase.from("organizations").select("currency").eq("id", organizationId).single(),
  ]);

  const { data: eventTypeData, error: eventTypeError } = eventTypeResult;
  if (eventTypeError || !eventTypeData) {
    throw new Error("Event type not found");
  }

  const orgCurrency = orgResult.data?.currency ?? "USD";

  let categoryName: string | null = null;
  let categoryColor: string | null = null;
  if (eventTypeData.category_id) {
    const { data: categoryData } = await supabase
      .from("event_categories")
      .select("name, color")
      .eq("id", eventTypeData.category_id)
      .single();
    if (categoryData) {
      categoryName = categoryData.name;
      categoryColor = categoryData.color;
    }
  }

  const { data, error } = await supabase
    .from("visits")
    .update({
      member_id: formData.memberId,
      event_type_id: formData.eventTypeId,
      event_type_name: eventTypeData.name,
      event_type_duration: eventTypeData.duration,
      event_type_price: eventTypeData.price,
      event_type_currency: orgCurrency,
      event_type_category_name: categoryName,
      event_type_category_color: categoryColor,
      staff_id: formData.staffId ?? null,
      date: formData.date,
      time: formData.time,
      notes: formData.notes ?? null,
    })
    .eq("id", id)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (error || !data) {
    console.error("Error updating visit:", error);
    const { toVisitOverlapError } = await import("@/lib/visit-errors");
    throw new Error(toVisitOverlapError(error?.message));
  }

  return dbToVisit(data);
}

/**
 * Create a new visit
 */
export async function createVisit(formData: VisitFormValues, userId: string): Promise<Visit> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  // Fetch event type and org currency in parallel for the snapshot
  const [eventTypeResult, orgResult] = await Promise.all([
    supabase
      .from("event_types")
      .select("name, duration, price, category_id")
      .eq("id", formData.eventTypeId)
      .eq("organization_id", profile.organizationId)
      .single(),
    supabase.from("organizations").select("currency").eq("id", profile.organizationId).single(),
  ]);

  const { data: eventTypeData, error: eventTypeError } = eventTypeResult;

  if (eventTypeError || !eventTypeData) {
    console.error("Error fetching event type:", eventTypeError);
    throw new Error("Event type not found");
  }

  const orgCurrency = orgResult.data?.currency ?? "USD";

  // Fetch category if it exists
  let categoryName: string | null = null;
  let categoryColor: string | null = null;

  if (eventTypeData.category_id) {
    const { data: categoryData } = await supabase
      .from("event_categories")
      .select("name, color")
      .eq("id", eventTypeData.category_id)
      .single();

    if (categoryData) {
      categoryName = categoryData.name;
      categoryColor = categoryData.color;
    }
  }

  const dbData = {
    organization_id: profile.organizationId,
    member_id: formData.memberId,
    event_type_id: formData.eventTypeId,
    // Snapshot event type data at booking time
    event_type_name: eventTypeData.name,
    event_type_duration: eventTypeData.duration,
    event_type_price: eventTypeData.price,
    event_type_currency: orgCurrency,
    event_type_category_name: categoryName,
    event_type_category_color: categoryColor,
    date: formData.date,
    time: formData.time,
    status: "pending" as VisitStatus,
    notes: formData.notes,
    staff_id: formData.staffId || null,
  };

  const { data, error } = await supabase.from("visits").insert(dbData).select().single();

  if (error) {
    console.error("Error creating visit:", error);
    const { toVisitOverlapError } = await import("@/lib/visit-errors");
    throw new Error(toVisitOverlapError(error.message));
  }

  return dbToVisit(data);
}

// ============================================================================
// EVENT TYPES QUERIES (Organization-scoped)
// ============================================================================

interface EventTypeRow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  color: string;
  category_id: string | null;
  duration: number;
  buffer_before: number;
  buffer_after: number;
  price: number;
  is_active: boolean;
  is_bookable: boolean;
  requires_approval: boolean;
  max_advance_booking_days: number | null;
  min_advance_booking_hours: number;
  created_at: string;
  updated_at: string;
}

export function dbToEventType(row: EventTypeRow): EventType {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description || undefined,
    color: row.color,
    categoryId: row.category_id || undefined,
    duration: row.duration,
    bufferBefore: row.buffer_before,
    bufferAfter: row.buffer_after,
    price: Number(row.price),
    isActive: row.is_active,
    isBookable: row.is_bookable,
    requiresApproval: row.requires_approval,
    maxAdvanceBookingDays: row.max_advance_booking_days || undefined,
    minAdvanceBookingHours: row.min_advance_booking_hours,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Get all event types (organization-scoped)
 * @param organizationId - Organization ID (required for organization scoping)
 * @param filters - Optional filters for active/bookable status
 */
export async function getEventTypes(
  organizationId: string,
  filters?: {
    isActive?: boolean;
    isBookable?: boolean;
  }
): Promise<EventType[]> {
  const supabase = await createClient();

  let query = supabase
    .from("event_types")
    .select("*, event_categories:category_id(id, name, color)")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  // Apply filters if provided
  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters?.isBookable !== undefined) {
    query = query.eq("is_bookable", filters.isBookable);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching event types:", error);
    throw new Error("Failed to fetch event types");
  }

  return (data || []).map((row) => {
    const eventType = dbToEventType(row);
    // Add category data if available
    if (row.event_categories) {
      const cat = row.event_categories as { id: string; name: string; color: string };
      eventType.category = {
        id: cat.id,
        name: cat.name,
        color: cat.color,
      };
    }
    return eventType;
  });
}

/**
 * Create a new event type
 * @param eventTypeData - Event type data to create
 * @param organizationId - Organization ID
 */
export async function createEventType(
  eventTypeData: Omit<EventType, "id" | "organizationId" | "createdAt" | "updatedAt">,
  organizationId: string
): Promise<EventType> {
  const supabase = await createClient();

  // Convert camelCase to snake_case for database
  const dbData = {
    organization_id: organizationId,
    name: eventTypeData.name,
    description: eventTypeData.description || null,
    color: eventTypeData.color,
    category_id: eventTypeData.categoryId || null,
    duration: eventTypeData.duration,
    buffer_before: eventTypeData.bufferBefore,
    buffer_after: eventTypeData.bufferAfter,
    price: eventTypeData.price,
    is_active: eventTypeData.isActive,
    is_bookable: eventTypeData.isBookable,
    requires_approval: eventTypeData.requiresApproval,
    max_advance_booking_days: eventTypeData.maxAdvanceBookingDays || null,
    min_advance_booking_hours: eventTypeData.minAdvanceBookingHours,
  };

  const { data, error } = await supabase.from("event_types").insert(dbData).select().single();

  if (error) {
    console.error("Error creating event type:", error);
    throw new Error("Failed to create event type");
  }

  return dbToEventType(data);
}

/**
 * Get a single event type by ID (organization-scoped)
 * @param id - Event type ID
 * @param organizationId - Organization ID (required for organization scoping)
 */
export async function getEventType(id: string, organizationId: string): Promise<EventType | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_types")
    .select("*, event_categories:category_id(id, name, color)")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching event type:", error);
    throw new Error("Failed to fetch event type");
  }

  const eventType = dbToEventType(data);

  // Add category data if available
  if (data.event_categories) {
    const cat = data.event_categories as { id: string; name: string; color: string };
    eventType.category = {
      id: cat.id,
      name: cat.name,
      color: cat.color,
    };
  }

  return eventType;
}

/**
 * Archive an event type (sets is_active to false)
 * @param id - Event type ID
 */
export async function archiveEventType(id: string): Promise<EventType> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_types")
    .update({
      is_active: false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error archiving event type:", error);
    throw new Error("Failed to archive event type");
  }

  return dbToEventType(data);
}

/**
 * Unarchive an event type (sets is_active to true)
 * @param id - Event type ID
 */
export async function unarchiveEventType(id: string): Promise<EventType> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_types")
    .update({
      is_active: true,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error unarchiving event type:", error);
    throw new Error("Failed to unarchive event type");
  }

  return dbToEventType(data);
}

/**
 * Update an event type
 * @param id - Event type ID
 * @param updates - Partial EventType updates
 */
export async function updateEventType(
  id: string,
  updates: Partial<Omit<EventType, "id" | "organizationId" | "createdAt" | "updatedAt">>
): Promise<EventType> {
  const supabase = await createClient();

  // Convert camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description || null;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.bufferBefore !== undefined) dbUpdates.buffer_before = updates.bufferBefore;
  if (updates.bufferAfter !== undefined) dbUpdates.buffer_after = updates.bufferAfter;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  if (updates.isBookable !== undefined) dbUpdates.is_bookable = updates.isBookable;
  if (updates.requiresApproval !== undefined)
    dbUpdates.requires_approval = updates.requiresApproval;
  if (updates.maxAdvanceBookingDays !== undefined)
    dbUpdates.max_advance_booking_days = updates.maxAdvanceBookingDays;
  if (updates.minAdvanceBookingHours !== undefined)
    dbUpdates.min_advance_booking_hours = updates.minAdvanceBookingHours;

  const { data, error } = await supabase
    .from("event_types")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event type:", error);
    throw new Error("Failed to update event type");
  }

  return dbToEventType(data);
}

// ============================================================================
// EVENT CATEGORIES QUERIES (Organization-scoped)
// ============================================================================

interface EventCategoryRow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function dbToEventCategory(row: EventCategoryRow): EventCategory {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description || undefined,
    color: row.color,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Get all event categories (organization-scoped)
 * @param organizationId - Organization ID (required for organization scoping)
 * @param filters - Optional filters for active status
 */
export async function getEventCategories(
  organizationId: string,
  filters?: {
    isActive?: boolean;
  }
): Promise<EventCategory[]> {
  const supabase = await createClient();

  let query = supabase
    .from("event_categories")
    .select("*")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  // Apply filters if provided
  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching event categories:", error);
    throw new Error("Failed to fetch event categories");
  }

  return (data || []).map(dbToEventCategory);
}

/**
 * Create a new event category
 * @param categoryData - Event category data to create
 * @param organizationId - Organization ID
 */
export async function createEventCategory(
  categoryData: Omit<EventCategory, "id" | "organizationId" | "createdAt" | "updatedAt">,
  organizationId: string
): Promise<EventCategory> {
  const supabase = await createClient();

  // Convert camelCase to snake_case for database
  const dbData = {
    organization_id: organizationId,
    name: categoryData.name,
    description: categoryData.description || null,
    color: categoryData.color,
    is_active: categoryData.isActive,
  };

  const { data, error } = await supabase.from("event_categories").insert(dbData).select().single();

  if (error) {
    console.error("Error creating event category:", error);
    throw new Error("Failed to create event category");
  }

  return dbToEventCategory(data);
}

/**
 * Get a single event category by ID (organization-scoped)
 * @param id - Event category ID
 * @param organizationId - Organization ID (required for organization scoping)
 */
export async function getEventCategoryById(
  id: string,
  organizationId: string
): Promise<EventCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_categories")
    .select("*")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    console.error("Error fetching event category:", error);
    throw new Error("Failed to fetch event category");
  }

  return dbToEventCategory(data);
}

/**
 * Archive an event category (sets is_active to false)
 * @param id - Event category ID
 */
export async function archiveEventCategory(id: string): Promise<EventCategory> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_categories")
    .update({
      is_active: false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error archiving event category:", error);
    throw new Error("Failed to archive event category");
  }

  return dbToEventCategory(data);
}

/**
 * Unarchive an event category (sets is_active to true)
 * @param id - Event category ID
 */
export async function unarchiveEventCategory(id: string): Promise<EventCategory> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_categories")
    .update({
      is_active: true,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error unarchiving event category:", error);
    throw new Error("Failed to unarchive event category");
  }

  return dbToEventCategory(data);
}

/**
 * Update an event category
 * @param id - Event category ID
 * @param updates - Partial EventCategory updates
 */
export async function updateEventCategory(
  id: string,
  updates: Partial<Omit<EventCategory, "id" | "organizationId" | "createdAt" | "updatedAt">>
): Promise<EventCategory> {
  const supabase = await createClient();

  // Convert camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {};

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description || null;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from("event_categories")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating event category:", error);
    throw new Error("Failed to update event category");
  }

  return dbToEventCategory(data);
}

// ============================================================================
// PROFILE EVENT TYPES QUERIES (Organization-scoped)
// ============================================================================

/**
 * Get profile by ID
 * @param profileId - Profile ID
 * @param organizationId - Organization ID (required for organization scoping)
 */
export async function getProfileById(profileId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const currentUserProfile = await getCurrentUserProfile(user.id);

  // Get profile with all fields
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .eq("organization_id", currentUserProfile.organizationId)
    .single();

  if (error || !profile) return null;

  return dbToProfile(profile);
}

/**
 * Get profile by ID with event types
 * @param profileId - Profile ID
 * @param organizationId - Organization ID (required for organization scoping)
 */
export async function getProfileWithEventTypes(
  profileId: string,
  organizationId: string
): Promise<any | null> {
  const supabase = await createClient();

  // Get profile with all fields
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id, user_id, role, email, first_name, last_name, description, date_of_birth, phone_number, avatar_image, created_at"
    )
    .eq("id", profileId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !profile) return null;

  // Get assigned event types
  const { data: assignments } = await supabase
    .from("profiles_event_types")
    .select("event_types(id, name, duration, color, event_categories:category_id(name))")
    .eq("profile_id", profileId)
    .eq("organization_id", organizationId);

  const eventTypes = (assignments || []).map((a: any) => ({
    id: a.event_types.id,
    name: a.event_types.name,
    duration: a.event_types.duration,
    color: a.event_types.color,
    categoryName: a.event_types.event_categories?.name,
  }));

  return {
    id: profile.id,
    userId: profile.user_id,
    email: profile.email,
    role: profile.role,
    firstName: profile.first_name,
    lastName: profile.last_name,
    description: profile.description,
    dateOfBirth: profile.date_of_birth,
    phoneNumber: profile.phone_number,
    avatarImage: profile.avatar_image,
    createdAt: profile.created_at,
    eventTypes,
  };
}

/**
 * Assign event type to profile
 * @param profileId - Profile ID
 * @param eventTypeId - Event type ID
 * @param organizationId - Organization ID (required for organization scoping)
 */
export async function assignEventTypeToProfile(
  profileId: string,
  eventTypeId: string,
  organizationId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles_event_types").insert({
    profile_id: profileId,
    event_type_id: eventTypeId,
    organization_id: organizationId,
  });

  if (error) {
    throw new Error(
      error.code === "23505" ? "Assignment already exists" : "Failed to assign event type"
    );
  }
}

/**
 * Remove event type from profile
 * @param profileId - Profile ID
 * @param eventTypeId - Event type ID
 */
export async function removeEventTypeFromProfile(
  profileId: string,
  eventTypeId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles_event_types")
    .delete()
    .eq("profile_id", profileId)
    .eq("event_type_id", eventTypeId);

  if (error) {
    throw new Error("Failed to remove event type");
  }
}

// ============================================================================
// STAFF AVAILABILITY
// ============================================================================

export interface StaffAvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

/**
 * Get staff availability for a profile (scoped to organization)
 */
export async function getStaffAvailability(
  profileId: string,
  organizationId: string
): Promise<StaffAvailabilitySlot[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff_availability")
    .select("id, day_of_week, start_time, end_time")
    .eq("profile_id", profileId)
    .eq("organization_id", organizationId)
    .eq("is_available", true)
    .order("day_of_week")
    .order("start_time");

  if (error) {
    throw new Error("Failed to fetch staff availability");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    dayOfWeek: row.day_of_week as number,
    startTime: String(row.start_time).slice(0, 5),
    endTime: String(row.end_time).slice(0, 5),
  }));
}

/**
 * Replace all staff availability for a profile
 */
export async function upsertStaffAvailability(
  profileId: string,
  organizationId: string,
  slots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>
): Promise<void> {
  const supabase = await createClient();

  // Delete existing
  const { error: deleteError } = await supabase
    .from("staff_availability")
    .delete()
    .eq("profile_id", profileId)
    .eq("organization_id", organizationId);

  if (deleteError) {
    throw new Error("Failed to update staff availability");
  }

  if (slots.length === 0) return;

  // Insert new slots
  const rows = slots.map((slot) => ({
    profile_id: profileId,
    organization_id: organizationId,
    day_of_week: slot.dayOfWeek,
    start_time: slot.startTime,
    end_time: slot.endTime,
    is_available: true,
  }));

  const { error: insertError } = await supabase.from("staff_availability").insert(rows);

  if (insertError) {
    throw new Error("Failed to save staff availability");
  }
}

export interface StaffProfileWithEventTypes {
  id: string;
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  avatarImage?: string;
  createdAt: string;
  eventTypes: { id: string; name: string; color: string }[];
}

export async function getStaffProfiles(
  organizationId: string,
  options: { search?: string; includeEventTypes?: boolean } = {}
): Promise<StaffProfileWithEventTypes[]> {
  const supabase = await createClient();
  const { search, includeEventTypes = false } = options;

  let query = supabase
    .from("profiles")
    .select(
      "id, user_id, role, email, first_name, last_name, description, date_of_birth, phone_number, avatar_image, created_at"
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("email", `%${search}%`);
  }

  const { data: profiles, error } = await query;

  if (error) {
    throw new Error("Failed to fetch staff profiles");
  }

  let staff: StaffProfileWithEventTypes[] = (profiles || []).map((p: any) => ({
    id: p.id,
    userId: p.user_id,
    email: p.email,
    role: p.role,
    firstName: p.first_name,
    lastName: p.last_name,
    description: p.description,
    dateOfBirth: p.date_of_birth,
    phoneNumber: p.phone_number,
    avatarImage: p.avatar_image,
    createdAt: p.created_at,
    eventTypes: [],
  }));

  if (includeEventTypes && staff.length > 0) {
    const { data: assignments } = await supabase
      .from("profiles_event_types")
      .select("profile_id, event_types(id, name, color)")
      .eq("organization_id", organizationId)
      .in(
        "profile_id",
        staff.map((s) => s.id)
      );

    if (assignments) {
      const eventTypesByProfile = new Map<string, { id: string; name: string; color: string }[]>();
      assignments.forEach((a: any) => {
        if (!eventTypesByProfile.has(a.profile_id)) {
          eventTypesByProfile.set(a.profile_id, []);
        }
        if (a.event_types) {
          eventTypesByProfile.get(a.profile_id)!.push(a.event_types);
        }
      });
      staff = staff.map((member) => ({
        ...member,
        eventTypes: eventTypesByProfile.get(member.id) || [],
      }));
    }
  }

  return staff;
}
