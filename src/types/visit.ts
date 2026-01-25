export type VisitStatus = "pending" | "completed" | "cancelled";

export interface Visit {
  id: string;
  organizationId: string;
  memberId: string;
  visitDate: Date;
  visitTime: Date;
  visitDuration: number;
  visitType: string;
  visitStatus: VisitStatus;
  visitNotes?: string;
  staffId: string;
  createdAt: Date;
  updatedAt: Date;
}
