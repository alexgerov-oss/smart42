"use client"

import { useState } from "react"
import type { AccessRole, Door } from "@/lib/core/types"
import { loadDoors, saveDoors } from "@/lib/core/doors-persistence"

// ✅ opts е optional + safe default (за да няма "destructure of undefined")
export function useDoorsState(opts?: { currentUserAccess?: AccessRole }) {
  const currentUserAccess: AccessRole = opts?.currentUserAccess ?? "admin"

  const [doors, _setDoors] = useState<Door[]>(() => loadDoors())

  const setDoors: React.Dispatch<React.SetStateAction<Door[]>> = (value) => {
    _setDoors((prev) => {
      const next = typeof value === "function" ? (value as (p: Door[]) => Door[])(prev) : value
      saveDoors(next)
      return next
    })
  }

  const addDoor = (systemName: string): string | null => {
    const name = systemName.trim()
    if (!name) return null

    const now = Date.now()
    const id = `door-${now}`

    const nextDoor: Door = {
      id,
      systemName: name,
      createdAt: new Date(now).toISOString(),
      createdBy: currentUserAccess,
    }

    setDoors((prev) => [...prev, nextDoor])
    return id
  }

  const updateDoor = (id: string, systemName: string): boolean => {
    const name = systemName.trim()
    if (!name) return false

    let changed = false
    setDoors((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        changed = true
        return { ...d, systemName: name }
      }),
    )
    return changed
  }

  const removeDoor = (id: string) => {
    setDoors((prev) => prev.filter((d) => d.id !== id))
  }

  return { doors, addDoor, updateDoor, removeDoor }
}
