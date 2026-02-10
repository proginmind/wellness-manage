export type InvitationStatus = "pending" | "accepted" | "expired";

export interface Invitation {
  id: string;
  email: string;
  invitedBy: string;
  organizationId: string;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}
