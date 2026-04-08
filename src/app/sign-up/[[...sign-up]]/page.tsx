"use client";

import { SignUp } from "@clerk/nextjs";

// CORRECTION: Ensure this is a standard "const" with a "default export" at the bottom
const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
      {/* CORRECTION: path must match your folder name exactly */}
      <SignUp 
        path="/sign-up" 
        routing="path" 
        signInUrl="/sign-in" 
      />
    </div>
  );
};

export default SignUpPage;