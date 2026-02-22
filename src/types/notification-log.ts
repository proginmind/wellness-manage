export type NotificationStatus = "sent" | "failed";
export type NotificationType = "email";

export interface NotificationLog {
  id: string;
  organizationId: string;
  type: NotificationType;
  template: string;
  recipient: string;
  status: NotificationStatus;
  error?: string;
  visitId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}
