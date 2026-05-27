"use client"

import type { Scene } from "@/lib/core/types"

const PRIMARY_KEY = "scenes"

function doorScopedKey(baseKey: string, doorId?: string): string {
  return doorId ? `${baseKey}:${doorId}` : baseKey
}
const LEGACY_KEYS = ["smart42:scenes", "smartDoor:scenes"]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function tryParseScenes(raw: string): Scene[] | null {
  try {
    const parsed = JSON.parse(raw)

    // Most common: array
    if (Array.isArray(parsed)) return parsed as Scene[]

    // Back-compat: { scenes: [...] }
    if (isRecord(parsed) && Array.isArray(parsed.scenes)) return parsed.scenes as Scene[]

    return null
  } catch {
    return null
  }
}

export function loadScenes(fallback: Scene[] = [], doorId?: string): Scene[] {
  if (typeof window === "undefined") return fallback

  // Try primary + legacy keys
  const keys = [doorScopedKey(PRIMARY_KEY, doorId), ...LEGACY_KEYS]
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) continue
      const scenes = tryParseScenes(raw)
      if (scenes) return scenes
    } catch {
      // ignore and keep trying next key
    }
  }

  return fallback
}

export function saveScenes(scenes: Scene[], doorId?: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(doorScopedKey(PRIMARY_KEY, doorId), JSON.stringify(scenes))
  } catch {
    // ignore
  }
}
