export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  dateOfBirth: Date;
  dateJoined: Date;
  status: "active" | "archived";
  archivedAt?: Date;
  organizationId: string;
}

export type MemberFormData = Omit<Member, "id" | "dateJoined" | "organizationId">;

export type UserRole = "owner" | "staff";

export interface Profile {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: Profile;
  organization?: {
    id: string;
    name: string;
    ownerEmail: string;
  };
}

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
