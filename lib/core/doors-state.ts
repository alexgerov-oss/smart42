import { useEffect, useMemo, useState } from "react"
import type { AccessRole, Door } from "@/lib/core/types"
import { canAdminManageDoors, getDefaultDoors, loadDoorsFromStorage, saveDoorsToStorage } from "@/lib/core/doors"

export function useDoorsState(params: {
  currentUserAccess: AccessRole
}): {
  doors: Door[]
  addDoor: (systemName: string) => string | null
  updateDoor: (id: string, systemName: string) => boolean
  removeDoor: (id: string) => void
} {
  const { currentUserAccess } = params

  const defaultDoors = useMemo(() => getDefaultDoors(), [])
  const [doors, setDoors] = useState<Door[]>(() => loadDoorsFromStorage(defaultDoors))

  useEffect(() => {
    saveDoorsToStorage(doors)
  }, [doors])

  const addDoor = (systemName: string): string | null => {
    if (!canAdminManageDoors(currentUserAccess)) return null

    const trimmed = systemName.trim()
    if (!trimmed) return null

    const newId = `door-${Date.now()}`
    setDoors((prev) => [
      ...prev,
      {
        id: newId,
        systemName: trimmed,
        createdBy: currentUserAccess,
        createdAt: new Date().toISOString(),
      },
    ])
    return newId
  }

  const updateDoor = (id: string, systemName: string): boolean => {
    if (!canAdminManageDoors(currentUserAccess)) return false

    const trimmed = systemName.trim()
    if (!trimmed) return false

    setDoors((prev) => prev.map((door) => (door.id === id ? { ...door, systemName: trimmed } : door)))
    return true
  }

  const removeDoor = (id: string) => {
    if (!canAdminManageDoors(currentUserAccess)) return
    setDoors((prev) => prev.filter((door) => door.id !== id))
  }

  return { doors, addDoor, updateDoor, removeDoor }
}
