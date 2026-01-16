// Global type definitions

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = "owner" | "staff";
export type InvitationStatus = "pending" | "accepted" | "expired";

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  profile?: Profile;
  organization?: Organization;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  invitedBy: string;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  success: boolean;
}
