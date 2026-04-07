import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { routeAccessMap } from './lib/rules';

// Pre-compute matchers outside the loop for better performance
const matchers = Object.entries(routeAccessMap).map(([route, allowedRoles]) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: allowedRoles as string[],
}));

export default clerkMiddleware(async (auth, req) => {
  // CRITICAL: You must await auth() in the latest Next.js/Clerk versions
  const authObject = await auth();
  const { sessionClaims } = authObject;

  // 1. Extract role and handle the metadata type safely
  const role = (sessionClaims?.metadata as { role?: string })?.role?.toLowerCase();

  // 2. Prevent Redirect Loops (The most common error)
  // If they are already on their dashboard, don't redirect them again
  const currentPath = req.nextUrl.pathname;

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req)) {
      // If user isn't logged in, Clerk handles the redirect to sign-in automatically 
      // if you use auth().protect(), otherwise:
      if (!authObject.userId) {
        return authObject.redirectToSignIn();
      }

      // 3. Role-Based Access Control
      if (!role || !allowedRoles.includes(role)) {
        const fallbackPath = role ? `/${role}` : '/sign-in';
        
        // Prevent redirecting to the same page (Infinite Loop Protection)
        if (currentPath === fallbackPath) return NextResponse.next();

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