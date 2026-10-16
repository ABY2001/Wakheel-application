"use client";

import React from "react";
import { GetStartedView } from "@/components/pages/GetStartedView";

export function LoginView() {
  return <GetStartedView initialAuthMode="signin" />;
}
