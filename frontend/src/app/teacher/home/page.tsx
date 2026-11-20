"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TeacherDashboardView } from "@/components/academy/TeacherDashboardView";

export default function TeacherHomePage() {
  const router = useRouter();

  const handleSwitchToStudent = () => {
    localStorage.setItem("wakheel_academy_role", "student");
    router.push("/student/home");
  };

  const handleSignOut = () => {
    localStorage.removeItem("wakheel_academy_user");
    localStorage.removeItem("wakheel_academy_teacher");
    localStorage.removeItem("wakheel_academy_token");
    localStorage.removeItem("wakheel_academy_role");
    router.push("/academy/auth?role=teacher");
  };

  return (
    <TeacherDashboardView
      onSwitchToStudent={handleSwitchToStudent}
      onSignOut={handleSignOut}
    />
  );
}
