import { format } from "date-fns";

import { Member } from "@/types/member";
import { Profile } from "@/types/profile";
import type { Visit } from "@/types/visit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrganizationById, getOrganizationContact } from "@/lib/supabase/queries";

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
 * Invoke the Supabase notify Edge Function via Supabase SDK.
 * Uses admin client; ensure notify function has verify_jwt = false in config or a valid service role key is set.
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
 * Log a notification attempt to the notification_logs table.
 * Uses admin client; errors are swallowed so logging never interrupts the notification flow.
 */
export async function logNotification({
  organizationId,
  type,
  template,
  recipient,
  status,
  error,
  visitId,
  metadata,
}: {
  organizationId: string;
  type: NotificationType;
  template: string;
  recipient: string;
  status: "sent" | "failed";
  error?: string;
  visitId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error: insertError } = await admin.from("notification_logs").insert({
      organization_id: organizationId,
      type,
      template,
      recipient,
      status,
      error: error ?? null,
      visit_id: visitId ?? null,
      metadata: metadata ?? null,
    });
    if (insertError) {
      console.error("logNotification: insert failed", insertError);
    }
  } catch (err) {
    console.error("logNotification: unexpected error", err);
  }
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

  // Combine date (calendar day) and time (clock time) into a single datetime for the ICS event.
  const startDate = new Date(visit.date);
  const timeDate = new Date(visit.time);
  startDate.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);

  return {
    memberName: `${member.firstName} ${member.lastName}`,
    staffName: staff ? `${staff.firstName} ${staff.lastName}` : undefined,
    serviceName: visit.eventTypeName,
    date: formattedDate,
    time: formattedTime,
    durationMinutes: visit.eventTypeDuration ?? undefined,
    notes: visit.notes ?? undefined,
    startIso: startDate.toISOString(),
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
  const templateVars = buildVisitNotificationVariables(visit, member, staff);

  const [org, contact] = await Promise.all([
    getOrganizationById(visit.organizationId),
    getOrganizationContact(visit.organizationId),
  ]);

  const orgAddress = contact?.address
    ? [
        contact.address.line1,
        contact.address.line2,
        [contact.address.city, contact.address.state, contact.address.postalCode]
          .filter(Boolean)
          .join(", "),
        contact.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : undefined;

  Object.assign(templateVars, {
    orgName: org?.name,
    orgPhone: contact?.phone,
    orgEmail: contact?.email,
    orgWebsite: contact?.socialLinks?.website,
    orgAddress,
  });

  const clientResult = await invokeNotify(supabase, {
    type: "email" as const,
    recipients: [member.email],
    template: "visit_created_client",
    templateData: templateVars,
  });

  await logNotification({
    organizationId: visit.organizationId,
    visitId: visit.id,
    type: "email",
    template: "visit_created_client",
    recipient: member.email,
    status: clientResult.ok ? "sent" : "failed",
    error: !clientResult.ok ? String(clientResult.error) : undefined,
  });

  let staffResult: InvokeNotifyResult | null = null;
  if (staff) {
    staffResult = await invokeNotify(supabase, {
      type: "email" as const,
      recipients: [staff.email],
      template: "visit_created_staff",
      templateData: templateVars,
    });

    await logNotification({
      organizationId: visit.organizationId,
      visitId: visit.id,
      type: "email",
      template: "visit_created_staff",
      recipient: staff.email,
      status: staffResult.ok ? "sent" : "failed",
      error: !staffResult.ok ? String(staffResult.error) : undefined,
    });
  }

  return { client: clientResult, staff: staffResult };
}
