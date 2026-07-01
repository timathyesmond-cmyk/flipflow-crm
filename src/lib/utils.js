import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

export const APP_URL = 'https://flipflowcrm.com';

/** Decode a base64 referral code (padding stripped on encode). */
export function decodeReferralCode(refCode) {
  const padded = refCode + '='.repeat((4 - (refCode.length % 4)) % 4);
  return atob(padded);
}
