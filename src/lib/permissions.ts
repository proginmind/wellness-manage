/**
 * Granular Resource-Action Permission System
 * 
 * This module defines the complete RBAC (Role-Based Access Control) system
 * for the wellness management application.
 */

import { UserRole } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Resources in the system
 */
export type Resource = 
  | "members" 
  | "organization" 
  | "staff" 
  | "invitations"
  | "profile";

/**
 * Actions that can be performed on resources
 */
export type Action = 
  | "view" 
  | "create" 
  | "update" 
  | "delete" 
  | "archive"
  | "export"
  | "invite"
  | "remove"
  | "manage";

/**
 * Permission string format: "resource.action"
 * e.g., "members.delete", "staff.invite"
 */
export type Permission = `${Resource}.${Action}`;

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * Complete permission matrix for all roles
 * 
 * This is the single source of truth for what each role can do.
 */
export const PERMISSIONS = {
  owner: {
    // Members: Full access
    members: ["view", "create", "update", "delete", "archive", "export"] as Action[],
    
    // Organization: Full management
    organization: ["view", "update", "delete"] as Action[],
    
    // Staff: Full management
    staff: ["view", "invite", "remove"] as Action[],
    
    // Invitations: Full management
    invitations: ["view", "create", "update", "delete", "manage"] as Action[],
    
    // Profile: Own profile only
    profile: ["view", "update"] as Action[],
  },
  
  staff: {
    // Members: Day-to-day operations (no permanent delete)
    members: ["view", "create", "update", "archive", "export"] as Action[],
    
    // Organization: Read-only
    organization: ["view"] as Action[],
    
    // Staff: View only (can see colleagues)
    staff: ["view"] as Action[],
    
    // Invitations: No access
    invitations: [] as Action[],
    
    // Profile: Own profile only
    profile: ["view", "update"] as Action[],
  },
} as const;

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Check if a role has permission to perform an action on a resource
 * 
 * @param role - User's role (owner, staff)
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns true if permitted, false otherwise
 * 
 * @example
 * can('staff', 'members', 'delete') // false
 * can('owner', 'members', 'delete') // true
 */
export function can(
  role: UserRole,
  resource: Resource,
  action: Action
): boolean {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return false;
  
  const resourceActions = rolePermissions[resource];
  if (!resourceActions) return false;
  
  return resourceActions.includes(action);
}

/**
 * Check if a role has permission using permission string format
 * 
 * @param role - User's role
 * @param permission - Permission string (e.g., "members.delete")
 * @returns true if permitted, false otherwise
 * 
 * @example
 * hasPermission('owner', 'staff.invite') // true
 * hasPermission('staff', 'staff.invite') // false
 */
export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  const [resource, action] = permission.split(".") as [Resource, Action];
  return can(role, resource, action);
}

/**
 * Get all permissions for a role
 * 
 * @param role - User's role
 * @returns Array of permission strings
 * 
 * @example
 * getPermissions('staff')
 * // ['members.view', 'members.create', 'members.update', ...]
 */
export function getPermissions(role: UserRole): Permission[] {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return [];
  
  const permissions: Permission[] = [];
  
  for (const [resource, actions] of Object.entries(rolePermissions)) {
    for (const action of actions) {
      permissions.push(`${resource}.${action}` as Permission);
    }
  }
  
  return permissions;
}

/**
 * Check if a role can perform ANY of the given actions on a resource
 * 
 * @param role - User's role
 * @param resource - Resource being accessed
 * @param actions - Array of actions
 * @returns true if ANY action is permitted
 * 
 * @example
 * canAny('staff', 'members', ['delete', 'archive']) // true (has archive)
 */
export function canAny(
  role: UserRole,
  resource: Resource,
  actions: Action[]
): boolean {
  return actions.some((action) => can(role, resource, action));
}

/**
 * Check if a role can perform ALL of the given actions on a resource
 * 
 * @param role - User's role
 * @param resource - Resource being accessed
 * @param actions - Array of actions
 * @returns true if ALL actions are permitted
 * 
 * @example
 * canAll('owner', 'members', ['view', 'create']) // true
 * canAll('staff', 'members', ['view', 'delete']) // false
 */
export function canAll(
  role: UserRole,
  resource: Resource,
  actions: Action[]
): boolean {
  return actions.every((action) => can(role, resource, action));
}

/**
 * Get actions a role can perform on a resource
 * 
 * @param role - User's role
 * @param resource - Resource being accessed
 * @returns Array of permitted actions
 * 
 * @example
 * getActions('staff', 'members')
 * // ['view', 'create', 'update', 'archive', 'export']
 */
export function getActions(role: UserRole, resource: Resource): Action[] {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions) return [];
  
  return rolePermissions[resource] || [];
}

/**
 * Check if user is an owner (convenience function)
 * 
 * @param role - User's role
 * @returns true if owner
 */
export function isOwner(role: UserRole): boolean {
  return role === "owner";
}

/**
 * Check if user is staff (convenience function)
 * 
 * @param role - User's role
 * @returns true if staff
 */
export function isStaff(role: UserRole): boolean {
  return role === "staff";
}

// ============================================================================
// PERMISSION ERRORS
// ============================================================================

/**
 * Custom error for permission denied
 */
export class PermissionError extends Error {
  constructor(
    public role: UserRole,
    public resource: Resource,
    public action: Action
  ) {
    super(`Permission denied: ${role} cannot ${action} ${resource}`);
    this.name = "PermissionError";
  }
}

/**
 * Throw error if permission is denied
 * 
 * @param role - User's role
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @throws PermissionError if not permitted
 * 
 * @example
 * assertPermission('staff', 'members', 'delete')
 * // throws: PermissionError: Permission denied: staff cannot delete members
 */
export function assertPermission(
  role: UserRole,
  resource: Resource,
  action: Action
): void {
  if (!can(role, resource, action)) {
    throw new PermissionError(role, resource, action);
  }
}

// ============================================================================
// PERMISSION METADATA (for UI generation)
// ============================================================================

/**
 * Human-readable descriptions for permissions
 */
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  // Members
  "members.view": "View member information",
  "members.create": "Add new members",
  "members.update": "Edit member details",
  "members.delete": "Permanently delete members",
  "members.archive": "Archive members",
  "members.export": "Export member data",
  
  // Organization
  "organization.view": "View organization details",
  "organization.update": "Update organization settings",
  "organization.delete": "Delete organization",
  
  // Staff
  "staff.view": "View staff members",
  "staff.invite": "Invite new staff",
  "staff.remove": "Remove staff members",
  
  // Invitations
  "invitations.view": "View pending invitations",
  "invitations.create": "Create new invitations",
  "invitations.update": "Update invitations",
  "invitations.delete": "Delete invitations",
  "invitations.manage": "Manage all invitations",
  
  // Profile
  "profile.view": "View own profile",
  "profile.update": "Update own profile",
  
  // Unused combinations (for type safety)
  "members.invite": "N/A",
  "members.remove": "N/A",
  "members.manage": "N/A",
  "organization.create": "N/A",
  "organization.archive": "N/A",
  "organization.export": "N/A",
  "organization.invite": "N/A",
  "organization.remove": "N/A",
  "organization.manage": "N/A",
  "staff.create": "N/A",
  "staff.update": "N/A",
  "staff.delete": "N/A",
  "staff.archive": "N/A",
  "staff.export": "N/A",
  "staff.manage": "N/A",
  "invitations.archive": "N/A",
  "invitations.export": "N/A",
  "invitations.invite": "N/A",
  "invitations.remove": "N/A",
  "profile.create": "N/A",
  "profile.delete": "N/A",
  "profile.archive": "N/A",
  "profile.export": "N/A",
  "profile.invite": "N/A",
  "profile.remove": "N/A",
  "profile.manage": "N/A",
};
