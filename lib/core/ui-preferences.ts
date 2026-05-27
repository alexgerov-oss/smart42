"use client"

import * as React from "react"

const KEY_QUICK_CONTROLS_LOCKED = "quickControlsLocked"
const EVENT_NAME = "smart42:ui-preferences-changed"

function doorScopedKey(baseKey: string, doorId?: string): string {
  return doorId ? `${baseKey}:${doorId}` : baseKey
}

function emitUiPreferencesChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(EVENT_NAME))
}

/**
 * Старите exports остават, но вече могат да работят и по doorId.
 */
export function loadQuickControlsLocked(fallback = false, doorId?: string): boolean {
  if (typeof window === "undefined") return fallback

  try {
    const raw = window.localStorage.getItem(doorScopedKey(KEY_QUICK_CONTROLS_LOCKED, doorId))
    if (raw === null) return fallback
    return raw === "true" || raw === "1"
  } catch {
    return fallback
  }
}

export function saveQuickControlsLocked(locked: boolean, doorId?: string): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(doorScopedKey(KEY_QUICK_CONTROLS_LOCKED, doorId), locked ? "true" : "false")
  } catch {
    // ignore
  }

  emitUiPreferencesChanged()
}

/**
 * Новият export, който app-context.tsx търси.
 */
export function useUiPreferences(opts?: { doorId?: string }) {
  const doorId = opts?.doorId

  const [quickControlsState, setQuickControlsState] = React.useState<{ doorId?: string; locked: boolean }>(() => ({
    doorId,
    locked: loadQuickControlsLocked(false, doorId),
  }))

  const quickControlsLocked =
    quickControlsState.doorId === doorId ? quickControlsState.locked : loadQuickControlsLocked(false, doorId)

  const syncFromStorage = React.useCallback(() => {
    setQuickControlsState({
      doorId,
      locked: loadQuickControlsLocked(false, doorId),
    })
  }, [doorId])

  React.useEffect(() => {
    if (typeof window === "undefined") return

    window.addEventListener(EVENT_NAME, syncFromStorage)

    const onStorage = (e: StorageEvent) => {
      if (e.key === doorScopedKey(KEY_QUICK_CONTROLS_LOCKED, doorId)) syncFromStorage()
    }

    window.addEventListener("storage", onStorage)

    return () => {
      window.removeEventListener(EVENT_NAME, syncFromStorage)
      window.removeEventListener("storage", onStorage)
    }
  }, [doorId, syncFromStorage])

  const setQuickControlsLocked = React.useCallback(
    (locked: boolean) => {
      saveQuickControlsLocked(locked, doorId)
      setQuickControlsState({ doorId, locked })
    },
    [doorId],
  )

  return { quickControlsLocked, setQuickControlsLocked }
}
