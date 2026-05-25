"use client"

import { useCallback, useMemo, useState } from "react"
import type { ActivityLogEntry } from "@/lib/core/activity-log"

// ✅ re-export за да няма “два различни типа”
export type { ActivityLogEntry } from "@/lib/core/activity-log"

// ✅ това го иска app-context.tsx
export type AddActivityLogInput = Omit<ActivityLogEntry, "id"> & { id?: string }

function computeNextId(prev: ActivityLogEntry[]): string {
  // Pure (без Date.now/Math.random/UUID) за да не дразни react-hooks/purity
  let max = 0
  for (const e of prev) {
    const match = /^log_(\d+)$/.exec(String(e.id))
    if (!match) continue
    const n = Number.parseInt(match[1] ?? "0", 10)
    if (!Number.isNaN(n)) max = Math.max(max, n)
  }
  return `log_${max + 1}`
}

export function useActivityLogState(seed?: ActivityLogEntry[]) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>(seed ?? [])

  const addEntry = useCallback((input: AddActivityLogInput) => {
    let generatedId = input.id ?? ""

    setEntries((prev) => {
      const id = generatedId || computeNextId(prev)
      generatedId = id

      // NOTE: time/date ги очаква ActivityLogEntry от core/activity-log
      const entry = { ...(input as Omit<ActivityLogEntry, "id">), id } as ActivityLogEntry
      return [entry, ...prev]
    })

    // generatedId вече е сетнат синхронно от updater-а
    return generatedId || "log_0"
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clear = useCallback(() => {
    setEntries([])
  }, [])

  return useMemo(
    () => ({
      // “нови” имена
      entries,
      setEntries,
      addEntry,
      removeEntry,
      clear,

      // ✅ “стари” имена (които app-context.tsx очаква)
      activityLog: entries,
      setActivityLog: setEntries,
      logActivity: addEntry,
      clearActivityLog: clear,
      removeActivityLog: removeEntry,
    }),
    [entries, addEntry, removeEntry, clear]
  )
}
