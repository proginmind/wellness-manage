import { UserRole } from "@/lib/permissions";

import { EventType } from "./event-type";
import { Member } from "./member";

/**
 * API Response Types
 * Centralized types for API responses to ensure consistency
 */

// Members API Response
export interface MembersListResponse {
  members: Member[];
  total: number;
  search: string | null;
}

// Event Types API Response
export interface EventTypesListResponse {
  eventTypes: EventType[];
  total: number;
  filters: {
    isActive: boolean | null;
    isBookable: boolean | null;
  };
}

// Staff Member Type
export interface StaffMember {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

// Staff API Response
export interface StaffListResponse {
  staff: StaffMember[];
  total: number;
}
