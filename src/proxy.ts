import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routeAccessMap } from './lib/rules';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/', 
  '/api/webhooks(.*)',
  '/onboarding(.*)'
]);

const matchers = Object.entries(routeAccessMap).map(([route, allowedRoles]) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: allowedRoles.map(r => r.toLowerCase()),
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const currentPath = req.nextUrl.pathname;

  // 1. ALLOW PUBLIC ROUTES
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. FORCE AUTHENTICATION
  if (!userId) {
    return redirectToSignIn();
  }

  // 3. EXTRACT METADATA (Role and SchoolID)
  const metadata = (sessionClaims?.metadata as { role?: string; schoolId?: string }) || {};
  const role = metadata.role?.toLowerCase() || "";
  const schoolId = metadata.schoolId;

  // 4. ONBOARDING REDIRECT (The "Guard")
  if (role === "admin" && !schoolId && currentPath !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 5. PREVENT RE-ONBOARDING
  if (schoolId && currentPath === "/onboarding") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 6. RBAC (Access Control)
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      if (!allowedRoles.includes(role)) {
        
        // 🎯 FIX: If user has NO role, do not throw them into a homepage loop.
        // Send them to a generic dashboard list or let them through if no fallback is available.
        if (!role) {
          return NextResponse.redirect(new URL('/list/results', req.url)); 
        }

        const fallbackPath = `/${role}`;
        if (currentPath.startsWith(fallbackPath)) return NextResponse.next();
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