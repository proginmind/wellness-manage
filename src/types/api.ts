import { UserRole } from "@/lib/permissions";

import { EventCategory } from "./event-category";
import { EventType } from "./event-type";
import { Member } from "./member";
import { Visit } from "./visit";

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

export interface MemberVisitsResponse {
  visits: Visit[];
  total: number;
}

export interface ProfileVisitsResponse {
  visits: { visit: Visit; member: Member }[];
  total: number;
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

// Event Categories API Response
export interface EventCategoriesListResponse {
  eventCategories: EventCategory[];
  total: number;
  filters: {
    isActive: boolean | null;
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
