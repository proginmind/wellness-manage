export interface ProfileEventType {
  id: string;
  profileId: string;
  eventTypeId: string;
  organizationId: string;
  createdAt: Date;
}

// Extended profile with event types populated
export interface ProfileWithEventTypes {
  id: string;
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  avatarImage?: string;
  createdAt: string;
  eventTypes: Array<{
    id: string;
    name: string;
    duration: number;
    color: string;
    categoryName?: string;
  }>;
}
