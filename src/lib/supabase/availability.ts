/**
 * Availability queries for visit booking: available dates and time slots
 * based on staff_availability, profiles_event_types, and existing visits.
 */

import { createClient } from "@/lib/supabase/server";

import { getCurrentUserProfile } from "./queries";

/** Parse "HH:MM" or "HH:MM:SS" to minutes since midnight */
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Format minutes since midnight to "HH:MM" */
function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Get list of dates (ISO YYYY-MM-DD) that have at least one available slot */
export async function getAvailableDates(
  eventTypeId: string,
  startDate: string,
  endDate: string
): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const profile = await getCurrentUserProfile(user.id);

  // Event type duration
  const { data: eventType, error: etError } = await supabase
    .from("event_types")
    .select("duration")
    .eq("id", eventTypeId)
    .eq("organization_id", profile.organizationId)
    .single();
  if (etError || !eventType) return [];

  const durationMins = eventType.duration as number;

  // Qualified staff (profiles who can do this service)
  const { data: assignments } = await supabase
    .from("profiles_event_types")
    .select("profile_id")
    .eq("event_type_id", eventTypeId)
    .eq("organization_id", profile.organizationId);
  const qualifiedProfileIds = (assignments ?? []).map((a: { profile_id: string }) => a.profile_id);
  if (qualifiedProfileIds.length === 0) return [];

  // Staff availability: profile_id, day_of_week (0-6), start_time, end_time
  const { data: availabilityRows } = await supabase
    .from("staff_availability")
    .select("profile_id, day_of_week, start_time, end_time")
    .in("profile_id", qualifiedProfileIds)
    .eq("organization_id", profile.organizationId)
    .eq("is_available", true);

  // Group by profile then day: Map<profileId, Map<dayOfWeek, { start, end }[]>>
  const availabilityByProfile = new Map<
    string,
    Map<number, Array<{ start: number; end: number }>>
  >();
  for (const row of availabilityRows ?? []) {
    const pid = row.profile_id;
    const day = row.day_of_week as number;
    const start = timeToMinutes(String(row.start_time).slice(0, 5));
    const end = timeToMinutes(String(row.end_time).slice(0, 5));
    if (!availabilityByProfile.has(pid)) {
      availabilityByProfile.set(pid, new Map());
    }
    const byDay = availabilityByProfile.get(pid)!;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push({ start, end });
  }

  // Existing visits in range: staff_id, date, time, event_type_duration
  const { data: visits } = await supabase
    .from("visits")
    .select("staff_id, date, time, event_type_duration")
    .eq("organization_id", profile.organizationId)
    .neq("status", "cancelled")
    .gte("date", startDate)
    .lte("date", endDate);

  const busySlotsByDateAndStaff = new Map<string, Array<{ start: number; end: number }>>();
  for (const v of visits ?? []) {
    if (!v.staff_id) continue;
    const key = `${v.date}-${v.staff_id}`;
    const start = timeToMinutes(String(v.time).slice(0, 5));
    const dur = Number(v.event_type_duration) || 60;
    const end = start + dur;
    if (!busySlotsByDateAndStaff.has(key)) busySlotsByDateAndStaff.set(key, []);
    busySlotsByDateAndStaff.get(key)!.push({ start, end });
  }

  const results: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();

    let hasSlot = false;
    for (const profileId of qualifiedProfileIds) {
      const byDay = availabilityByProfile.get(profileId)?.get(dayOfWeek);
      if (!byDay?.length) continue;
      const busy = busySlotsByDateAndStaff.get(`${dateStr}-${profileId}`) ?? [];

      for (const window of byDay) {
        for (
          let slotStart = window.start;
          slotStart + durationMins <= window.end;
          slotStart += durationMins
        ) {
          const slotEnd = slotStart + durationMins;
          const overlaps = busy.some((b) => slotStart < b.end && slotEnd > b.start);
          if (!overlaps) {
            hasSlot = true;
            break;
          }
        }
        if (hasSlot) break;
      }
      if (hasSlot) break;
    }
    if (hasSlot) results.push(dateStr);
  }
  return results;
}

export interface SlotStaff {
  id: string;
  displayName: string;
  profileUrl?: string;
  avatarUrl?: string;
  hasServedClient: boolean;
}

export interface TimeSlot {
  time: string;
  staff: SlotStaff[];
}

/** Get available time slots for a date with staff and "previously served" info */
export async function getAvailableSlots(
  eventTypeId: string,
  date: string,
  memberId?: string
): Promise<TimeSlot[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const profile = await getCurrentUserProfile(user.id);

  const { data: eventType, error: etError } = await supabase
    .from("event_types")
    .select("duration")
    .eq("id", eventTypeId)
    .eq("organization_id", profile.organizationId)
    .single();
  if (etError || !eventType) return [];

  const durationMins = eventType.duration as number;
  const dayOfWeek = new Date(date + "T12:00:00").getDay();

  const { data: assignments } = await supabase
    .from("profiles_event_types")
    .select("profile_id")
    .eq("event_type_id", eventTypeId)
    .eq("organization_id", profile.organizationId);
  const qualifiedProfileIds = (assignments ?? []).map((a: { profile_id: string }) => a.profile_id);
  if (qualifiedProfileIds.length === 0) return [];

  const { data: availabilityRows } = await supabase
    .from("staff_availability")
    .select("profile_id, start_time, end_time")
    .in("profile_id", qualifiedProfileIds)
    .eq("organization_id", profile.organizationId)
    .eq("is_available", true)
    .eq("day_of_week", dayOfWeek);

  const windowsByProfile = new Map<string, Array<{ start: number; end: number }>>();
  for (const row of availabilityRows ?? []) {
    const pid = row.profile_id;
    const start = timeToMinutes(String(row.start_time).slice(0, 5));
    const end = timeToMinutes(String(row.end_time).slice(0, 5));
    if (!windowsByProfile.has(pid)) windowsByProfile.set(pid, []);
    windowsByProfile.get(pid)!.push({ start, end });
  }

  const { data: visits } = await supabase
    .from("visits")
    .select("staff_id, time, event_type_duration")
    .eq("organization_id", profile.organizationId)
    .eq("date", date)
    .neq("status", "cancelled");

  const busyByStaff = new Map<string, Array<{ start: number; end: number }>>();
  for (const v of visits ?? []) {
    if (!v.staff_id) continue;
    const start = timeToMinutes(String(v.time).slice(0, 5));
    const dur = Number(v.event_type_duration) || 60;
    if (!busyByStaff.has(v.staff_id)) busyByStaff.set(v.staff_id, []);
    busyByStaff.get(v.staff_id)!.push({ start, end: start + dur });
  }

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_image")
    .in("id", qualifiedProfileIds);

  const profileNames = new Map<string, string>();
  const profileAvatars = new Map<string, string>();
  for (const p of profilesData ?? []) {
    const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.id.slice(0, 8);
    profileNames.set(p.id, name);
    if (p.avatar_image) profileAvatars.set(p.id, p.avatar_image as string);
  }

  let hasServedByStaff: Set<string> = new Set();
  if (memberId) {
    const { data: pastVisits } = await supabase
      .from("visits")
      .select("staff_id")
      .eq("member_id", memberId)
      .not("staff_id", "is", null);
    hasServedByStaff = new Set((pastVisits ?? []).map((v: { staff_id: string }) => v.staff_id));
  }

  const slotToStaff = new Map<number, SlotStaff[]>();
  for (const profileId of qualifiedProfileIds) {
    const windows = windowsByProfile.get(profileId) ?? [];
    const busy = busyByStaff.get(profileId) ?? [];
    const staffInfo: SlotStaff = {
      id: profileId,
      displayName: profileNames.get(profileId) ?? "Staff",
      profileUrl: `/team/${profileId}`,
      avatarUrl: profileAvatars.get(profileId),
      hasServedClient: hasServedByStaff.has(profileId),
    };
    for (const window of windows) {
      for (
        let slotStart = window.start;
        slotStart + durationMins <= window.end;
        slotStart += durationMins
      ) {
        const slotEnd = slotStart + durationMins;
        const overlaps = busy.some((b) => slotStart < b.end && slotEnd > b.start);
        if (!overlaps) {
          if (!slotToStaff.has(slotStart)) slotToStaff.set(slotStart, []);
          const list = slotToStaff.get(slotStart)!;
          if (!list.some((s) => s.id === staffInfo.id)) list.push(staffInfo);
        }
      }
    }
  }

  const slots: TimeSlot[] = [];
  const sortedStarts = Array.from(slotToStaff.keys()).sort((a, b) => a - b);
  for (const start of sortedStarts) {
    slots.push({
      time: minutesToTime(start),
      staff: slotToStaff.get(start)!,
    });
  }
  return slots;
}

const DEFAULT_SLOT_DURATION_MINS = 60;

/** Get dates (ISO YYYY-MM-DD) when a specific staff has at least one available slot */
export async function getAvailableDatesForStaff(
  profileId: string,
  startDate: string,
  endDate: string,
  durationMins: number = DEFAULT_SLOT_DURATION_MINS
): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const profile = await getCurrentUserProfile(user.id);

  const { data: availabilityRows } = await supabase
    .from("staff_availability")
    .select("day_of_week, start_time, end_time")
    .eq("profile_id", profileId)
    .eq("organization_id", profile.organizationId)
    .eq("is_available", true);

  const byDay = new Map<number, Array<{ start: number; end: number }>>();
  for (const row of availabilityRows ?? []) {
    const day = row.day_of_week as number;
    const start = timeToMinutes(String(row.start_time).slice(0, 5));
    const end = timeToMinutes(String(row.end_time).slice(0, 5));
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push({ start, end });
  }

  if (byDay.size === 0) return [];

  const { data: visits } = await supabase
    .from("visits")
    .select("date, time, event_type_duration")
    .eq("organization_id", profile.organizationId)
    .eq("staff_id", profileId)
    .neq("status", "cancelled")
    .gte("date", startDate)
    .lte("date", endDate);

  const busyByDate = new Map<string, Array<{ start: number; end: number }>>();
  for (const v of visits ?? []) {
    const start = timeToMinutes(String(v.time).slice(0, 5));
    const dur = Number(v.event_type_duration) || 60;
    if (!busyByDate.has(v.date)) busyByDate.set(v.date, []);
    busyByDate.get(v.date)!.push({ start, end: start + dur });
  }

  const results: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const windows = byDay.get(dayOfWeek) ?? [];
    if (windows.length === 0) continue;
    const busy = busyByDate.get(dateStr) ?? [];
    let hasSlot = false;
    for (const window of windows) {
      for (
        let slotStart = window.start;
        slotStart + durationMins <= window.end;
        slotStart += durationMins
      ) {
        const slotEnd = slotStart + durationMins;
        const overlaps = busy.some((b) => slotStart < b.end && slotEnd > b.start);
        if (!overlaps) {
          hasSlot = true;
          break;
        }
      }
      if (hasSlot) break;
    }
    if (hasSlot) results.push(dateStr);
  }
  return results;
}

/** Get available time slots (HH:MM) for a specific staff on a date */
export async function getAvailableSlotsForStaff(
  profileId: string,
  date: string,
  durationMins: number = DEFAULT_SLOT_DURATION_MINS
): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const profile = await getCurrentUserProfile(user.id);
  const dayOfWeek = new Date(date + "T12:00:00").getDay();

  const { data: availabilityRows } = await supabase
    .from("staff_availability")
    .select("start_time, end_time")
    .eq("profile_id", profileId)
    .eq("organization_id", profile.organizationId)
    .eq("is_available", true)
    .eq("day_of_week", dayOfWeek);

  const windows: Array<{ start: number; end: number }> = (availabilityRows ?? []).map((row) => ({
    start: timeToMinutes(String(row.start_time).slice(0, 5)),
    end: timeToMinutes(String(row.end_time).slice(0, 5)),
  }));

  const { data: visits } = await supabase
    .from("visits")
    .select("time, event_type_duration")
    .eq("organization_id", profile.organizationId)
    .eq("staff_id", profileId)
    .eq("date", date)
    .neq("status", "cancelled");

  const busy: Array<{ start: number; end: number }> = (visits ?? []).map((v) => {
    const start = timeToMinutes(String(v.time).slice(0, 5));
    const dur = Number(v.event_type_duration) || 60;
    return { start, end: start + dur };
  });

  const slotStarts: number[] = [];
  for (const window of windows) {
    for (
      let slotStart = window.start;
      slotStart + durationMins <= window.end;
      slotStart += durationMins
    ) {
      const slotEnd = slotStart + durationMins;
      const overlaps = busy.some((b) => slotStart < b.end && slotEnd > b.start);
      if (!overlaps) slotStarts.push(slotStart);
    }
  }
  slotStarts.sort((a, b) => a - b);
  return slotStarts.map((m) => minutesToTime(m));
}
