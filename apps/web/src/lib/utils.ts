import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(content: string): number {
    // Average reading speed in words per minute
    const WORDS_PER_MINUTE = 200;
    
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    
    // Calculate reading time in minutes
    const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE);
    
    // Return at least 1 minute
    return Math.max(1, readingTime);
}


export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  // MM/DD/YYYY
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}
