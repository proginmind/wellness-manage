import { NextResponse } from "next/server";
import currencies from "@/data/currencies.json";

import { createOrganizationWithOwner } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

const VALID_CURRENCY_CODES = new Set(currencies.map((c) => c.code));

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent creating a second org if the user already has a profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const currency = typeof body?.currency === "string" ? body.currency.trim().toUpperCase() : "";

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }
    if (!currency || !VALID_CURRENCY_CODES.has(currency)) {
      return NextResponse.json({ error: "A valid currency is required" }, { status: 400 });
    }

    const result = await createOrganizationWithOwner(user.id, user.email!, name, currency);

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("POST /api/organization/setup error:", err);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
