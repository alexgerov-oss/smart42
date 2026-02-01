import type { Scene, AccessRole } from "@/lib/core/types"

export function canCreateScene(params: {
  currentUserAccess: AccessRole
  adminHasActiveSubscription: boolean
  scenesCount: number
}): boolean {
  if (params.currentUserAccess === "open-close") return false
  return params.adminHasActiveSubscription ? true : params.scenesCount < 1
}

export function normalizeNextScenes(params: {
  currentUserAccess: AccessRole
  adminHasActiveSubscription: boolean
  next: Scene[]
}): Scene[] {
  if (params.currentUserAccess === "open-close") return []
  if (!params.adminHasActiveSubscription && params.next.length > 1) return params.next.slice(0, 1)
  return params.next
}
