import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateTransactionFee(amount: number): number {
  if (amount <= 0) return 0;
  
  let fee: number;

  if (amount <= 100) {
    // 0.75% for amounts up to 100
    fee = amount * 0.0075;
  } else {
    // 1% for amounts above 100
    fee = amount * 0.01;
  }
  
  // Return the fee rounded to 2 decimal places
  return Math.round(fee * 100) / 100;
}

    