"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { TraditionalVsWakheelSection } from "@/components/TraditionalVsWakheelSection";
import { ResearchSection } from "@/components/ResearchSection";
import { PlatformSection } from "@/components/PlatformSection";
import { RoleSpacesSection } from "@/components/RoleSpacesSection";
import { CustomersSection } from "@/components/CustomersSection";
import { SecuritySection } from "@/components/SecuritySection";
import { PricingSection } from "@/components/PricingSection";
import { CompanySection } from "@/components/CompanySection";
import { AICopilotModal } from "@/components/AICopilotModal";
import { Footer } from "@/components/Footer";

export function HomePageView() {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Sections */}
      <main className="flex-1">
        {/* 1. Hero with Live Console */}
        <HeroSection />

        {/* 2. Signature Traditional vs. Wakheel Comparison */}
        <TraditionalVsWakheelSection />

        {/* 3. Precedent & Statutory Research Engine (#research) */}
        <ResearchSection />

        {/* 4. The 3 Pillars Platform Architecture (#platform) */}
        <PlatformSection />

        {/* 5. Role-Tailored Workspaces & Solutions (#solutions) */}
        <RoleSpacesSection
          onOpenAICopilot={() => setCopilotOpen(true)}
        />

        {/* 6. Customers Section (#customers) */}
        <CustomersSection />

        {/* 7. Security Section (#security) */}
        <SecuritySection />

        {/* 8. Transparent Pricing Matrix (#pricing) */}
        <PricingSection />

        {/* 9. Company & Mission Section (#company) */}
        <CompanySection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive AI Copilot Modal */}
      <AICopilotModal
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </div>
  );
}
