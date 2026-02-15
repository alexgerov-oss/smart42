import { useEffect, useState } from "react"
import type { ActivityLogEntry, NewActivityLogEntry } from "@/lib/core/activity-log"
import { createActivityLogEntry, loadActivityLog, saveActivityLog } from "@/lib/core/activity-log"

export function useActivityLogState(opts?: { maxEntries?: number }) {
  const maxEntries = opts?.maxEntries ?? 500

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>(() => loadActivityLog([]))

  useEffect(() => {
    saveActivityLog(activityLog)
  }, [activityLog])

  function addActivityLogEntry(entry: NewActivityLogEntry) {
    const full = createActivityLogEntry(entry)
    setActivityLog((prev) => [full, ...prev].slice(0, maxEntries))
  }

  function clearActivityLog() {
    setActivityLog([])
  }

  return { activityLog, setActivityLog, addActivityLogEntry, clearActivityLog }
}
