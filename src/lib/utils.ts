import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock delay function for our "Architectural Illusion"
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
