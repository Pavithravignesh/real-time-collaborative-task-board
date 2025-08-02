"use client";

import { SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";

export default function HomePage() {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A simple real time task management system. Kindly do signin
          </p>
        </div>
      </section>
    </div>
  );
}
