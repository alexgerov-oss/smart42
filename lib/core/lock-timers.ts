import { useEffect, type Dispatch, type SetStateAction } from "react"

type DoorState = "lock" | "unlock"

type AutoLockParams = {
  autoLockEnabled: boolean
  doorState: DoorState
  autoLockDelay: number
  autoLockDeadlineAt: number | null
  setCountdown: Dispatch<SetStateAction<number | null>>
  setDoorState: Dispatch<SetStateAction<DoorState>>
  setAutoLockDeadlineAt: Dispatch<SetStateAction<number | null>>
}

export function useAutoLockCountdown({
  autoLockEnabled,
  doorState,
  autoLockDelay,
  autoLockDeadlineAt,
  setCountdown,
  setDoorState,
  setAutoLockDeadlineAt,
}: AutoLockParams) {
  useEffect(() => {
    if (!autoLockEnabled) {
      setCountdown(null)
      setAutoLockDeadlineAt(null)
      return
    }

    if (doorState !== "unlock") {
      setCountdown(null)
      setAutoLockDeadlineAt(null)
      return
    }

    const deadlineAt = autoLockDeadlineAt ?? Date.now() + autoLockDelay * 1000
    if (autoLockDeadlineAt === null) {
      setAutoLockDeadlineAt(deadlineAt)
    }

    const updateCountdown = () => {
      const secondsLeft = Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000))

      if (secondsLeft <= 0) {
        setCountdown(null)
        setAutoLockDeadlineAt(null)
        setDoorState("lock")
        return
      }

      setCountdown(secondsLeft)
    }

    updateCountdown()

    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [
    autoLockEnabled,
    doorState,
    autoLockDelay,
    autoLockDeadlineAt,
    setCountdown,
    setDoorState,
    setAutoLockDeadlineAt,
  ])
}

type AutoNightLockParams = {
  autoNightLockEnabled: boolean
  nightLockHour: string
  nightLockMinute: string
  nightLockPeriod: "AM" | "PM"
  lastNightLockDate: string | null
  setDoorState: Dispatch<SetStateAction<DoorState>>
  setLastNightLockDate: Dispatch<SetStateAction<string | null>>
}

export function useAutoNightLock({
  autoNightLockEnabled,
  nightLockHour,
  nightLockMinute,
  nightLockPeriod,
  lastNightLockDate,
  setDoorState,
  setLastNightLockDate,
}: AutoNightLockParams) {
  useEffect(() => {
    if (!autoNightLockEnabled) return

    const checkNightLock = () => {
      const now = new Date()
      const currentDate = now.toDateString()

      // предотвратява повторно заключване през същия ден
      if (lastNightLockDate === currentDate) return

      const hourRaw = Number.parseInt(nightLockHour, 10)
      const minuteRaw = Number.parseInt(nightLockMinute, 10)
      if (Number.isNaN(hourRaw) || Number.isNaN(minuteRaw)) return

      let targetHour = hourRaw
      if (nightLockPeriod === "PM" && targetHour !== 12) targetHour += 12
      else if (nightLockPeriod === "AM" && targetHour === 12) targetHour = 0

      if (now.getHours() === targetHour && now.getMinutes() === minuteRaw) {
        setDoorState("lock")
        setLastNightLockDate(currentDate)
      }
    }

    const interval = setInterval(checkNightLock, 30000)
    checkNightLock()

    return () => clearInterval(interval)
  }, [
    autoNightLockEnabled,
    nightLockHour,
    nightLockMinute,
    nightLockPeriod,
    lastNightLockDate,
    setDoorState,
    setLastNightLockDate,
  ])
}
