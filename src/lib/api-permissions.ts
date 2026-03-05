/**
 * API Permission Middleware
 *
 * Server-side permission checking for API routes
 */

import { NextResponse } from "next/server";

import { can, type Action, type Resource, type UserRole } from "@/lib/permissions";
import { getCurrentUserProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// TYPES
// ============================================================================

export interface PermissionContext {
  userId: string;
  profileId: string;
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile (pass userId to avoid redundant auth call)
    const profile = await getCurrentUserProfile(user.id);

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
      profileId: profile.id,
      userEmail: user.email!,
      role: profile.role,
      organizationId: profile.organizationId,
    };
  } catch (error) {
    console.error("Permission check error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
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

    // Pass userId to avoid redundant auth call
    const profile = await getCurrentUserProfile(user.id);

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
        profileId: profile.id,
        userEmail: user.email!,
        role: profile.role,
        organizationId: profile.organizationId,
      },
    };
  } catch (error) {
    console.error("Permission check error:", error);
    const message = error instanceof Error ? error.message : "Permission check failed";
    return {
      allowed: false,
      error: message,
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

    // Pass userId to avoid redundant auth call
    const profile = await getCurrentUserProfile(user.id);

    return {
      userId: user.id,
      profileId: profile.id,
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
 * Require owner role (for API routes)
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
 * Require owner role (for server components)
 * Returns context if owner, null otherwise. Use with redirect() for page guards.
 *
 * @example
 * export default async function BillingPage() {
 *   const context = await requireOwnerServer();
 *   if (!context) redirect("/settings/profile");
 *   // ... owner-only page content
 * }
 */
export async function requireOwnerServer(): Promise<PermissionContext | null> {
  const context = await getPermissionContext();
  if (!context || context.role !== "owner") return null;
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
export function permissionDeniedResponse(resource: Resource, action: Action): NextResponse {
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
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
