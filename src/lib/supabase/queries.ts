import { EventType } from "@/types/event-type";
import { Invitation, InvitationStatus } from "@/types/invitation";
import { Member, MemberStatus } from "@/types/member";
import { Organization } from "@/types/organization";
import { Profile } from "@/types/profile";
import { Visit, VisitStatus } from "@/types/visit";
import { UserRole } from "@/lib/permissions";
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
): Partial<Omit<MemberRow, "id" | "user_id" | "organization_id" | "created_at" | "updated_at">> {
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
/**
 * Get current user's profile
 * @param userId - User ID to fetch profile for (required to avoid redundant auth calls)
 * @throws Error if profile not found
 */
export async function getCurrentUserProfile(userId: string): Promise<Profile> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user profile:", error);
    throw new Error("User profile not found");
  }

  return dbToProfile(data);
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
export async function createMember(formData: MemberFormValues, userId: string): Promise<Member> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

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
 * Get member statistics for dashboard (organization-scoped)
 */
export async function getMemberStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const profile = await getCurrentUserProfile(user.id);

  if (profile.role !== "owner") {
    throw new Error("Only owners can send invitations");
  }

  const dbData = {
    organization_id: profile.organizationId,
    email: email.toLowerCase().trim(),
    invited_by: user.id,
  };

  const { data, error } = await supabase.from("invitations").insert(dbData).select().single();

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
export async function getInvitationByToken(token: string): Promise<Invitation | null> {
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
  date: string;
  time: string;
  duration: number;
  type: string;
  status: VisitStatus;
  notes: string | null;
  staff_id: string;
  created_at: string;
  updated_at: string;
}

export function dbToVisit(row: VisitRow): Visit {
  return {
    id: row.id,
    organizationId: row.organization_id,
    memberId: row.member_id,
    date: new Date(row.date),
    time: new Date(row.time),
    duration: row.duration,
    type: row.type,
    status: row.status,
    notes: row.notes || undefined,
    staffId: row.staff_id,
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

  const dbData = {
    organization_id: profile.organizationId,
    member_id: formData.memberId,
    date: formData.date,
    time: formData.time,
    duration: formData.duration,
    type: formData.type,
    status: "pending" as VisitStatus,
    notes: formData.notes,
    staff_id: userId,
  };

  const { data, error } = await supabase.from("visits").insert(dbData).select().single();

  if (error) {
    console.error("Error creating visit:", error);
    throw new Error(error.code === "23505" ? "Visit already exists" : "Failed to create visit");
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
  category: string | null;
  duration: number;
  buffer_before: number;
  buffer_after: number;
  price: number;
  currency: string;
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
    category: row.category || undefined,
    duration: row.duration,
    bufferBefore: row.buffer_before,
    bufferAfter: row.buffer_after,
    price: Number(row.price),
    currency: row.currency,
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
    .select("*")
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

  return (data || []).map(dbToEventType);
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
    .select("*")
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

  return dbToEventType(data);
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
  if (updates.category !== undefined) dbUpdates.category = updates.category || null;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.bufferBefore !== undefined) dbUpdates.buffer_before = updates.bufferBefore;
  if (updates.bufferAfter !== undefined) dbUpdates.buffer_after = updates.bufferAfter;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
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
