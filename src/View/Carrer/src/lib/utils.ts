import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Shown when API `org_name` is missing or empty (career portal branding). */
export const CAREER_ORG_NAME_FALLBACK = "Veevo Tech"

/**
 * Resolves API `org_name` for UI. Falls back to {@link CAREER_ORG_NAME_FALLBACK}.
 * Normalizes underscores to spaces (e.g. Testing_Hassan → Testing Hassan).
 */
export function getCareerOrgDisplayName(orgName?: string | null): string {
  const raw = orgName?.trim()
  if (!raw) return CAREER_ORG_NAME_FALLBACK
  return raw.replace(/_/g, " ")
}
