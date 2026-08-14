import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * The shadcn class helper: conditional classes via clsx, then tailwind-merge to
 * resolve conflicts so a caller's `px-8` actually beats a component's `px-4`
 * instead of both landing in the class list and the cascade picking.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
