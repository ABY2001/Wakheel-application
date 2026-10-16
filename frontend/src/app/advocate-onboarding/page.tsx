"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AdvocateOnboardingQuestionnaire } from "@/components/advocate/AdvocateOnboardingQuestionnaire";

export default function AdvocateOnboardingPage() {
  const router = useRouter();

  return (
    <AdvocateOnboardingQuestionnaire
      onComplete={() => {
        router.push("/advocate-workspace");
      }}
      onSkip={() => {
        try {
          localStorage.setItem("wakheel_advocate_onboarded", "true");
        } catch {
          // ignore
        }
        router.push("/advocate-workspace");
      }}
    />
  );
}
