import { useEffect, type Dispatch, type SetStateAction } from "react"

type DoorState = "lock" | "unlock"

type AutoLockParams = {
  autoLockEnabled: boolean
  doorState: DoorState
  autoLockDelay: number
  setCountdown: Dispatch<SetStateAction<number | null>>
  setDoorState: Dispatch<SetStateAction<DoorState>>
}

export function useAutoLockCountdown({
  autoLockEnabled,
  doorState,
  autoLockDelay,
  setCountdown,
  setDoorState,
}: AutoLockParams) {
  useEffect(() => {
    if (!autoLockEnabled) {
      setCountdown(null)
      return
    }

    if (doorState === "unlock") {
      setCountdown(autoLockDelay)

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 0) return null

          const next = prev - 1
          if (next <= 0) {
            setDoorState("lock")
            return null
          }
          return next
        })
      }, 1000)

      return () => clearInterval(interval)
    }

    setCountdown(null)
  }, [autoLockEnabled, doorState, autoLockDelay, setCountdown, setDoorState])
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
