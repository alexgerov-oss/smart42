"use client"

import { useControllersState } from "@/lib/core/controllers-state"

export function useControllersWiring(opts: { canOperate: boolean }) {
  const {
    controllers,
    addController,
    updateController,
    removeController,
    updateControllerStatus,
    getActiveController,
    restartController,
  } = useControllersState({ canOperate: opts.canOperate })

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
