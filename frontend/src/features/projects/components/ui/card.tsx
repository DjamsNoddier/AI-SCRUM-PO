// src/components/ui/card.tsx
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ className = "", children }: CardProps) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-xl shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }: CardProps) {
  return <div className={`p-6 pb-3 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }: CardProps) {
  return <h3 className={`text-base font-semibold ${className}`}>{children}</h3>;
}

export function CardContent({ className = "", children }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}
