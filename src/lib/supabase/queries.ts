import { createClient } from "@/lib/supabase/server";
import { Member, MemberStatus } from "@/types/member";
import { MemberFormValues } from "@/lib/validations/member";

/**
 * Database row type (snake_case from PostgreSQL)
 */
interface MemberRow {
  id: string;
  user_id: string;
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

/**
 * Convert database row (snake_case) to Member type (camelCase)
 */
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

/**
 * Convert Member type (camelCase) to database format (snake_case)
 */
export function memberToDb(
  member: Partial<Member>
): Partial<Omit<MemberRow, "id" | "user_id" | "created_at" | "updated_at">> {
  const db: Partial<
    Omit<MemberRow, "id" | "user_id" | "created_at" | "updated_at">
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

/**
 * Get all members with optional search filter
 */
export async function getMembers(search?: string): Promise<Member[]> {
  const supabase = await createClient();

  let query = supabase
    .from("members")
    .select("*")
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
 * Get a single member by ID
 */
export async function getMemberById(id: string): Promise<Member | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
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
 * Create a new member
 */
export async function createMember(
  formData: MemberFormValues,
  userId: string
): Promise<Member> {
  const supabase = await createClient();

  const dbData = {
    user_id: userId,
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
 * Get member statistics for dashboard
 */
export async function getMemberStats() {
  const supabase = await createClient();

  // Get all members count
  const { count: total, error: totalError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error("Error fetching total count:", totalError);
    throw new Error("Failed to fetch stats");
  }

  // Get active members count
  const { count: active, error: activeError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  if (activeError) {
    console.error("Error fetching active count:", activeError);
    throw new Error("Failed to fetch stats");
  }

  // Get archived members count
  const { count: archived, error: archivedError } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true })
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
