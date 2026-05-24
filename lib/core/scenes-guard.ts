import type { Scene, AccessRole } from "@/lib/core/types"

export function canCreateScene(params: {
  currentUserAccess: AccessRole
  hasPlan: boolean
  scenesCount: number
}): boolean {
  if (params.currentUserAccess === "open-close") return false
  return params.hasPlan ? true : params.scenesCount < 1
}

export function normalizeNextScenes(params: {
  currentUserAccess: AccessRole
  hasPlan: boolean
  next: Scene[]
}): Scene[] {
  if (params.currentUserAccess === "open-close") return []
  if (!params.hasPlan && params.next.length > 1) return params.next.slice(0, 1)
  return params.next
}
