"use client"

import { useCallback, useState, type Dispatch, type SetStateAction } from "react"
import { useAutoLockCountdown, useAutoNightLock } from "@/lib/core/lock-timers"

type DoorState = "lock" | "unlock"

type DoorLockState = {
  countdown: number | null
  doorState: DoorState
  autoLockDelay: number
  autoLockEnabled: boolean
  autoLockDeadlineAt: number | null
  autoNightLockEnabled: boolean
  nightLockHour: string
  nightLockMinute: string
  nightLockPeriod: "AM" | "PM"
  lastNightLockDate: string | null
}

const DEFAULT_LOCK_STATE: DoorLockState = {
  countdown: null,
  doorState: "lock",
  autoLockDelay: 30,
  autoLockEnabled: false,
  autoLockDeadlineAt: null,
  autoNightLockEnabled: false,
  nightLockHour: "10",
  nightLockMinute: "00",
  nightLockPeriod: "PM",
  lastNightLockDate: null,
}

function doorScopedKey(baseKey: string, doorId?: string): string {
  return doorId ? `${baseKey}:${doorId}` : baseKey
}

function isDoorState(value: unknown): value is DoorState {
  return value === "lock" || value === "unlock"
}

function isPeriod(value: unknown): value is "AM" | "PM" {
  return value === "AM" || value === "PM"
}

function loadLockState(doorId?: string): DoorLockState {
  if (typeof window === "undefined") return DEFAULT_LOCK_STATE

  try {
    const raw = window.localStorage.getItem(doorScopedKey("lockState", doorId))
    if (!raw) return DEFAULT_LOCK_STATE

    const parsed = JSON.parse(raw) as Partial<DoorLockState>

    return {
      countdown: typeof parsed.countdown === "number" ? parsed.countdown : null,
      doorState: isDoorState(parsed.doorState) ? parsed.doorState : DEFAULT_LOCK_STATE.doorState,
      autoLockDelay: typeof parsed.autoLockDelay === "number" ? parsed.autoLockDelay : DEFAULT_LOCK_STATE.autoLockDelay,
      autoLockEnabled:
        typeof parsed.autoLockEnabled === "boolean" ? parsed.autoLockEnabled : DEFAULT_LOCK_STATE.autoLockEnabled,
      autoLockDeadlineAt:
        typeof parsed.autoLockDeadlineAt === "number" ? parsed.autoLockDeadlineAt : DEFAULT_LOCK_STATE.autoLockDeadlineAt,
      autoNightLockEnabled:
        typeof parsed.autoNightLockEnabled === "boolean"
          ? parsed.autoNightLockEnabled
          : DEFAULT_LOCK_STATE.autoNightLockEnabled,
      nightLockHour: typeof parsed.nightLockHour === "string" ? parsed.nightLockHour : DEFAULT_LOCK_STATE.nightLockHour,
      nightLockMinute:
        typeof parsed.nightLockMinute === "string" ? parsed.nightLockMinute : DEFAULT_LOCK_STATE.nightLockMinute,
      nightLockPeriod: isPeriod(parsed.nightLockPeriod) ? parsed.nightLockPeriod : DEFAULT_LOCK_STATE.nightLockPeriod,
      lastNightLockDate:
        typeof parsed.lastNightLockDate === "string" || parsed.lastNightLockDate === null
          ? parsed.lastNightLockDate
          : DEFAULT_LOCK_STATE.lastNightLockDate,
    }
  } catch {
    return DEFAULT_LOCK_STATE
  }
}

function saveLockState(doorId: string | undefined, next: DoorLockState): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(doorScopedKey("lockState", doorId), JSON.stringify(next))
  } catch {
    // ignore
  }
}

function resolveStateValue<T>(value: SetStateAction<T>, previous: T): T {
  return typeof value === "function" ? (value as (prev: T) => T)(previous) : value
}

export function useLockState(opts?: { doorId?: string }) {
  const doorId = opts?.doorId

  const [lockStateByDoor, setLockStateByDoor] = useState<{ doorId?: string; value: DoorLockState }>(() => ({
    doorId,
    value: loadLockState(doorId),
  }))

  const lockState = lockStateByDoor.doorId === doorId ? lockStateByDoor.value : loadLockState(doorId)

  const updateLockState = useCallback(
    (updater: (previous: DoorLockState) => DoorLockState) => {
      setLockStateByDoor((previousState) => {
        const previous = previousState.doorId === doorId ? previousState.value : loadLockState(doorId)
        const next = updater(previous)

        saveLockState(doorId, next)

        return {
          doorId,
          value: next,
        }
      })
    },
    [doorId],
  )

  const setCountdown: Dispatch<SetStateAction<number | null>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        countdown: resolveStateValue(value, previous.countdown),
      }))
    },
    [updateLockState],
  )

  const setDoorState: Dispatch<SetStateAction<DoorState>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        doorState: resolveStateValue(value, previous.doorState),
      }))
    },
    [updateLockState],
  )

  const setAutoLockDelay: Dispatch<SetStateAction<number>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        autoLockDelay: resolveStateValue(value, previous.autoLockDelay),
      }))
    },
    [updateLockState],
  )

  const setAutoLockEnabled: Dispatch<SetStateAction<boolean>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        autoLockEnabled: resolveStateValue(value, previous.autoLockEnabled),
      }))
    },
    [updateLockState],
  )

  const setAutoLockDeadlineAt: Dispatch<SetStateAction<number | null>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        autoLockDeadlineAt: resolveStateValue(value, previous.autoLockDeadlineAt),
      }))
    },
    [updateLockState],
  )

  const setAutoNightLockEnabled: Dispatch<SetStateAction<boolean>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        autoNightLockEnabled: resolveStateValue(value, previous.autoNightLockEnabled),
      }))
    },
    [updateLockState],
  )

  const setNightLockHour: Dispatch<SetStateAction<string>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        nightLockHour: resolveStateValue(value, previous.nightLockHour),
      }))
    },
    [updateLockState],
  )

  const setNightLockMinute: Dispatch<SetStateAction<string>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        nightLockMinute: resolveStateValue(value, previous.nightLockMinute),
      }))
    },
    [updateLockState],
  )

  const setNightLockPeriod: Dispatch<SetStateAction<"AM" | "PM">> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        nightLockPeriod: resolveStateValue(value, previous.nightLockPeriod),
      }))
    },
    [updateLockState],
  )

  const setLastNightLockDate: Dispatch<SetStateAction<string | null>> = useCallback(
    (value) => {
      updateLockState((previous) => ({
        ...previous,
        lastNightLockDate: resolveStateValue(value, previous.lastNightLockDate),
      }))
    },
    [updateLockState],
  )

  useAutoLockCountdown({
    autoLockEnabled: lockState.autoLockEnabled,
    doorState: lockState.doorState,
    autoLockDelay: lockState.autoLockDelay,
    autoLockDeadlineAt: lockState.autoLockDeadlineAt,
    setCountdown,
    setDoorState,
    setAutoLockDeadlineAt,
  })

  useAutoNightLock({
    autoNightLockEnabled: lockState.autoNightLockEnabled,
    nightLockHour: lockState.nightLockHour,
    nightLockMinute: lockState.nightLockMinute,
    nightLockPeriod: lockState.nightLockPeriod,
    lastNightLockDate: lockState.lastNightLockDate,
    setDoorState,
    setLastNightLockDate,
  })

  return {
    countdown: lockState.countdown,
    doorState: lockState.doorState,
    setDoorState,

    autoLockDelay: lockState.autoLockDelay,
    setAutoLockDelay,
    autoLockEnabled: lockState.autoLockEnabled,
    setAutoLockEnabled,

    autoNightLockEnabled: lockState.autoNightLockEnabled,
    setAutoNightLockEnabled,
    nightLockHour: lockState.nightLockHour,
    setNightLockHour,
    nightLockMinute: lockState.nightLockMinute,
    setNightLockMinute,
    nightLockPeriod: lockState.nightLockPeriod,
    setNightLockPeriod,
    lastNightLockDate: lockState.lastNightLockDate,
    setLastNightLockDate,
  }
}
