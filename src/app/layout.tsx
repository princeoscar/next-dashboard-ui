import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from 'react-toastify';
import { Suspense } from "react";
import 'react-toastify/dist/ReactToastify.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Loading from "./(dashboard)/list/loading";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', 
});

export const metadata: Metadata = {
  title: "Rubix Schools | Premium Management System",
  description: "Next-generation academic orchestration and administration.",
  icons: {
    icon: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#4F46E5", 
          colorTextOnPrimaryBackground: "white",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-inter)",
        },
      }}
      afterSignOutUrl="/" 
      signInFallbackRedirectUrl="/dashboard"
    >
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900`} suppressHydrationWarning={true}>
          
          {/* By wrapping children in Suspense and passing your Loading component 
              as the fallback, the user sees your shimmer UI instead of a blank screen.
          */}
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
          
          <ToastContainer 
            position="bottom-right" 
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            toastClassName="rounded-2xl font-sans text-[12px] font-bold tracking-tight border border-white/10"
          />
        </body>
      </html>
    </ClerkProvider> 
  );
}