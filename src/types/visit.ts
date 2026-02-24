export type VisitStatus = "pending" | "completed" | "cancelled";

export interface Visit {
  id: string;
  organizationId: string;
  memberId: string;
  eventTypeId: string;
  // Snapshot fields - preserve event type data at booking time
  eventTypeName: string;
  eventTypeDuration: number;
  eventTypePrice: number;
  eventTypeCurrency?: string;
  eventTypeCategoryName?: string;
  eventTypeCategoryColor?: string;
  date: Date;
  time: Date;
  status: VisitStatus;
  notes?: string;
  staffId?: string;
  createdAt: Date;
  updatedAt: Date;
}
