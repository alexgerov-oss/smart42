"use client"

import type { Scene } from "@/lib/core/types"

const PRIMARY_KEY = "scenes"
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

export function loadScenes(fallback: Scene[] = []): Scene[] {
  if (typeof window === "undefined") return fallback

  // Try primary + legacy keys
  const keys = [PRIMARY_KEY, ...LEGACY_KEYS]
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

export function saveScenes(scenes: Scene[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PRIMARY_KEY, JSON.stringify(scenes))
  } catch {
    // ignore
  }
}
