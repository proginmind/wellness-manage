import { format } from "date-fns";

import { Member } from "@/types/member";
import { Profile } from "@/types/profile";
import type { Visit } from "@/types/visit";

import { createAdminClient } from "./supabase/admin";

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

/**
 * Invoke the Supabase notify Edge Function.
 * Uses the admin client so the request is authenticated with the service role JWT (avoids 401 when verify_jwt is true).
 */
export async function invokeNotify(
  supabase: {
    functions: {
      invoke: (
        name: string,
        opts: { body: NotifyPayload }
      ) => Promise<{ data: unknown; error: unknown }>;
    };
  },
  payload: NotifyPayload
): Promise<InvokeNotifyResult> {
  const { data, error } = await supabase.functions.invoke("notify", { body: payload });
  if (error) {
    return { ok: false, error };
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
  const supabase = createAdminClient();
  const clientResult = await invokeNotify(supabase, {
    type: "email" as const,
    recipients: [member.email],
    template: "visit_created_client",
    templateData: buildVisitNotificationVariables(visit, member, staff),
  });

  let staffResult: InvokeNotifyResult | null = null;
  if (staff) {
    staffResult = await invokeNotify(supabase, {
      type: "email" as const,
      recipients: [staff.email],
      template: "visit_created_staff",
      templateData: buildVisitNotificationVariables(visit, member, staff),
    });
  }

  return { client: clientResult, staff: staffResult };
}
