import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routeAccessMap } from './lib/rules';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/', 
  '/api/webhooks(.*)'
]);

// Cache matchers outside the handler
const matchers = Object.entries(routeAccessMap).map(([route, allowedRoles]) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: allowedRoles.map(r => r.toLowerCase()),
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const currentPath = req.nextUrl.pathname;

  // 1. PUBLIC ROUTES
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. AUTHENTICATION CHECK
  if (!userId) {
    return redirectToSignIn();
  }

  // 3. ROLE EXTRACTION
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase() || "";

  // 4. RBAC CHECK
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      // If the user's role isn't in the allowed list for this path
      if (!allowedRoles.includes(role)) {
        
        // Define destination based on role
        const fallbackPath = role ? `/${role}` : '/list/subjects';

        // CRITICAL: Prevent Infinite Redirect Loop
        // If the current path is already the destination, let them in
        if (currentPath.startsWith(fallbackPath)) {
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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};