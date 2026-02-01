"use client"

import { useState } from "react"
import { loadQuickControlsLocked, saveQuickControlsLocked } from "@/lib/core/ui-preferences"

export function useQuickControlsState() {
  const [quickControlsLocked, setQuickControlsLockedState] = useState<boolean>(() => loadQuickControlsLocked())

  const setQuickControlsLocked = (locked: boolean) => {
    setQuickControlsLockedState(locked)
    saveQuickControlsLocked(locked)
  }

  return { quickControlsLocked, setQuickControlsLocked }
}
