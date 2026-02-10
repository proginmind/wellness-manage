export interface EventType {
  id: string;
  organizationId: string;

  // Basic Information
  name: string;
  description?: string;
  color: string;
  category?: string;

  // Scheduling Configuration
  duration: number; // in minutes
  bufferBefore: number; // prep time in minutes
  bufferAfter: number; // cleanup time in minutes

  // Pricing
  price: number;
  currency: string;

  // Availability Settings
  isActive: boolean;
  isBookable: boolean; // can customers book online
  requiresApproval: boolean; // manual approval needed

  // Booking Limits
  maxAdvanceBookingDays?: number; // how far in advance bookings allowed
  minAdvanceBookingHours: number; // minimum notice required

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
