import React from "react";

interface PillarsIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PillarsIcon({ className = "h-8 w-8", size = "md" }: PillarsIconProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const selectedSize = className ? className : sizeMap[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${selectedSize}`}>
      <img
        src="/pillars-transparent.png"
        alt="Wakheel 3 Pillars Logo"
        className="h-full w-full object-contain drop-shadow-sm transition-transform hover:scale-105"
      />
    </div>
  );
}
