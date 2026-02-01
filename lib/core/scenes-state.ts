"use client"

import { useCallback, useMemo, useState } from "react"
import type { AccessRole, Scene } from "@/lib/core/types"
import { canCreateScene as canCreateSceneCore, normalizeNextScenes } from "@/lib/core/scenes-guard"

export function useScenesState(opts: { currentUserAccess: AccessRole; adminHasActiveSubscription: boolean }) {
  const { currentUserAccess, adminHasActiveSubscription } = opts
  const [scenes, setScenesState] = useState<Scene[]>([])

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
    },
    [currentUserAccess, adminHasActiveSubscription],
  )

  // (по избор) ако искаш да няма нови функции на всеки render:
  return useMemo(
    () => ({
      scenes,
      setScenes,
      canCreateScene,
    }),
    [scenes, setScenes, canCreateScene],
  )
}
