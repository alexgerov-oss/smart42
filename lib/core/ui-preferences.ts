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
  const [version, setVersion] = React.useState(0)

  React.useEffect(() => {
    const onChange = () => setVersion((v) => v + 1)
    window.addEventListener(EVENT_NAME, onChange)

    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_QUICK_CONTROLS_LOCKED) onChange()
    }
    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener(EVENT_NAME, onChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const quickControlsLocked = React.useMemo(() => {
    return loadQuickControlsLocked(false)
  }, [version])

  const setQuickControlsLocked = React.useCallback((locked: boolean) => {
    saveQuickControlsLocked(locked)
    // прави UI update веднага
    setVersion((v) => v + 1)
  }, [])

  return { quickControlsLocked, setQuickControlsLocked }
}
