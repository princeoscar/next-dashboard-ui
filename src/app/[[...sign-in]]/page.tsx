"use client";

import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react' // Added useState
import { ShieldCheck, KeyRound, Eye, EyeOff } from 'lucide-react' // Added Eye icons

const LoginPage = () => {
    const { isLoaded, isSignedIn, user } = useUser()
    const router = useRouter()
    
    // 👁️ State to toggle password visibility
    const [showPassword, setShowPassword] = useState(false)

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

    if (!isLoaded) return null;

    return (
        <div className='relative h-screen w-full flex items-center justify-center overflow-hidden font-sans'>
            <div className='absolute inset-0 -z-10'>
                <Image 
                    src="/school.jpg" 
                    alt="School Building"
                    fill
                    priority
                    className='object-cover scale-105 blur-[2px]' 
                />
                <div className='absolute inset-0 bg-slate-900/60 backdrop-overlay' />
            </div>

            <SignIn.Root>
                <SignIn.Step 
                    name='start' 
                    className='relative bg-white/10 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col gap-6 w-[90%] max-w-[450px] transition-all animate-in fade-in zoom-in duration-500'
                >
                    <div className='flex flex-col items-center text-center gap-4 mb-2'>
                        <div className='p-4 bg-white rounded-3xl shadow-xl'>
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
                        </div>
                        <div>
                            <h1 className='text-3xl font-black text-white tracking-tighter uppercase'>
                                Rubix <span className='text-blue-400'>Schools</span>
                            </h1>
                            <p className='text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mt-1'>
                                Secure Portal Access
                            </p>
                        </div>
                    </div>

                    <Clerk.GlobalError className='text-xs text-rose-400 font-bold bg-rose-400/10 p-3 rounded-xl border border-rose-400/20 text-center' />

                    <div className='space-y-4'>
                        <Clerk.Field name='identifier' className='flex flex-col gap-2'>
                            <Clerk.Label className='text-[10px] font-black text-white/70 uppercase tracking-widest ml-1'>
                                Username / Email
                            </Clerk.Label>
                            <Clerk.Input 
                                type='text' 
                                required 
                                className='w-full p-4 rounded-2xl bg-black/40 text-white border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-white/20'
                                placeholder='Enter your ID'
                            />
                            <Clerk.FieldError className='text-[10px] font-bold text-rose-400 ml-1' />
                        </Clerk.Field>

                        <Clerk.Field name='password' className='flex flex-col gap-2'>
                            <Clerk.Label className='text-[10px] font-black text-white/70 uppercase tracking-widest ml-1'>
                                Password
                            </Clerk.Label>
                            {/* 👁️ Wrapper for the toggle */}
                            <div className='relative'>
                                <Clerk.Input 
                                    type={showPassword ? 'text' : 'password'} // Switches type
                                    required 
                                    className='w-full p-4 rounded-2xl bg-black/40 text-white border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all pr-12'
                                    placeholder='••••••••'
                                />
                                <button
                                    type="button" // CRITICAL: keeps button from submitting form
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors'
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <Clerk.FieldError className='text-[10px] font-bold text-rose-400 ml-1' />
                        </Clerk.Field>
                    </div>

                    <SignIn.Action submit className='group relative flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl text-[12px] uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98] mt-2'>
                        <KeyRound size={16} className='group-hover:rotate-12 transition-transform' />
                        Authorize Session
                    </SignIn.Action>

                    <div className='flex items-center justify-center gap-2 mt-2 opacity-30'>
                        <ShieldCheck size={12} className='text-white' />
                        <span className='text-[9px] font-bold text-white uppercase tracking-tighter'>
                            End-to-End Encrypted Verification
                        </span>
                    </div>
                </SignIn.Step>
            </SignIn.Root>      
        </div>
    )
}
export default LoginPage