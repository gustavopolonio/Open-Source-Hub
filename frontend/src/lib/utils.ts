import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAndSessionStoreCsrfToken() {
  const csrfToken = crypto.randomUUID();
  sessionStorage.setItem("oauth_csrf", csrfToken);
  return csrfToken;
}
