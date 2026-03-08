/**
 * Shared utility functions that are purely presentational/computational.
 * No API calls or side effects.
 */

/** Join class names, filtering out falsy values. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Get today's date as YYYY-MM-DD. */
export function getTodayDate(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/** Format an ISO date string to DD/MM/YYYY. */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/** Format a name with proper capitalization. */
export function formatName(name: string): string {
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
}

/** Generate an institutional email prefix from first + last name. */
export function generateEmailPrefix(firstName: string, lastName: string): string {
  if (!firstName || !lastName) return "";
  const firstLetter = firstName.charAt(0).toLowerCase();
  const lastNameFormatted = lastName.toLowerCase().replace(/\s+/g, "");
  return `${firstLetter}${lastNameFormatted}`;
}

/** Validate email format. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Color palette for use with ID-based color assignment.
 * Returns consistent color for a given numeric ID.
 */
const LABEL_COLORS = [
  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
] as const;

export function getLabelColor(id: number) {
  return LABEL_COLORS[id % LABEL_COLORS.length];
}
