// @ts-expect-error TS(2792): Cannot find module 'clsx'. Did you mean to set the... Remove this comment to see the full error message
import { clsx, type ClassValue } from 'clsx';
// @ts-expect-error TS(2792): Cannot find module 'tailwind-merge'. Did you mean ... Remove this comment to see the full error message
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
