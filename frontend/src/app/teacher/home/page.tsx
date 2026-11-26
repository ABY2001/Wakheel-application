"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TeacherDashboardView } from "@/components/academy/TeacherDashboardView";

export default function TeacherHomePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("wakheel_academy_role");
    if (role === "teacher" || role === "faculty" || role === "admin") {
      setAuthorized(true);
    } else if (role === "student") {
      router.replace("/student/home");
    } else {
      router.replace("/academy/auth?role=teacher");
    }
  }, [router]);

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

  if (!authorized) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-xs font-mono text-zinc-500">
        Verifying Faculty Studio access...
      </div>
    );
  }

  return (
    <TeacherDashboardView
      onSwitchToStudent={handleSwitchToStudent}
      onSignOut={handleSignOut}
    />
  );
}
