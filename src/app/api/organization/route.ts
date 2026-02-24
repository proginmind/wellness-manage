import { NextResponse } from "next/server";
import currencies from "@/data/currencies.json";

import { requireOwner } from "@/lib/api-permissions";
import { updateOrganizationCurrency } from "@/lib/supabase/queries";

const VALID_CURRENCY_CODES = new Set(currencies.map((c) => c.code));

export async function PUT(request: Request) {
  try {
    const result = await requireOwner();
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    const body = await request.json().catch(() => ({}));
    const currency = typeof body?.currency === "string" ? body.currency.toUpperCase() : "";

    if (!currency) {
      return NextResponse.json({ error: "currency is required" }, { status: 400 });
    }

    if (!VALID_CURRENCY_CODES.has(currency)) {
      return NextResponse.json(
        { error: `Unsupported currency code: ${currency}` },
        { status: 422 }
      );
    }

    await updateOrganizationCurrency(organizationId, currency);

    return NextResponse.json({ ok: true, currency });
  } catch (err) {
    console.error("PUT /api/organization error:", err);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}
