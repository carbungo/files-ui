"use client";

export function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;samesite=lax`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? (match[2] ?? null) : null;
}
