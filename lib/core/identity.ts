// lib/core/identity.ts
import type { AccessRole } from "./types"

export function getCurrentUserId(role: AccessRole): string {
  if (role === "admin") return "admin-1"
  if (role === "full") return "full-1"
  return "open-close-1"
}
