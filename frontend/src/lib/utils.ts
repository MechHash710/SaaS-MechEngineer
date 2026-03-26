import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitário para combinar classes do Tailwind sem conflitos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
