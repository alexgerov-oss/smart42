"use client"

import { useControllersState } from "@/lib/core/controllers-state"

// ✅ opts optional + safe default
export function useControllersWiring(opts?: { canOperate?: boolean }) {
  const canOperate = opts?.canOperate ?? false

  const {
    controllers,
    addController,
    updateController,
    removeController,
    updateControllerStatus,
    getActiveController,
    restartController,
  } = useControllersState({ canOperate })

  return {
    controllers,
    addController,
    updateController,
    removeController,
    updateControllerStatus,
    getActiveController,
    restartController,
  }
}
