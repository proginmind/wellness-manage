import { NextResponse } from "next/server";
import currencies from "@/data/currencies.json";

import { requireOwner } from "@/lib/api-permissions";
import { updateOrganization } from "@/lib/supabase/queries";

const VALID_CURRENCY_CODES = new Set(currencies.map((c) => c.code));

export async function PUT(request: Request) {
  try {
    const result = await requireOwner();
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    const body = await request.json().catch(() => ({}));

    const updates: { name?: string; currency?: string } = {};

    if (typeof body?.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
      }
      updates.name = name;
    }

    if (typeof body?.currency === "string") {
      const currency = body.currency.toUpperCase();
      if (!VALID_CURRENCY_CODES.has(currency)) {
        return NextResponse.json(
          { error: `Unsupported currency code: ${currency}` },
          { status: 422 }
        );
      }
      updates.currency = currency;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await updateOrganization(organizationId, updates);

    return NextResponse.json({ ok: true, ...updates });
  } catch (err) {
    console.error("PUT /api/organization error:", err);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}
