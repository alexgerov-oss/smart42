"use client"

import { useCallback, useMemo, useState } from "react"
import type { AccessRole, Scene } from "@/lib/core/types"
import { canCreateScene as canCreateSceneCore, normalizeNextScenes } from "@/lib/core/scenes-guard"
import { loadScenes, saveScenes } from "@/lib/core/scenes-persistence"

// ✅ opts is optional + safe defaults (prevents "destructure of undefined")
export function useScenesState(opts?: { currentUserAccess?: AccessRole; hasPlan?: boolean; doorId?: string }) {
  const currentUserAccess: AccessRole = opts?.currentUserAccess ?? "admin"
  const hasPlan: boolean = opts?.hasPlan ?? false
  const doorId = opts?.doorId

  const [scenesState, setScenesState] = useState<{ doorId?: string; scenes: Scene[] }>(() => ({
    doorId,
    scenes: loadScenes([], doorId),
  }))

  const scenes = scenesState.doorId === doorId ? scenesState.scenes : loadScenes([], doorId)

  const canCreateScene = useCallback(() => {
    return canCreateSceneCore({
      currentUserAccess,
      hasPlan,
      scenesCount: scenes.length,
    })
  }, [currentUserAccess, hasPlan, scenes.length])

  const setScenes = useCallback(
    (next: Scene[]) => {
      const normalized = normalizeNextScenes({ currentUserAccess, hasPlan, next })
      setScenesState({ doorId, scenes: normalized })
      saveScenes(normalized, doorId)
    },
    [currentUserAccess, hasPlan, doorId],
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
