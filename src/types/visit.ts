export type VisitStatus = "pending" | "completed" | "cancelled";

export interface Visit {
  id: string;
  organizationId: string;
  memberId: string;
  date: Date;
  time: Date;
  duration: number;
  type: string;
  status: VisitStatus;
  notes?: string;
  staffId: string;
  createdAt: Date;
  updatedAt: Date;
}
