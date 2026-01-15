export type MemberStatus = "active" | "archived";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  dateJoined: Date;
  dateOfBirth: Date;
  status: MemberStatus;
  archivedAt?: Date;
}
