"use client";


import { SignIn, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react' // Added useState
import { ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react' // Added Eye icons

const LoginPage = () => {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()
    
    

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            const role = user.publicMetadata?.role as string

            if (role) {
                router.push(`/${role}`)
            } else {
                router.push('/dashboard')
            }
        }
    }, [isLoaded, isSignedIn, user, router])

    if ( !isLoaded) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
            <SignIn />      
        </div>
    )
}
export default LoginPage