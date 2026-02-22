import { format } from "date-fns";

import { Member } from "@/types/member";
import { Profile } from "@/types/profile";
import type { Visit } from "@/types/visit";

/** Supported notification channel (Edge Function supports "email" only for now). */
export type NotificationType = "email";

export type NotifyPayload = {
  type: NotificationType;
  template: string;
  recipients: string[];
  templateData: Record<string, unknown>;
};

/** Templates that require a non-empty `recipients` array (no ID-based resolution). */
export const TEMPLATES_REQUIRING_RECIPIENTS = ["visit_reminder"] as const;

export type InvokeNotifyResult = { ok: true; data: unknown } | { ok: false; error: unknown };

/** Read at request time and trim to avoid env truncation/newline issues in production. */
function getNotifyEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY)?.trim();
  return { url, key };
}

/**
 * Invoke the Supabase notify Edge Function via fetch.
 * Uses env at request time with trimmed keys to avoid 401s from newline/truncation in production.
 */
export async function invokeNotify(payload: NotifyPayload): Promise<InvokeNotifyResult> {
  const { url, key } = getNotifyEnv();
  if (!url || !key) {
    return {
      ok: false,
      error: new Error(
        "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY"
      ),
    };
  }
  const res = await fetch(`${url}/functions/v1/notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      error: new Error(`notify failed: ${res.status} ${text}`),
    };
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // empty or non-JSON body is ok
  }
  return { ok: true, data };
}

/**
 * Build variables and payload shape used by the notify function for "visit created" templates.
 * The Edge Function resolves recipient emails from memberId/staffId.
 */
function buildVisitNotificationVariables(
  visit: Visit,
  member: Member,
  staff: Profile | null | undefined
): Record<string, unknown> {
  const formattedDate = format(new Date(visit.date), "EEEE, MMMM d, yyyy");
  const formattedTime = format(new Date(visit.time), "h:mm a");
  return {
    memberName: `${member.firstName} ${member.lastName}`,
    staffName: staff ? `${staff.firstName} ${staff.lastName}` : undefined,
    serviceName: visit.eventTypeName,
    date: formattedDate,
    time: formattedTime,
    durationMinutes: visit.eventTypeDuration ?? undefined,
    notes: visit.notes ?? undefined,
  };
}

/**
 * Send "visit created" notifications: one to the client, and optionally one to the assigned staff.
 * Uses the shared notify Edge Function; recipient emails are resolved inside the function from memberId/staffId.
 */
export async function sendVisitCreatedNotifications({
  visit,
  member,
  staff,
}: {
  visit: Visit;
  member: Member;
  staff: Profile | null | undefined;
}): Promise<{ client: InvokeNotifyResult; staff: InvokeNotifyResult | null }> {
  const clientResult = await invokeNotify({
    type: "email" as const,
    recipients: [member.email],
    template: "visit_created_client",
    templateData: buildVisitNotificationVariables(visit, member, staff),
  });

  let staffResult: InvokeNotifyResult | null = null;
  if (staff) {
    staffResult = await invokeNotify({
      type: "email" as const,
      recipients: [staff.email],
      template: "visit_created_staff",
      templateData: buildVisitNotificationVariables(visit, member, staff),
    });
  }

  return { client: clientResult, staff: staffResult };
}
