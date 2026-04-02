import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routeAccessMap } from './lib/rules';

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  // 1. Extract role and provide a fallback to prevent "undefined"
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // 2. If the user is logged in but HAS NO ROLE, redirect them to a default safe place
  // or a "pending approval" page. This prevents the /undefined error.
  if (sessionClaims && !role) {
    console.error("User logged in but no role found in metadata.");
    // Optional: return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // 3. Check route access
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      // If user has no role OR their role isn't in the allowed list
      if (!role || !allowedRoles.includes(role)) {
        
        // DESTINATION SAFETY: 
        // If role is missing, go to 'admin' by default, otherwise go to their role dashboard
        const redirectPath = role ? `/${role}` : '/admin'; 
        
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};