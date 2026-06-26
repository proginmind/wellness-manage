/**
 * Smoke test for dual-mode visit booking against local Supabase.
 * Run: pnpm exec tsx scripts/test-visit-booking.ts
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

import {
  getVisitCreateSchema,
  visitCreateRequestSchema,
  visitManualFormSchema,
} from "../src/lib/validations/visit";

function loadEnv(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    throw new Error(".env.local not found — run against local Supabase with env configured");
  }
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  loadEnv();

  // Schema tests
  const manualPast = visitManualFormSchema.safeParse({
    memberId: "00000000-0000-4000-8000-000000000001",
    eventTypeId: "00000000-0000-4000-8000-000000000002",
    staffId: "00000000-0000-4000-8000-000000000003",
    date: "2020-01-01",
    time: "14:30",
  });
  if (manualPast.success) throw new Error("Manual schema should reject past datetimes");

  const manualTodayPastTime = visitManualFormSchema.safeParse({
    memberId: "00000000-0000-4000-8000-000000000001",
    eventTypeId: "00000000-0000-4000-8000-000000000002",
    staffId: "00000000-0000-4000-8000-000000000003",
    date: new Date().toISOString().slice(0, 10),
    time: "00:01",
  });
  if (manualTodayPastTime.success) {
    throw new Error("Manual schema should reject past time on today");
  }

  const manualOk = visitManualFormSchema.safeParse({
    memberId: "00000000-0000-4000-8000-000000000001",
    eventTypeId: "00000000-0000-4000-8000-000000000002",
    staffId: "00000000-0000-4000-8000-000000000003",
    date: "2099-06-15",
    time: "14:30",
  });
  if (!manualOk.success) throw new Error("Manual schema should allow future datetimes");

  const manualMissingStaff = visitManualFormSchema.safeParse({
    memberId: "00000000-0000-4000-8000-000000000001",
    eventTypeId: "00000000-0000-4000-8000-000000000002",
    date: "2026-12-01",
    time: "10:00",
  });
  if (manualMissingStaff.success) throw new Error("Manual schema should require staffId");

  const guidedPast = getVisitCreateSchema("guided").safeParse({
    memberId: "00000000-0000-4000-8000-000000000001",
    eventTypeId: "00000000-0000-4000-8000-000000000002",
    date: "2020-01-01",
    time: "10:00",
  });
  if (guidedPast.success) throw new Error("Guided schema should reject past dates");

  const createReq = visitCreateRequestSchema.safeParse({
    bookingMode: "manual",
    memberId: "00000000-0000-4000-8000-000000000001",
    eventTypeId: "00000000-0000-4000-8000-000000000002",
    staffId: "00000000-0000-4000-8000-000000000003",
    date: "2099-06-15",
    time: "08:15",
  });
  if (!createReq.success) throw new Error("Create request schema failed");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: org } = await supabase.from("organizations").select("id").limit(1).single();
  if (!org) throw new Error("No organization found — run pnpm db:seed");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("organization_id", org.id)
    .limit(1)
    .single();
  const { data: eventType } = await supabase
    .from("event_types")
    .select("id, name, duration, price")
    .eq("organization_id", org.id)
    .eq("is_active", true)
    .limit(1)
    .single();
  const { data: staff } = await supabase
    .from("profiles")
    .select("id")
    .eq("organization_id", org.id)
    .eq("role", "staff")
    .limit(1)
    .single();

  if (!member || !eventType || !staff) {
    throw new Error("Missing seed data (member, event type, or staff)");
  }

  const testDate = "2099-03-15";
  const testTime = "23:45:00";

  const baseVisit = {
    organization_id: org.id,
    member_id: member.id,
    event_type_id: eventType.id,
    event_type_name: eventType.name,
    event_type_duration: eventType.duration,
    event_type_price: eventType.price,
    event_type_currency: "USD",
    staff_id: staff.id,
    date: testDate,
    time: testTime,
    status: "pending",
  };

  const { data: visit1, error: err1 } = await supabase
    .from("visits")
    .insert(baseVisit)
    .select("id")
    .single();
  if (err1) throw new Error(`Failed to insert manual-time visit: ${err1.message}`);

  const { error: overlapErr } = await supabase.from("visits").insert(baseVisit);
  if (!overlapErr?.message.includes("already has a visit scheduled")) {
    await supabase.from("visits").delete().eq("id", visit1.id);
    throw new Error(`Expected overlap error, got: ${overlapErr?.message ?? "none"}`);
  }

  await supabase.from("visits").delete().eq("id", visit1.id);

  console.log("All visit booking tests passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
