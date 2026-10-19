"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export type RoleOption = "advocate" | "client";
export type AuthMode = "signup" | "login";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: RoleOption;
  initialMode?: AuthMode;
}

export function AuthModal({
  isOpen,
  onClose,
  initialRole = "advocate",
  initialMode = "signup",
}: AuthModalProps) {
  const router = useRouter();
  const [role, setRole] = useState<RoleOption>(initialRole);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRole(initialRole);
      setMode(initialMode);
      setSuccess(false);
    }
  }, [isOpen, initialRole, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      setTimeout(() => {
        onClose();
        if (role === "advocate") {
          try {
            if (mode === "signup") {
              localStorage.setItem("wakheel_advocate_first_signup", "true");
              localStorage.removeItem("wakheel_advocate_onboarded");
              localStorage.removeItem("wakheel_advocate_profile");
            } else {
              localStorage.removeItem("wakheel_advocate_first_signup");
            }
            if (email || fullName) {
              localStorage.setItem(
                "wakheel_user",
                JSON.stringify({ email, fullName, role: "advocate" })
              );

              const registered = JSON.parse(localStorage.getItem("wakheel_registered_advocates") || "[]");
              let cleanAdvName = (fullName || email.split("@")[0] || "Advocate").trim();
              if (!cleanAdvName.toLowerCase().startsWith("adv.") && !cleanAdvName.toLowerCase().startsWith("adv ")) {
                cleanAdvName = `Adv. ${cleanAdvName}`;
              }
              const advItem = {
                id: `adv_${Date.now()}`,
                name: cleanAdvName,
                title: "Advocate • High Court of Kerala",
                location: "Ernakulam, Kerala",
                experience: "10+ Years Experience",
                rating: 5.0,
                reviewsCount: 1,
                matchScore: 99,
                specialties: ["Civil Litigation", "Constitutional Writs", "Commercial Law"],
                fee: "₹1,500 / session",
                email: email.trim(),
                barCouncilNumber: "K/001429/2024",
                isCurrentUser: true,
              };
              const updatedList = [advItem, ...registered.filter((a: any) => a.email !== email.trim())];
              localStorage.setItem("wakheel_registered_advocates", JSON.stringify(updatedList));
            }
          } catch {
            // ignore
          }
          router.push("/advocate-workspace");
        } else {
          router.push("/client-portal");
        }
      }, 800);
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        
        {/* Backdrop click dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Auth Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-black dark:text-white z-10"
        >
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-black dark:text-white">
                {mode === "signup" ? "Account Created" : "Welcome Back"}
              </h3>
              <p className="text-sm text-zinc-500">
                Opening your {role === "advocate" ? "Advocate Workspace" : "Client Portal"}...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header Title & Subtitle */}
              <div className="space-y-2 pr-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight leading-snug">
                  {mode === "signup" ? "Create your account" : "Log in to Wakheel"}
                </h2>
                <p className="text-sm text-zinc-500">
                  {mode === "signup"
                    ? "Choose your workspace to get started."
                    : "Access your legal workspace."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Role Dropdown */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      I am here as
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as RoleOption)}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white cursor-pointer"
                    >
                      <option value="advocate">An advocate</option>
                      <option value="client">An individual / client</option>
                    </select>
                  </div>
                )}

                {/* Full Name (Sign Up only) */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                )}

                {/* Email address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-black dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white"
                  />
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <span>
                    {isSubmitting
                      ? "Processing..."
                      : mode === "signup"
                      ? "Create account →"
                      : "Log in →"}
                  </span>
                </button>
              </form>

              {/* Mode Toggle Footer */}
              <div className="pt-2 text-center text-xs text-zinc-500">
                {mode === "signup" ? (
                  <span>
                    Already have an account?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="font-bold text-black dark:text-white hover:underline cursor-pointer"
                    >
                      Log in
                    </button>
                  </span>
                ) : (
                  <span>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setMode("signup")}
                      className="font-bold text-black dark:text-white hover:underline cursor-pointer"
                    >
                      Create account
                    </button>
                  </span>
                )}
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
