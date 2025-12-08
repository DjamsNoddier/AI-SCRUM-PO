import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes with conditionals
 * and merges conflicting classes automatically.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
