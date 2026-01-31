// lib/core/permissions.ts
import type { AccessRole, EntityType } from "./types"

export function canRenameEntity(role: AccessRole, entityType: EntityType): boolean {
  // сцените може да се преименуват от всички роли (както е било)
  if (entityType === "scenes") return true

  // за останалото: admin и full могат
  return role === "admin" || role === "full"
}
