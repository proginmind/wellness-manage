export interface EventType {
  id: string;
  organizationId: string;

  // Basic Information
  name: string;
  description?: string;
  color: string;
  categoryId?: string;
  // Optional: populated when fetching with category join
  category?: {
    id: string;
    name: string;
    color: string;
  };

  // Scheduling Configuration
  duration: number; // in minutes
  bufferBefore: number; // prep time in minutes
  bufferAfter: number; // cleanup time in minutes

  // Pricing
  price: number;

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
