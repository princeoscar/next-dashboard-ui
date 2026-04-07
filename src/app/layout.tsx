import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// 1. Optimized Font Loading
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Allows for 'font-sans' in tailwind.config
});

export const metadata: Metadata = {
  title: "Rubix Schools | Premium Management System",
  description: "Next-generation academic orchestration and administration.",
  icons: {
    icon: "/logo.png", // Ensures your branding shows in the browser tab
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
      colorPrimary: "#4F46E5", // Rubix Indigo
      colorTextOnPrimaryBackground: "white",
      borderRadius: "0.75rem", // Matches your rounded-xl feel
      fontFamily: "var(--font-inter)", // Uses your optimized Inter font
    },
  }}
  afterSignOutUrl="/" 
  signInFallbackRedirectUrl="/dashboard"
>
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
          {children}
          
          {/* Global Notification System */}
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