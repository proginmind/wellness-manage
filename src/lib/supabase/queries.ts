import { createClient } from "@/lib/supabase/server";
import { Member, MemberStatus } from "@/types/member";
import { MemberFormValues } from "@/lib/validations/member";
import {
  Organization,
  Profile,
  UserRole,
  Invitation,
  InvitationStatus,
} from "@/types";
import { Visit, VisitStatus } from "@/types/visit";
import { VisitFormValues } from "../validations/visit";

// ============================================================================
// DATABASE ROW TYPES (snake_case from PostgreSQL)
// ============================================================================

interface OrganizationRow {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  user_id: string;
  organization_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface InvitationRow {
  id: string;
  organization_id: string;
  email: string;
  invited_by: string;
  status: InvitationStatus;
  token: string;
  expires_at: string;
  created_at: string;
}

interface MemberRow {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
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
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function dbToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    organizationId: row.organization_id,
    role: row.role,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function dbToInvitation(row: InvitationRow): Invitation {
  return {
    id: row.id,
    organizationId: row.organization_id,
    email: row.email,
    invitedBy: row.invited_by,
    status: row.status,
    token: row.token,
    expiresAt: new Date(row.expires_at),
    createdAt: new Date(row.created_at),
  };
}

export function dbToMember(row: MemberRow): Member {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    image: row.image || undefined,
    dateOfBirth: new Date(row.date_of_birth),
    dateJoined: new Date(row.date_joined),
    status: row.status,
    archivedAt: row.archived_at ? new Date(row.archived_at) : undefined,
  };
}

export function memberToDb(
  member: Partial<Member>
): Partial<
  Omit<MemberRow, "id" | "user_id" | "organization_id" | "created_at" | "updated_at">
> {
  const db: Partial<
    Omit<MemberRow, "id" | "user_id" | "organization_id" | "created_at" | "updated_at">
  > = {};

  if (member.firstName !== undefined) db.first_name = member.firstName;
  if (member.lastName !== undefined) db.last_name = member.lastName;
  if (member.email !== undefined) db.email = member.email;
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
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return dbToProfile(data);
}

/**
 * Get organization by ID
 */
export async function getOrganizationById(
  id: string
): Promise<Organization | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching organization:", error);
    return null;
  }

  return dbToOrganization(data);
}

/**
 * Check if current user is an owner
 */
export async function isCurrentUserOwner(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === "owner";
}

// ============================================================================
// MEMBER QUERIES (Organization-scoped)
// ============================================================================

/**
 * Get all members with optional search filter (organization-scoped)
 */
export async function getMembers(search?: string): Promise<Member[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

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
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

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
export async function createMember(
  formData: MemberFormValues,
  userId: string
): Promise<Member> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  const dbData = {
    user_id: userId,
    organization_id: profile.organizationId,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    image: formData.image || null,
    date_of_birth: formData.dateOfBirth,
    date_joined: formData.dateJoined,
    status: "active" as MemberStatus,
  };

  const { data, error } = await supabase
    .from("members")
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error("Error creating member:", error);
    throw new Error(
      error.code === "23505" ? "Email already exists" : "Failed to create member"
    );
  }

  return dbToMember(data);
}

/**
 * Update a member
 */
export async function updateMember(
  id: string,
  updates: Partial<Member>
): Promise<Member> {
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
    throw new Error(
      error.code === "23505" ? "Email already exists" : "Failed to update member"
    );
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
 * Get member statistics for dashboard (organization-scoped)
 */
export async function getMemberStats() {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  // Get all members count
  const { count: total, error: totalError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organizationId);

  if (totalError) {
    console.error("Error fetching total count:", totalError);
    throw new Error("Failed to fetch stats");
  }

  // Get active members count
  const { count: active, error: activeError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organizationId)
    .eq("status", "active");

  if (activeError) {
    console.error("Error fetching active count:", activeError);
    throw new Error("Failed to fetch stats");
  }

  // Get archived members count
  const { count: archived, error: archivedError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", profile.organizationId)
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
    .eq("organization_id", profile.organizationId)
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

// ============================================================================
// INVITATION QUERIES
// ============================================================================

/**
 * Get all invitations for current user's organization
 */
export async function getInvitations(): Promise<Invitation[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("organization_id", profile.organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invitations:", error);
    throw new Error("Failed to fetch invitations");
  }

  return (data || []).map(dbToInvitation);
}

/**
 * Create a new invitation (owner only, enforced by RLS)
 */
export async function createInvitation(email: string): Promise<Invitation> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  if (profile.role !== "owner") {
    throw new Error("Only owners can send invitations");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const dbData = {
    organization_id: profile.organizationId,
    email: email.toLowerCase().trim(),
    invited_by: user.id,
  };

  const { data, error } = await supabase
    .from("invitations")
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error("Error creating invitation:", error);
    throw new Error(
      error.code === "23505"
        ? "Invitation already exists for this email"
        : "Failed to create invitation"
    );
  }

  return dbToInvitation(data);
}

/**
 * Get invitation by token (public access)
 */
export async function getInvitationByToken(
  token: string
): Promise<Invitation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("Error fetching invitation:", error);
    throw new Error("Failed to fetch invitation");
  }

  // Check if expired
  const invitation = dbToInvitation(data);
  if (invitation.expiresAt < new Date()) {
    return null;
  }

  return invitation;
}

/**
 * Accept invitation (marks as accepted, trigger creates profile)
 */
export async function acceptInvitation(token: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("invitations")
    .update({ status: "accepted" as InvitationStatus })
    .eq("token", token)
    .eq("status", "pending");

  if (error) {
    console.error("Error accepting invitation:", error);
    throw new Error("Failed to accept invitation");
  }
}

// ============================================================================
// VISITS QUERIES (Organization-scoped)
// ============================================================================

interface VisitRow {
  id: string;
  organization_id: string;
  member_id: string;
  visit_date: string;
  visit_time: string;
  visit_duration: number;
  visit_type: string;
  visit_status: VisitStatus;
  visit_notes: string | null;
  staff_id: string;
  created_at: string;
  updated_at: string;
}

export function dbToVisit(row: VisitRow): Visit {
  return {
    id: row.id,
    organizationId: row.organization_id,
    memberId: row.member_id,
    visitDate: new Date(row.visit_date),
    visitTime: new Date(row.visit_time),
    visitDuration: row.visit_duration,
    visitType: row.visit_type,
    visitStatus: row.visit_status,
    visitNotes: row.visit_notes || undefined,
    staffId: row.staff_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Get all visits with optional search filter (organization-scoped)
 */
export async function getVisits(search?: string): Promise<{ visit: Visit, member: Member }[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  const query = supabase
    .from("visits")
    .select("*, member:members(id, first_name, last_name, email, image, date_of_birth, date_joined)")
    .eq("organization_id", profile.organizationId)
    .order("visit_date", { ascending: false });

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
 * Create a new visit
 */
export async function createVisit(
  formData: VisitFormValues,
  userId: string,
): Promise<Visit> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  if (!profile) {
    throw new Error("User profile not found");
  }

  const dbData = {
    organization_id: profile.organizationId,
    member_id: formData.memberId,
    visit_date: formData.visitDate,
    visit_time: formData.visitTime,
    visit_duration: formData.visitDuration,
    visit_type: formData.visitType,
    visit_status: 'pending' as VisitStatus,
    visit_notes: formData.visitNotes,
    staff_id: userId,
  };

  const { data, error } = await supabase
    .from("visits")
    .insert(dbData)
    .select()
    .single();

  if (error) {
    console.error("Error creating visit:", error);
    throw new Error(
      error.code === "23505" ? "Visit already exists" : "Failed to create visit"
    );
  }

  return dbToVisit(data);
}