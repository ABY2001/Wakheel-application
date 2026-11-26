"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentDashboardView } from "@/components/academy/StudentDashboardView";

export default function StudentLearnPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("wakheel_academy_role");
    if (role === "student" || role === "admin") {
      setAuthorized(true);
    } else if (role === "teacher" || role === "faculty") {
      router.replace("/teacher/home");
    } else {
      router.replace("/academy/auth?role=student");
    }
  }, [router]);

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

  if (!authorized) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center text-xs font-mono text-zinc-500">
        Verifying Student Curriculum access...
      </div>
    );
  }

  return (
    <StudentDashboardView
      initialSection="learn"
      onSwitchToTeacher={handleSwitchToTeacher}
      onSignOut={handleSignOut}
    />
  );
}
