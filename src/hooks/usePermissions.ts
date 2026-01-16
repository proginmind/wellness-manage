/**
 * React Hooks for Permission Checking
 * 
 * Client-side permission checking for UI components
 */

"use client";

import { useUser } from "@/hooks/useUser";
import { 
  can, 
  hasPermission, 
  canAny, 
  canAll,
  getActions,
  isOwner,
  isStaff,
  type Resource, 
  type Action, 
  type Permission 
} from "@/lib/permissions";
import { UserRole } from "@/types";

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Main hook for permission checking in React components
 * 
 * @returns Permission checking functions and user context
 * 
 * @example
 * function MyComponent() {
 *   const { can, isOwner, role } = usePermissions();
 *   
 *   return (
 *     <>
 *       {can('members', 'delete') && <DeleteButton />}
 *       {isOwner && <OwnerPanel />}
 *     </>
 *   );
 * }
 */
export function usePermissions() {
  const { user, isLoading } = useUser();
  const role = user?.profile?.role;

  return {
    // User context
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
    
    // Permission checking functions
    can: (resource: Resource, action: Action) => {
      if (!role) return false;
      return can(role, resource, action);
    },
    
    hasPermission: (permission: Permission) => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    
    canAny: (resource: Resource, actions: Action[]) => {
      if (!role) return false;
      return canAny(role, resource, actions);
    },
    
    canAll: (resource: Resource, actions: Action[]) => {
      if (!role) return false;
      return canAll(role, resource, actions);
    },
    
    getActions: (resource: Resource) => {
      if (!role) return [];
      return getActions(role, resource);
    },
    
    // Role helpers
    isOwner: role ? isOwner(role) : false,
    isStaff: role ? isStaff(role) : false,
  };
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Hook to check a specific permission
 * Returns boolean indicating if user has the permission
 * 
 * @param resource - Resource to check
 * @param action - Action to check
 * @returns true if user has permission
 * 
 * @example
 * function DeleteButton() {
 *   const canDelete = useHasPermission('members', 'delete');
 *   if (!canDelete) return null;
 *   return <Button>Delete</Button>;
 * }
 */
export function useHasPermission(resource: Resource, action: Action): boolean {
  const { can } = usePermissions();
  return can(resource, action);
}

/**
 * Hook to check if user is owner
 * 
 * @returns true if user is owner
 * 
 * @example
 * function OwnerPanel() {
 *   const isOwner = useIsOwner();
 *   if (!isOwner) return null;
 *   return <div>Owner controls</div>;
 * }
 */
export function useIsOwner(): boolean {
  const { isOwner } = usePermissions();
  return isOwner;
}

/**
 * Hook to check if user is staff
 * 
 * @returns true if user is staff
 */
export function useIsStaff(): boolean {
  const { isStaff } = usePermissions();
  return isStaff;
}

/**
 * Hook to get user's role
 * 
 * @returns User's role or undefined
 * 
 * @example
 * function RoleBadge() {
 *   const role = useRole();
 *   return <Badge>{role}</Badge>;
 * }
 */
export function useRole(): UserRole | undefined {
  const { role } = usePermissions();
  return role;
}

// ============================================================================
// PERMISSION GATES (Component Helpers)
// ============================================================================

/**
 * Hook to create a permission gate function
 * Useful for conditional rendering
 * 
 * @returns Gate function
 * 
 * @example
 * function MyComponent() {
 *   const gate = usePermissionGate();
 *   
 *   return (
 *     <>
 *       {gate('members', 'create', <AddButton />)}
 *       {gate('members', 'delete', <DeleteButton />)}
 *     </>
 *   );
 * }
 */
export function usePermissionGate() {
  const { can } = usePermissions();
  
  return <T extends React.ReactNode>(
    resource: Resource,
    action: Action,
    component: T
  ): T | null => {
    return can(resource, action) ? component : null;
  };
}

// ============================================================================
// RESOURCE-SPECIFIC HOOKS
// ============================================================================

/**
 * Hook for member permissions
 * 
 * @returns Member-specific permission checks
 */
export function useMemberPermissions() {
  const { can } = usePermissions();
  
  return {
    canView: can("members", "view"),
    canCreate: can("members", "create"),
    canUpdate: can("members", "update"),
    canDelete: can("members", "delete"),
    canArchive: can("members", "archive"),
    canExport: can("members", "export"),
  };
}

/**
 * Hook for staff/invitation permissions
 * 
 * @returns Staff management permission checks
 */
export function useStaffPermissions() {
  const { can } = usePermissions();
  
  return {
    canViewStaff: can("staff", "view"),
    canInviteStaff: can("staff", "invite"),
    canRemoveStaff: can("staff", "remove"),
    canViewInvitations: can("invitations", "view"),
    canManageInvitations: can("invitations", "manage"),
  };
}

/**
 * Hook for organization permissions
 * 
 * @returns Organization management permission checks
 */
export function useOrganizationPermissions() {
  const { can } = usePermissions();
  
  return {
    canView: can("organization", "view"),
    canUpdate: can("organization", "update"),
    canDelete: can("organization", "delete"),
  };
}
