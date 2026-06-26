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

function formatVisitDate(d: Date): string {
  return format(new Date(d), "EEEE, MMMM d, yyyy");
}

function formatVisitTime(d: Date): string {
  return format(new Date(d), "h:mm a");
}

function visitStartIso(visit: Visit): string {
  const startDate = new Date(visit.date);
  const timeDate = new Date(visit.time);
  startDate.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
  return startDate.toISOString();
}

/**
 * True when date, time, staff, service, or client changed (notes-only edits are excluded).
 */
export function hasScheduleChanged(before: Visit, after: Visit): boolean {
  const dateChanged =
    format(new Date(before.date), "yyyy-MM-dd") !== format(new Date(after.date), "yyyy-MM-dd");
  const timeChanged =
    format(new Date(before.time), "HH:mm") !== format(new Date(after.time), "HH:mm");
  return (
    dateChanged ||
    timeChanged ||
    (before.staffId ?? null) !== (after.staffId ?? null) ||
    before.eventTypeId !== after.eventTypeId ||
    before.memberId !== after.memberId
  );
}

function buildVisitNotificationVariables(
  visit: Visit,
  member: Member,
  staff: Profile | null | undefined,
  previousVisit?: Visit
): Record<string, unknown> {
  const vars: Record<string, unknown> = {
    memberName: `${member.firstName} ${member.lastName}`,
    staffName: staff ? `${staff.firstName} ${staff.lastName}` : undefined,
    serviceName: visit.eventTypeName,
    date: formatVisitDate(visit.date),
    time: formatVisitTime(visit.time),
    durationMinutes: visit.eventTypeDuration ?? undefined,
    notes: visit.notes ?? undefined,
    startIso: visitStartIso(visit),
  };

  if (previousVisit) {
    vars.previousDate = formatVisitDate(previousVisit.date);
    vars.previousTime = formatVisitTime(previousVisit.time);
  }

  return vars;
}

async function appendOrgTemplateVars(
  organizationId: string,
  templateVars: Record<string, unknown>
): Promise<void> {
  const [org, contact] = await Promise.all([
    getOrganizationById(organizationId),
    getOrganizationContact(organizationId),
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
}

async function sendVisitEmailPair({
  visit,
  member,
  staff,
  clientTemplate,
  staffTemplate,
}: {
  visit: Visit;
  member: Member;
  staff: Profile | null | undefined;
  clientTemplate: string;
  staffTemplate: string;
}): Promise<{ client: InvokeNotifyResult; staff: InvokeNotifyResult | null }> {
  const supabase = createAdminClient();
  const templateVars = buildVisitNotificationVariables(visit, member, staff);
  await appendOrgTemplateVars(visit.organizationId, templateVars);

  const clientResult = await invokeNotify(supabase, {
    type: "email" as const,
    recipients: [member.email],
    template: clientTemplate,
    templateData: templateVars,
  });

  await logNotification({
    organizationId: visit.organizationId,
    visitId: visit.id,
    type: "email",
    template: clientTemplate,
    recipient: member.email,
    status: clientResult.ok ? "sent" : "failed",
    error: !clientResult.ok ? String(clientResult.error) : undefined,
  });

  let staffResult: InvokeNotifyResult | null = null;
  if (staff) {
    staffResult = await invokeNotify(supabase, {
      type: "email" as const,
      recipients: [staff.email],
      template: staffTemplate,
      templateData: templateVars,
    });

    await logNotification({
      organizationId: visit.organizationId,
      visitId: visit.id,
      type: "email",
      template: staffTemplate,
      recipient: staff.email,
      status: staffResult.ok ? "sent" : "failed",
      error: !staffResult.ok ? String(staffResult.error) : undefined,
    });
  }

  return { client: clientResult, staff: staffResult };
}

/**
 * Send "visit created" notifications: one to the client, and optionally one to the assigned staff.
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
  return sendVisitEmailPair({
    visit,
    member,
    staff,
    clientTemplate: "visit_created_client",
    staffTemplate: "visit_created_staff",
  });
}

/**
 * Send "visit cancelled" notifications to the client and assigned staff.
 */
export async function sendVisitCancelledNotifications({
  visit,
  member,
  staff,
}: {
  visit: Visit;
  member: Member;
  staff: Profile | null | undefined;
}): Promise<{ client: InvokeNotifyResult; staff: InvokeNotifyResult | null }> {
  return sendVisitEmailPair({
    visit,
    member,
    staff,
    clientTemplate: "visit_cancelled_client",
    staffTemplate: "visit_cancelled_staff",
  });
}

/**
 * Send "visit rescheduled" notifications with previous and new schedule details.
 */
export async function sendVisitRescheduledNotifications({
  visit,
  member,
  staff,
  previousVisit,
}: {
  visit: Visit;
  member: Member;
  staff: Profile | null | undefined;
  previousVisit: Visit;
}): Promise<{ client: InvokeNotifyResult; staff: InvokeNotifyResult | null }> {
  const supabase = createAdminClient();
  const templateVars = buildVisitNotificationVariables(visit, member, staff, previousVisit);
  await appendOrgTemplateVars(visit.organizationId, templateVars);

  const clientResult = await invokeNotify(supabase, {
    type: "email" as const,
    recipients: [member.email],
    template: "visit_rescheduled_client",
    templateData: templateVars,
  });

  await logNotification({
    organizationId: visit.organizationId,
    visitId: visit.id,
    type: "email",
    template: "visit_rescheduled_client",
    recipient: member.email,
    status: clientResult.ok ? "sent" : "failed",
    error: !clientResult.ok ? String(clientResult.error) : undefined,
  });

  let staffResult: InvokeNotifyResult | null = null;
  if (staff) {
    staffResult = await invokeNotify(supabase, {
      type: "email" as const,
      recipients: [staff.email],
      template: "visit_rescheduled_staff",
      templateData: templateVars,
    });

    await logNotification({
      organizationId: visit.organizationId,
      visitId: visit.id,
      type: "email",
      template: "visit_rescheduled_staff",
      recipient: staff.email,
      status: staffResult.ok ? "sent" : "failed",
      error: !staffResult.ok ? String(staffResult.error) : undefined,
    });
  }

  return { client: clientResult, staff: staffResult };
}
