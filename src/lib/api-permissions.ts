/**
 * API Permission Middleware
 * 
 * Server-side permission checking for API routes
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/supabase/queries";
import { can, assertPermission, type Resource, type Action } from "@/lib/permissions";
import { UserRole } from "@/types";

// ============================================================================
// TYPES
// ============================================================================

export interface PermissionContext {
  userId: string;
  userEmail: string;
  role: UserRole;
  organizationId: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  context?: PermissionContext;
  error?: string;
}

// ============================================================================
// CORE PERMISSION CHECKING
// ============================================================================

/**
 * Check if current user has permission for an action
 * 
 * Returns either the permission context (if allowed) or an error response
 * Use this at the start of API routes to enforce permissions
 * 
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns Permission context or NextResponse error
 * 
 * @example
 * export async function DELETE(request: Request) {
 *   const result = await requirePermission('members', 'delete');
 *   if (result instanceof NextResponse) return result;
 *   
 *   const { role, organizationId } = result;
 *   // ... proceed with delete
 * }
 */
export async function requirePermission(
  resource: Resource,
  action: Action
): Promise<PermissionContext | NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's profile (includes role and organization)
    const profile = await getCurrentUserProfile();

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 403 }
      );
    }

    // Check permission
    if (!can(profile.role, resource, action)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: `You don't have permission to ${action} ${resource}`,
        },
        { status: 403 }
      );
    }

    // Return permission context for use in route handler
    return {
      userId: user.id,
      userEmail: user.email!,
      role: profile.role,
      organizationId: profile.organizationId,
    };
  } catch (error) {
    console.error("Permission check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check permission without throwing (returns result object)
 * Use this when you need to check permissions programmatically
 * 
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns Result object with allowed flag and context
 * 
 * @example
 * const result = await checkPermission('staff', 'invite');
 * if (!result.allowed) {
 *   return NextResponse.json({ error: result.error }, { status: 403 });
 * }
 */
export async function checkPermission(
  resource: Resource,
  action: Action
): Promise<PermissionCheckResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        allowed: false,
        error: "Not authenticated",
      };
    }

    const profile = await getCurrentUserProfile();

    if (!profile) {
      return {
        allowed: false,
        error: "Profile not found",
      };
    }

    const allowed = can(profile.role, resource, action);

    if (!allowed) {
      return {
        allowed: false,
        error: `Insufficient permissions to ${action} ${resource}`,
      };
    }

    return {
      allowed: true,
      context: {
        userId: user.id,
        userEmail: user.email!,
        role: profile.role,
        organizationId: profile.organizationId,
      },
    };
  } catch (error) {
    console.error("Permission check error:", error);
    return {
      allowed: false,
      error: "Permission check failed",
    };
  }
}

/**
 * Get current user's permission context
 * Use this when you need user context but don't need to check a specific permission
 * 
 * @returns Permission context or null if not authenticated
 * 
 * @example
 * const context = await getPermissionContext();
 * if (!context) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 * }
 */
export async function getPermissionContext(): Promise<PermissionContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const profile = await getCurrentUserProfile();
    if (!profile) return null;

    return {
      userId: user.id,
      userEmail: user.email!,
      role: profile.role,
      organizationId: profile.organizationId,
    };
  } catch (error) {
    console.error("Get permission context error:", error);
    return null;
  }
}

// ============================================================================
// CONVENIENCE HELPERS
// ============================================================================

/**
 * Require owner role
 * 
 * @example
 * export async function POST(request: Request) {
 *   const result = await requireOwner();
 *   if (result instanceof NextResponse) return result;
 *   // ... owner-only logic
 * }
 */
export async function requireOwner(): Promise<PermissionContext | NextResponse> {
  const context = await getPermissionContext();

  if (!context) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (context.role !== "owner") {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "This action requires owner privileges",
      },
      { status: 403 }
    );
  }

  return context;
}

/**
 * Require authentication (any role)
 * 
 * @example
 * export async function GET(request: Request) {
 *   const result = await requireAuth();
 *   if (result instanceof NextResponse) return result;
 *   // ... authenticated logic
 * }
 */
export async function requireAuth(): Promise<PermissionContext | NextResponse> {
  const context = await getPermissionContext();

  if (!context) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return context;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a permission-denied response
 * 
 * @param resource - Resource being accessed
 * @param action - Action being performed
 * @returns NextResponse with 403 status
 */
export function permissionDeniedResponse(
  resource: Resource,
  action: Action
): NextResponse {
  return NextResponse.json(
    {
      error: "Forbidden",
      message: `You don't have permission to ${action} ${resource}`,
    },
    { status: 403 }
  );
}

/**
 * Create an unauthorized response
 * 
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}
