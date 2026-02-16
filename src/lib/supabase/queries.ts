import { EventCategory } from "@/types/event-category";
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
import { createAdminClient } from "./admin";

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
  event_type_id: string;
  event_type_name: string;
  event_type_duration: number;
  event_type_price: number;
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

  // Fetch event type to create snapshot
  const { data: eventTypeData, error: eventTypeError } = await supabase
    .from("event_types")
    .select("name, duration, price, category_id")
    .eq("id", formData.eventTypeId)
    .eq("organization_id", profile.organizationId)
    .single();

  if (eventTypeError || !eventTypeData) {
    console.error("Error fetching event type:", eventTypeError);
    throw new Error("Event type not found");
  }

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
  category_id: string | null;
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
    categoryId: row.category_id || undefined,
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
    currency: eventTypeData.currency,
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
