/**
 * Centralized route definitions for the application.
 * All routes are functions for consistency.
 */

// ============================================================================
// Page Route Builders
// ============================================================================

/**
 * Build page routes - all routes are functions for consistency
 */
export const buildRoute = {
  // Public routes
  home: () => "/" as const,
  login: () => "/login" as const,
  forgotPassword: () => "/forgot-password" as const,
  resetPassword: () => "/reset-password" as const,

  // Main app routes
  dashboard: () => "/dashboard" as const,
  team: () => "/team" as const,
  teamMember: (id: string) => `/team/${id}` as const,
  teamMemberEdit: (id: string) => `/team/${id}/edit` as const,

  // Members
  members: () => "/members" as const,
  membersNew: () => "/members/new" as const,
  member: (id: string) => `/members/${id}` as const,
  memberEdit: (id: string) => `/members/${id}/edit` as const,

  // Visits
  visits: () => "/visits" as const,
  visitsNew: () => "/visits/new" as const,
  visit: (id: string) => `/visits/${id}` as const,
  visitEdit: (id: string) => `/visits/${id}/edit` as const,
  visitArchive: (id: string) => `/visits/${id}/archive` as const,

  // Event Types
  eventTypes: () => "/event-types" as const,
  eventTypesNew: () => "/event-types/new" as const,
  eventType: (id: string) => `/event-types/${id}` as const,
  eventTypeEdit: (id: string) => `/event-types/${id}/edit` as const,
  eventTypeArchive: (id: string) => `/event-types/${id}/archive` as const,
  eventTypeUnarchive: (id: string) => `/event-types/${id}/unarchive` as const,

  // Event Categories
  eventCategories: () => "/event-categories" as const,
  eventCategoriesNew: () => "/event-categories/new" as const,
  eventCategory: (id: string) => `/event-categories/${id}` as const,
  eventCategoryEdit: (id: string) => `/event-categories/${id}/edit` as const,
  eventCategoryArchive: (id: string) => `/event-categories/${id}/archive` as const,
  eventCategoryUnarchive: (id: string) => `/event-categories/${id}/unarchive` as const,

  // Settings
  settingsProfile: () => "/settings/profile" as const,
  settingsProfileEdit: () => "/settings/profile/edit" as const,
  settingsOrganization: () => "/settings/organization" as const,
  settingsOrganizationEdit: () => "/settings/organization/edit" as const,
  settingsTeam: () => "/settings/team" as const,
  settingsInvitations: () => "/settings/invitations" as const,
  settingsInvitationsNew: () => "/settings/invitations/new" as const,
  settingsPlans: () => "/settings/plans" as const,
  settingsBilling: () => "/settings/billing" as const,

  // Invitations
  invite: (token: string) => `/invite/${token}` as const,
} as const;

// ============================================================================
// API Route Builders
// ============================================================================

/**
 * Build API routes - all routes are functions for consistency
 */
export const buildApiRoute = {
  // Auth
  authMe: () => "/api/auth/me" as const,
  authSignout: () => "/api/auth/signout" as const,

  // Members
  members: () => "/api/members" as const,
  member: (id: string) => `/api/members/${id}` as const,
  uploadMemberImage: () => "/api/upload/member-image" as const,

  // Visits
  visits: () => "/api/visits" as const,
  visit: (id: string) => `/api/visits/${id}` as const,

  // Event Types
  eventTypes: () => "/api/event-types" as const,
  eventType: (id: string) => `/api/event-types/${id}` as const,

  // Event Categories
  eventCategories: () => "/api/event-categories" as const,
  eventCategory: (id: string) => `/api/event-categories/${id}` as const,

  // Invitations
  invitations: () => "/api/invitations" as const,
  invitation: (id: string) => `/api/invitations/${id}` as const,
  invitationProcess: (token: string) => `/api/invitations/process/${token}` as const,
  invitationAccept: (token: string) => `/api/invitations/process/${token}/accept` as const,

  // Profiles (staff/team members)
  profiles: () => "/api/profiles" as const,
  profile: (id: string) => `/api/profiles/${id}` as const,
  profileEventTypes: (id: string) => `/api/profiles/${id}/event-types` as const,
  profileAvailability: (id: string) => `/api/profiles/${id}/availability` as const,

  // Plans
  plans: () => "/api/plans" as const,

  // Billing
  billing: () => "/api/billing" as const,

  // Stats
  stats: () => "/api/stats" as const,

  // Health
  health: () => "/api/health" as const,
} as const;

// ============================================================================
// Route Utilities
// ============================================================================

/**
 * Check if a pathname matches a route pattern
 * @example isRouteActive('/members', '/members/123') // true
 * @example isRouteActive('/members', '/visits/123') // false
 */
export function isRouteActive(baseRoute: string, pathname: string): boolean {
  return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
}
