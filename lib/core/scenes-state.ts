"use client"

import { useCallback, useMemo, useState } from "react"
import type { AccessRole, Scene } from "@/lib/core/types"
import { canCreateScene as canCreateSceneCore, normalizeNextScenes } from "@/lib/core/scenes-guard"
import { loadScenes, saveScenes } from "@/lib/core/scenes-persistence"

// ✅ opts is optional + safe defaults (prevents "destructure of undefined")
export function useScenesState(opts?: { currentUserAccess?: AccessRole; adminHasActiveSubscription?: boolean }) {
  const currentUserAccess: AccessRole = opts?.currentUserAccess ?? "admin"
  const adminHasActiveSubscription: boolean = opts?.adminHasActiveSubscription ?? false

  const [scenes, setScenesState] = useState<Scene[]>(() => loadScenes())

  const canCreateScene = useCallback(() => {
    return canCreateSceneCore({
      currentUserAccess,
      adminHasActiveSubscription,
      scenesCount: scenes.length,
    })
  }, [currentUserAccess, adminHasActiveSubscription, scenes.length])

  const setScenes = useCallback(
    (next: Scene[]) => {
      const normalized = normalizeNextScenes({ currentUserAccess, adminHasActiveSubscription, next })
      setScenesState(normalized)
      saveScenes(normalized)
    },
    [currentUserAccess, adminHasActiveSubscription],
  )

  return useMemo(
    () => ({
      scenes,
      setScenes,
      canCreateScene,
    }),
    [scenes, setScenes, canCreateScene],
  )
}
