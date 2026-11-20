"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StudentDashboardView } from "@/components/academy/StudentDashboardView";

export default function StudentHomePage() {
  const router = useRouter();

  const handleSwitchToTeacher = () => {
    localStorage.setItem("wakheel_academy_role", "teacher");
    router.push("/teacher/home");
  };

  const handleSignOut = () => {
    localStorage.removeItem("wakheel_academy_user");
    localStorage.removeItem("wakheel_academy_student");
    localStorage.removeItem("wakheel_academy_token");
    localStorage.removeItem("wakheel_academy_role");
    router.push("/academy/auth?role=student");
  };

  return (
    <StudentDashboardView
      onSwitchToTeacher={handleSwitchToTeacher}
      onSignOut={handleSignOut}
    />
  );
}
