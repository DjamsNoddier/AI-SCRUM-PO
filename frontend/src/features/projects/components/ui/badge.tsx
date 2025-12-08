// src/components/ui/badge.tsx
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[13px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}
