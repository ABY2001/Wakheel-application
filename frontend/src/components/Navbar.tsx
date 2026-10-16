"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, LogOut, Menu, X, Scale, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { BrandLogo } from "./BrandLogo";

interface NavbarProps {
  onOpenAuth?: (role: "advocate" | "client", mode: "signup" | "login") => void;
  isLoggedIn?: boolean;
  userRole?: "advocate" | "client";
  userName?: string;
}

export function Navbar({
  onOpenAuth,
  isLoggedIn = false,
  userRole = "client",
  userName = "Alex Morgan",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Standardized Logo Brand */}
          <BrandLogo size="md" />

          {/* Desktop Nav Links - Black & White Editorial */}
          <nav className="hidden lg:flex items-center space-x-5 xl:space-x-7 text-[12px] xl:text-[13px] font-semibold tracking-wide uppercase text-zinc-600 dark:text-zinc-400">
            {isLoggedIn ? (
              <>
                <Link
                  href={userRole === "advocate" ? "/advocate-workspace" : "/client-portal"}
                  className="text-black dark:text-white font-bold transition-colors"
                >
                  Workspace
                </Link>
                <Link href="#documents" className="hover:text-black dark:hover:text-white transition-colors">
                  Documents
                </Link>
                <Link href="#matters" className="hover:text-black dark:hover:text-white transition-colors">
                  Matters
                </Link>
              </>
            ) : (
              <>
                <Link href="/#research" className="hover:text-black dark:hover:text-white transition-colors">
                  Research
                </Link>
                <Link href="/#platform" className="hover:text-black dark:hover:text-white transition-colors">
                  Platform
                </Link>
                <Link href="/#solutions" className="hover:text-black dark:hover:text-white transition-colors">
                  Solutions
                </Link>
                <Link href="/#customers" className="hover:text-black dark:hover:text-white transition-colors">
                  Customers
                </Link>
                <Link href="/#security" className="hover:text-black dark:hover:text-white transition-colors">
                  Security
                </Link>
                <Link href="/#company" className="hover:text-black dark:hover:text-white transition-colors">
                  Company
                </Link>
                <Link href="/#pricing" className="hover:text-black dark:hover:text-white transition-colors">
                  Pricing
                </Link>
              </>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3.5">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs">
                    {userRole === "advocate" ? <Scale className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-black dark:text-white leading-none">{userName}</span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize leading-tight font-medium">
                      {userRole === "advocate" ? "Advocate Workspace" : "Citizen Portal"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => (onOpenAuth ? onOpenAuth("client", "login") : router.push("/login"))}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={() => (onOpenAuth ? onOpenAuth("client", "signup") : router.push("/get-started"))}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-black hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-full shadow-xs transition-all flex items-center gap-1.5 cursor-pointer group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 pt-3 pb-6 space-y-4">
          {isLoggedIn ? (
            <>
              <div className="py-2 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800">
                <User className="w-5 h-5 text-black dark:text-white" />
                <span className="text-sm font-semibold text-black dark:text-white">{userName} ({userRole})</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/#research"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white"
              >
                Research
              </Link>
              <Link
                href="/#platform"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white"
              >
                Platform
              </Link>
              <Link
                href="/#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white"
              >
                Solutions
              </Link>
              <Link
                href="/#customers"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white"
              >
                Customers
              </Link>
              <Link
                href="/#security"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white"
              >
                Security
              </Link>
              <Link
                href="/#company"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white"
              >
                Company
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold tracking-wide uppercase text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white"
              >
                Pricing
              </Link>
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col space-y-2.5">
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-black dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-full"
                >
                  Log in
                </Link>
                <Link
                  href="/get-started"
                  className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-full"
                >
                  Get Started
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
