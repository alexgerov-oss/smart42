// lib/core/activity-log.ts
import { newId } from "@/lib/id"

export type ActivityEventType =
  | "door-lock"
  | "door-unlock"
  | "door-open"
  | "door-closed"
  | "ibutton-created"
  | "ibutton-edited"
  | "ibutton-deleted"
  | "app-user-created"
  | "app-user-edited"
  | "app-user-deleted"
  | "scene-created"
  | "scene-edited"
  | "scene-deleted"
  | "quick-control-changed"

export type ActivityLogEntry = {
  id: string
  createdAt: string // ISO string
  doorName?: string
  timeLabel?: string // optional UI-friendly time (можеш да го махнеш по-късно)
  dateLabel?: string // optional UI-friendly date
  action: string
  method?: string | null
  user?: string | null
  role?: string | null
  description?: string
  eventType: ActivityEventType
}

export type NewActivityLogEntry = Omit<ActivityLogEntry, "id" | "createdAt">

const PRIMARY_KEY = "activityLog"
const LEGACY_KEYS = ["smart42:activityLog", "smartDoor:activityLog"]

function doorScopedKey(baseKey: string, doorId?: string): string {
  return doorId ? `${baseKey}:${doorId}` : baseKey
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function tryParseLog(raw: string): ActivityLogEntry[] | null {
  try {
    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed)) return parsed as ActivityLogEntry[]
    if (isRecord(parsed) && Array.isArray(parsed.items)) return parsed.items as ActivityLogEntry[]

    return null
  } catch {
    return null
  }
}

export function loadActivityLog(fallback: ActivityLogEntry[] = [], doorId?: string): ActivityLogEntry[] {
  if (typeof window === "undefined") return fallback

  const keys = [doorScopedKey(PRIMARY_KEY, doorId), ...LEGACY_KEYS]
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      const items = tryParseLog(raw)
      if (items) return items
    } catch {
      // ignore
    }
  }
  return fallback
}

export function saveActivityLog(items: ActivityLogEntry[], doorId?: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(doorScopedKey(PRIMARY_KEY, doorId), JSON.stringify(items))
  } catch {
    // ignore
  }
}

export function createActivityLogEntry(input: NewActivityLogEntry): ActivityLogEntry {
  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    ...input,
  }
}
