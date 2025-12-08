// src/components/ui/button.tsx
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  onClick,
  className = "",
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 transition ${className}`}
    >
      {children}
    </button>
  );
}
