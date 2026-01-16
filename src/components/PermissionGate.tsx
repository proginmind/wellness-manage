/**
 * Permission Gate Component
 * 
 * Conditionally renders children based on permissions
 */

"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { type Resource, type Action } from "@/lib/permissions";

interface PermissionGateProps {
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Gate component that shows/hides content based on permissions
 * 
 * @example
 * <PermissionGate resource="members" action="delete">
 *   <DeleteButton />
 * </PermissionGate>
 * 
 * @example With fallback
 * <PermissionGate 
 *   resource="staff" 
 *   action="invite"
 *   fallback={<p>Only owners can invite staff</p>}
 * >
 *   <InviteButton />
 * </PermissionGate>
 */
export function PermissionGate({
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermissions();

  if (!can(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Gate that requires owner role
 */
export function OwnerGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isOwner } = usePermissions();

  if (!isOwner) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Gate that requires staff role
 */
export function StaffGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isStaff } = usePermissions();

  if (!isStaff) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Gate that requires authentication (any role)
 */
export function AuthGate({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = usePermissions();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
