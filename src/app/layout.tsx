import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Load the premium font for logos/titles
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"], // Use bold weight
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  title: "Rubix Schools Admin Dashboard",
  description: "Secure school management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          helpPageUrl: "https://your-support-link.com", // Optional: redirects help links
          logoPlacement: "none",
        },
        elements: {
          footer: "hidden",
          // Wrap this in quotes because it has a hyphen!
          "clerk-branding": "hidden",
          // Specifically target the "Development Mode" and badge
          internal: "display-none",
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} ${playfair.variable} font-inter antialiased`} suppressHydrationWarning>
          {children}
          <ToastContainer position="bottom-right" theme="dark" />
        </body>
      </html>
    </ClerkProvider>
  );
}