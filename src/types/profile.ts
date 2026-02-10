import { UserRole } from "@/lib/permissions";

export interface Profile {
  id: string;
  userId: string;
  organizationId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
