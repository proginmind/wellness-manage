import { UserRole } from "@/lib/permissions";

export interface Profile {
  id: string;
  userId: string;
  organizationId: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  description?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  avatarImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
