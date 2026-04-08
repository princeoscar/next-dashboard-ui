"use client";

import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const LoginPage = () => {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()

    // CORRECTION: Reduced complex redirect logic here as Middleware now handles this.
    // This simply ensures that if a user manually navigates to /sign-in while already logged in, 
    // they get pushed to their dashboard.
    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            const role = (user.publicMetadata?.role as string)?.toLowerCase();
            router.push(role ? `/${role}` : '/admin');
        }
    }, [isLoaded, isSignedIn, user, router])

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
            {/* CORRECTION: Ensure the path prop matches the new folder structure */}
            <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />      
        </div>
    )
}

export default LoginPage;