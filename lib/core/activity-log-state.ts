"use client"

import { useCallback, useMemo, useState } from "react"
import { loadActivityLog, saveActivityLog, type ActivityLogEntry } from "@/lib/core/activity-log"

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

export function useActivityLogState(opts?: { doorId?: string; seed?: ActivityLogEntry[] }) {
  const doorId = opts?.doorId

  const [entriesState, setEntriesState] = useState<{ doorId?: string; entries: ActivityLogEntry[] }>(() => ({
    doorId,
    entries: opts?.seed ?? loadActivityLog([], doorId),
  }))

  const entries = entriesState.doorId === doorId ? entriesState.entries : loadActivityLog([], doorId)

  const addEntry = useCallback((input: AddActivityLogInput) => {
    let generatedId = input.id ?? ""

    setEntriesState((previousState) => {
      const prev = previousState.doorId === doorId ? previousState.entries : loadActivityLog([], doorId)
      const id = generatedId || computeNextId(prev)
      generatedId = id

      // NOTE: time/date ги очаква ActivityLogEntry от core/activity-log
      const entry = { ...(input as Omit<ActivityLogEntry, "id">), id } as ActivityLogEntry
      const next = [entry, ...prev]
      saveActivityLog(next, doorId)
      return { doorId, entries: next }
    })

    // generatedId вече е сетнат синхронно от updater-а
    return generatedId || "log_0"
  }, [doorId])

  const removeEntry = useCallback((id: string) => {
    setEntriesState((previousState) => {
      const prev = previousState.doorId === doorId ? previousState.entries : loadActivityLog([], doorId)
      const next = prev.filter((e) => e.id !== id)
      saveActivityLog(next, doorId)
      return { doorId, entries: next }
    })
  }, [doorId])

  const clear = useCallback(() => {
    saveActivityLog([], doorId)
    setEntriesState({ doorId, entries: [] })
  }, [doorId])

  return useMemo(
    () => ({
      // “нови” имена
      entries,
      setEntries: setEntriesState,
      addEntry,
      removeEntry,
      clear,

      // ✅ “стари” имена (които app-context.tsx очаква)
      activityLog: entries,
      setActivityLog: setEntriesState,
      logActivity: addEntry,
      clearActivityLog: clear,
      removeActivityLog: removeEntry,
    }),
    [entries, addEntry, removeEntry, clear]
  )
}
