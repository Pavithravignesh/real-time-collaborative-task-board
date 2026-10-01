"use client";

import Navbar from "@/components/navbar";
import { PricingTable } from "@clerk/nextjs";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Choose your plan
          </h1>
          <p className="text-gray-600">
            Upgrade to create unlimited boards.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <PricingTable newSubscriptionRedirectUrl="/dashboard" />
        </div>
      </main>
    </div>
  );
}
