"use client"

import { useState } from "react"
import { useAutoLockCountdown, useAutoNightLock } from "@/lib/core/lock-timers"

export function useLockState() {
  // Lock state + timers
  const [doorState, setDoorState] = useState<"lock" | "unlock">("lock")
  const [autoLockDelay, setAutoLockDelay] = useState(30)
  const [autoLockEnabled, setAutoLockEnabled] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Night lock
  const [autoNightLockEnabled, setAutoNightLockEnabled] = useState(false)
  const [nightLockHour, setNightLockHour] = useState("10")
  const [nightLockMinute, setNightLockMinute] = useState("00")
  const [nightLockPeriod, setNightLockPeriod] = useState<"AM" | "PM">("PM")
  const [lastNightLockDate, setLastNightLockDate] = useState<string | null>(null)

  // Timers (existing extracted hooks)
  useAutoLockCountdown({ autoLockEnabled, doorState, autoLockDelay, setCountdown, setDoorState })

  useAutoNightLock({
    autoNightLockEnabled,
    nightLockHour,
    nightLockMinute,
    nightLockPeriod,
    lastNightLockDate,
    setDoorState,
    setLastNightLockDate,
  })

  return {
    countdown,
    doorState,
    setDoorState,

    autoLockDelay,
    setAutoLockDelay,
    autoLockEnabled,
    setAutoLockEnabled,

    autoNightLockEnabled,
    setAutoNightLockEnabled,
    nightLockHour,
    setNightLockHour,
    nightLockMinute,
    setNightLockMinute,
    nightLockPeriod,
    setNightLockPeriod,
    lastNightLockDate,
    setLastNightLockDate,
  }
}
