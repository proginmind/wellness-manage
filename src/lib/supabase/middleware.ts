import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { getTrialStatus, TRIAL_ALLOWED_PATHS } from "@/lib/trial";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Define protected route patterns
  const protectedRoutes = [
    "/dashboard",
    "/members",
    "/visits",
    "/event-types",
    "/event-categories",
    "/team",
    "/settings",
    "/onboarding",
  ];

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without auth
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authPages = ["/login", "/forgot-password", "/reset-password"];
  const isAuthPage = authPages.some((page) => pathname === page);

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Onboarding enforcement: users without a profile must set up their org first
  if (user && !pathname.startsWith("/api")) {
    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profileRow) {
      // No profile yet — only /onboarding is allowed
      if (pathname !== "/onboarding") {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
      // Allow /onboarding to render — skip remaining checks
      return supabaseResponse;
    }

    // Has a profile — onboarding page is no longer needed
    if (pathname === "/onboarding") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Trial enforcement: redirect expired trial users from restricted pages
  if (user && isProtectedRoute) {
    const isAllowedPath = TRIAL_ALLOWED_PATHS.some((allowed) => pathname.startsWith(allowed));

    if (!isAllowedPath) {
      // Fetch trial_ends_at from org via profile (single query)
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("organization_id, organizations!inner(trial_ends_at)")
        .eq("user_id", user.id)
        .single();

      const orgRow = profileRow?.organizations as unknown as {
        trial_ends_at: string | null;
      } | null;
      const trialEndsAt = orgRow?.trial_ends_at ? new Date(orgRow.trial_ends_at) : null;

      if (trialEndsAt && trialEndsAt <= new Date()) {
        // Trial date is past — check for an active subscription
        const { count } = await supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", profileRow!.organization_id)
          .eq("status", "active");

        const trialStatus = getTrialStatus(trialEndsAt, (count ?? 0) > 0);

        if (trialStatus.isExpired) {
          const url = request.nextUrl.clone();
          url.pathname = "/settings/billing";
          const redirect = NextResponse.redirect(url);
          // Copy cookies so the session stays in sync
          supabaseResponse.cookies.getAll().forEach((c) => redirect.cookies.set(c));
          return redirect;
        }
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}
