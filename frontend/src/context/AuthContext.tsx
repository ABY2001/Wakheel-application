"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, AuthResponse, UserRole } from "@/lib/api";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  accountType?: string;
  barCouncilId?: string;
  firmName?: string;
  teamSize?: string;
  firmRegistration?: string;
  icsiNumber?: string;
  icaiNumber?: string;
  phone?: string;
  verifyMethod?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; role?: UserRole }) => Promise<AuthResponse>;
  register: (data: Parameters<typeof authApi.register>[0]) => Promise<AuthResponse>;
  verifyOtp: (data: { phone: string; otp: string; role?: UserRole }) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize state from storage
  const syncFromStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const storedToken = localStorage.getItem("wakheel_token");
      const storedUser = localStorage.getItem("wakheel_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken(null);
        setUser(null);
      }
    } catch {
      // ignore JSON parse error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate & validate on mount
  useEffect(() => {
    syncFromStorage();

    const storedToken = typeof window !== "undefined" ? localStorage.getItem("wakheel_token") : null;
    if (storedToken) {
      // Background validate token
      authApi
        .getMe(storedToken)
        .then((res) => {
          if (res.success && res.user) {
            setUser(res.user as AuthUser);
            localStorage.setItem("wakheel_user", JSON.stringify(res.user));
          }
        })
        .catch(() => {
          // If token rejected, don't crash, leave cached user or log out
        });
    }

    // Listen for storage events across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "wakheel_token" || e.key === "wakheel_user") {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [syncFromStorage]);

  // Login handler
  const login = async (credentials: { email: string; password: string; role?: UserRole }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user as AuthUser);
        localStorage.setItem("wakheel_token", res.token);
        localStorage.setItem("wakheel_user", JSON.stringify(res.user));

        // If firm user, populate default firm profile for zero-configuration workspace access
        if (res.user.role === "cs" || res.user.role === "ca") {
          const firmProfile = {
            name: res.user.firmName || "Apex Law & Corporate Partners LLP",
            founderName: res.user.fullName || (res.user.role === "ca" ? "CA Ramanathan Iyer" : "CS Rajesh Sharma"),
            category: res.user.role,
            registrationCin: res.user.firmRegistration || "LLPIN-AAR-4192 / D/1942/2012",
            isAccredited: true,
          };
          localStorage.setItem("wakheel_firm_profile", JSON.stringify(firmProfile));
        }
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (data: Parameters<typeof authApi.register>[0]): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user as AuthUser);
        localStorage.setItem("wakheel_token", res.token);
        localStorage.setItem("wakheel_user", JSON.stringify(res.user));

        if (res.user.role === "cs" || res.user.role === "ca") {
          const firmProfile = {
            name: data.firmName || "Apex Law & Corporate Partners LLP",
            founderName: data.fullName,
            category: res.user.role,
            registrationCin: data.firmRegistration || "LLPIN-AAR-4192 / D/1942/2012",
            isAccredited: true,
          };
          localStorage.setItem("wakheel_firm_profile", JSON.stringify(firmProfile));
        }
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  // OTP verify handler
  const verifyOtp = async (data: { phone: string; otp: string; role?: UserRole }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyWhatsAppOtp(data);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user as AuthUser);
        localStorage.setItem("wakheel_token", res.token);
        localStorage.setItem("wakheel_user", JSON.stringify(res.user));
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("wakheel_token");
      localStorage.removeItem("wakheel_user");
      localStorage.removeItem("wakheel_advocate_first_signup");
    }
    setToken(null);
    setUser(null);
  }, []);

  // Refresh user profile
  const refreshUser = async () => {
    const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("wakheel_token") : null);
    if (!currentToken) return;
    try {
      const res = await authApi.getMe(currentToken);
      if (res.success && res.user) {
        setUser(res.user as AuthUser);
        localStorage.setItem("wakheel_user", JSON.stringify(res.user));
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
