import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routeAccessMap } from './lib/rules';

/**
 * 1. DEFINE PUBLIC ROUTES
 * These routes are accessible to everyone. 
 * This prevents the "Login page redirects to Login page" loop.
 */
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/', // Landing page
  '/api/webhooks(.*)' // If you use Clerk or Stripe webhooks
]);

// Pre-compute matchers for protected routes from your rules file
const matchers = Object.entries(routeAccessMap).map(([route, allowedRoles]) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: allowedRoles as string[],
}));

export default clerkMiddleware(async (auth, req) => {
  const currentPath = req.nextUrl.pathname;

  // 2. EXEMPT PUBLIC ROUTES
  // If the path is /sign-in, we stop here and let the user see the page.
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const authObject = await auth();
  const { sessionClaims, userId } = authObject;

  // 3. EXTRACT ROLE
  // Safely grab the role from Clerk Metadata
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // 4. CHECK PROTECTED ROUTES
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      
      // If the route is protected and user isn't logged in, redirect to sign-in
      if (!userId) {
        return authObject.redirectToSignIn();
      }

      // 5. ROLE-BASED ACCESS CONTROL (RBAC)
      // If user is logged in but doesn't have the required role for this specific route
      if (!role || !allowedRoles.includes(role)) {
        
        // Decide where to send them if they are unauthorized
        // If they have a role (e.g. "student"), send them to /student. 
        // If no role at all, send them to a default dashboard or onboarding.
        const fallbackPath = role ? `/${role}` : '/admin'; 

        // Final safety check: if they are already on the fallback path, don't redirect
        if (currentPath === fallbackPath) {
          return NextResponse.next();
        }

        return NextResponse.redirect(new URL(fallbackPath, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};