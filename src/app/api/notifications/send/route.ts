import { NextResponse } from "next/server";

import { requirePermission } from "@/lib/api-permissions";
import {
  invokeNotify,
  TEMPLATES_REQUIRING_RECIPIENTS,
  type NotificationType,
  type NotifyPayload,
} from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeRecipients(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * POST /api/notifications/send
 *
 * Trigger sending a notification via the notify Edge Function.
 *
 * Body:
 *   - type (optional): "email" — channel type; defaults to "email". Only "email" is supported.
 *   - template (required): string — e.g. "visit_created_client", "visit_created_staff", "visit_reminder".
 *   - variables (optional): object — passed to the Edge Function for template rendering.
 *   - recipients (optional): string[] — email addresses. For visit_created_* templates, omit or
 *     leave empty to resolve from variables.memberId / variables.staffId. For visit_reminder
 *     and similar, recipients is required and must be non-empty.
 */
export async function POST(request: Request) {
  try {
    const permissionResult = await requirePermission("visits", "update");
    if (permissionResult instanceof NextResponse) return permissionResult;

    const body = await request.json();
    const {
      type = "email",
      template,
      templateData = {},
      recipients = [],
    } = body as {
      type?: NotificationType;
      template?: string;
      templateData?: Record<string, unknown>;
      recipients?: string[];
    };

    if (!template) {
      console.error("Notify failed: template is required");
      return NextResponse.json({ error: "template is required" }, { status: 500 });
    }

    const payload: NotifyPayload = {
      type,
      template,
      recipients,
      templateData,
    };

    const supabase = createAdminClient();
    const result = await invokeNotify(supabase, payload);

    if (!result.ok) {
      console.error("Notify failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send notification", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Notifications send error:", error);
    const message = error instanceof Error ? error.message : "Failed to send notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
