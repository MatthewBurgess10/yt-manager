import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeHtmlEntities(text: string): string {
  if (typeof window === "undefined") {
    // Server-side: use basic replacements
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#x2F;/g, "/")
      .replace(/<br\s*\/?>/gi, "\n")
  }

  // Client-side: use DOMParser for accurate decoding
  const textarea = document.createElement("textarea")
  textarea.innerHTML = text
  return textarea.value.replace(/<br\s*\/?>/gi, "\n")
}
