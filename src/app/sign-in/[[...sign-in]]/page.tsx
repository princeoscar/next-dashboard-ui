"use client";

import { SignIn, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image';

const LoginPage = () => {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            const role = (user.publicMetadata?.role as string)?.toLowerCase();
            router.push(role ? `/${role}` : '/admin');
        }
    }, [isLoaded, isSignedIn, user, router])

    if (!isLoaded) return null;

    return (
        <div className="flex h-screen w-full bg-white">
            {/* LEFT SIDE: BRANDING & VISUALS (Hidden on mobile) */}
            <div className="hidden lg:flex flex-1 relative bg-slate-900 overflow-hidden">
                {/* Abstract Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
                </div>

                <div className="relative z-10 flex flex-col justify-between p-16 w-full">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-black text-2xl">R</span>
                        </div>
                        <h1 className="text-white text-3xl font-bold tracking-tight italic">Rubix Schools</h1>
                    </div>

                    {/* Value Proposition */}
                    <div className="max-w-md">
                        <h2 className="text-white text-5xl font-extrabold leading-tight mb-6">
                            Smart School <br /> 
                            <span className="text-indigo-400">Management.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Empowering educators and students with real-time insights, 
                            automated attendance, and seamless communication.
                        </p>
                    </div>

                    {/* Footer/Stat badges */}
                    <div className="flex gap-8">
                        <div>
                            <p className="text-white font-bold text-xl">2026</p>
                            <p className="text-slate-500 text-xs uppercase tracking-widest">Next-Gen Edition</p>
                        </div>
                        <div className="w-px h-10 bg-slate-800" />
                        <div>
                            <p className="text-white font-bold text-xl">Cloud</p>
                            <p className="text-slate-500 text-xs uppercase tracking-widest">Always Synced</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORM */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50">
                {/* Mobile-only Logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <span className="text-slate-900 font-bold text-2xl">Spark</span>
                </div>

                <div className="w-full max-w-md">
                    <SignIn 
                        path="/sign-in" 
                        routing="path" 
                        signUpUrl="/sign-up" 
                        appearance={{
                            elements: {
                                card: "shadow-2xl border border-slate-200/50 rounded-3xl",
                                headerTitle: "text-2xl font-bold text-slate-900",
                                headerSubtitle: "text-slate-500",
                                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case py-2.5 shadow-md shadow-indigo-200",
                                socialButtonsBlockButton: "border-slate-200 hover:bg-white hover:border-slate-300 transition-all duration-200 text-slate-600 font-medium",
                                formFieldInput: "rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all",
                                footerActionLink: "text-indigo-600 hover:text-indigo-700 font-semibold"
                            }
                        }}
                    />
                </div>
                
                <p className="mt-8 text-slate-400 text-sm">
                    © 2026 Spark Systems. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default LoginPage;