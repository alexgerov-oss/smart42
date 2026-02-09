"use client"

import { useCallback, useEffect, useRef } from "react"
import { doorActions } from "@/lib/core/door-actions"
import type { Door } from "@/lib/core/types"

export function useLockUnlockWiring(args: {
  doors: Door[]
  doorState: "lock" | "unlock"
  setDoorState: (state: "lock" | "unlock") => void
}) {
  const { doors, doorState, setDoorState } = args

  const lastSentRef = useRef<"lock" | "unlock" | null>(null)
  const lastDoorIdRef = useRef<string | null>(null)
  const skipNextEffectRef = useRef(false)

  const lockDoor = useCallback(async (doorId: string) => {
    lastDoorIdRef.current = doorId
    try {
      const res = await doorActions.lock(doorId)
      if (!res.ok) return res
      skipNextEffectRef.current = true
      setDoorState("lock")
      return res
    } catch (e) {
      console.error("[LOCK] lock failed", e)
      return { ok: false, error: "Lock failed" } as unknown as Awaited<ReturnType<typeof doorActions.lock>>
    }
  }, [setDoorState])

  const unlockDoor = useCallback(async (doorId: string) => {
    lastDoorIdRef.current = doorId
    try {
      const res = await doorActions.unlock(doorId)
      if (!res.ok) return res
      skipNextEffectRef.current = true
      setDoorState("unlock")
      return res
    } catch (e) {
      console.error("[LOCK] unlock failed", e)
      return { ok: false, error: "Unlock failed" } as unknown as Awaited<ReturnType<typeof doorActions.unlock>>
    }
  }, [setDoorState])

  // Side-effect for NON-UI changes (timers, etc.)
  useEffect(() => {
    const doorId = lastDoorIdRef.current ?? doors[0]?.id
    if (!doorId) return

    // skip first render
    if (lastSentRef.current === null) {
      lastSentRef.current = doorState
      return
    }

    // if change came from explicit action, don't send again
    if (skipNextEffectRef.current) {
      skipNextEffectRef.current = false
      lastSentRef.current = doorState
      return
    }

    if (lastSentRef.current === doorState) return
    lastSentRef.current = doorState

    if (doorState === "lock") {
      void doorActions.lock(doorId).catch((e) => console.error("[LOCK] lock failed", e))
    } else {
      void doorActions.unlock(doorId).catch((e) => console.error("[LOCK] unlock failed", e))
    }
  }, [doorState, doors])

  return { lockDoor, unlockDoor }
}
