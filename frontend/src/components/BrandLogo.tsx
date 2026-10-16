"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  subtitleText?: string;
  hideText?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showSubtitle = true,
  subtitleText = "PROTECT • ADVISE • EMPOWER",
  hideText = false,
  href = "/",
  className = "",
}: BrandLogoProps) {
  const imgSizes = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto",
    lg: "h-12 w-auto",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const content = (
    <div className={`relative group inline-flex items-center gap-3 ${className}`}>
      <img
        src="/logo-transparent.png"
        alt="wakheel logo"
        className={`${imgSizes[size]} object-contain transition-transform group-hover:scale-105 drop-shadow-xs shrink-0`}
      />
      {!hideText && (
        <div className="flex flex-col text-left">
          <span className={`${textSizes[size]} font-bold tracking-tight text-black dark:text-white leading-none`}>
            wakheel
          </span>
          {showSubtitle && (
            <span className="text-[9px] tracking-[0.16em] text-zinc-500 font-bold uppercase mt-1">
              {subtitleText}
            </span>
          )}
        </div>
      )}

      {/* Hover Info Tooltip: Shows what clicking the logo will do */}
      <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 border border-zinc-700 dark:border-zinc-300">
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-700 dark:border-zinc-300">
          <span className="font-bold text-xs">wakheel</span>
          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700">
            Chamber OS
          </span>
        </div>
        <p className="text-[11px] text-zinc-300 dark:text-zinc-700 leading-snug">
          <span className="font-bold text-white dark:text-black">What it does: </span>
          Navigates back to the main homepage and command overview.
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
