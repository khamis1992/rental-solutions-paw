
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    numberingSystem: 'latn'  // This ensures Western Arabic (Latin) numerals
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'PPP');
}
