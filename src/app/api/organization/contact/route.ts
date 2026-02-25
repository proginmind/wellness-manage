import { NextResponse } from "next/server";

import { requireOwner, requirePermission } from "@/lib/api-permissions";
import { getOrganizationContact, upsertOrganizationContact } from "@/lib/supabase/queries";
import { organizationContactSchema } from "@/lib/validations/organization";

export async function GET() {
  try {
    const result = await requirePermission("organization", "view");
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    const contact = await getOrganizationContact(organizationId);

    return NextResponse.json({ contact });
  } catch (err) {
    console.error("GET /api/organization/contact error:", err);
    return NextResponse.json({ error: "Failed to fetch organization contact" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const result = await requireOwner();
    if (result instanceof NextResponse) return result;

    const { organizationId } = result;

    const body = await request.json().catch(() => ({}));

    const parsed = organizationContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { phone, email, address, socialLinks } = parsed.data;

    const contact = await upsertOrganizationContact(organizationId, {
      phone,
      email,
      address: address as Record<string, unknown> | undefined,
      socialLinks: socialLinks as Record<string, unknown> | undefined,
    });

    return NextResponse.json({ contact });
  } catch (err) {
    console.error("PUT /api/organization/contact error:", err);
    return NextResponse.json({ error: "Failed to save organization contact" }, { status: 500 });
  }
}
