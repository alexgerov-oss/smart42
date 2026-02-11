"use client"

import * as React from "react"

const KEY_QUICK_CONTROLS_LOCKED = "quickControlsLocked"
const EVENT_NAME = "smart42:ui-preferences-changed"

function emitUiPreferencesChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(EVENT_NAME))
}

/**
 * Старите exports (за да не чупим други места)
 */
export function loadQuickControlsLocked(fallback = false): boolean {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(KEY_QUICK_CONTROLS_LOCKED)
    if (raw === null) return fallback
    return raw === "true" || raw === "1"
  } catch {
    return fallback
  }
}

export function saveQuickControlsLocked(locked: boolean): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY_QUICK_CONTROLS_LOCKED, locked ? "true" : "false")
  } catch {
    // ignore
  }
  emitUiPreferencesChanged()
}

/**
 * Новият export, който app-context.tsx търси
 */
export function useUiPreferences() {
  const [quickControlsLocked, setQuickControlsLockedState] = React.useState<boolean>(() =>
    loadQuickControlsLocked(false),
  )

  const syncFromStorage = React.useCallback(() => {
    setQuickControlsLockedState(loadQuickControlsLocked(false))
  }, [])

  React.useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener(EVENT_NAME, syncFromStorage)

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_QUICK_CONTROLS_LOCKED) syncFromStorage()
    }
    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener(EVENT_NAME, syncFromStorage)
      window.removeEventListener("storage", onStorage)
    }
  }, [syncFromStorage])

  const setQuickControlsLocked = React.useCallback((locked: boolean) => {
    saveQuickControlsLocked(locked)
    // UI update веднага (без да чакаме event)
    setQuickControlsLockedState(locked)
  }, [])

  return { quickControlsLocked, setQuickControlsLocked }
}
