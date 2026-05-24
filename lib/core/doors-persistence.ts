"use client"

import type { Door } from "@/lib/core/types"
import { storage } from "@/lib/core/storage"

const DEFAULT_DOORS: Door[] = [
  {
    id: "main-door",
    systemName: "Main Door",
    createdBy: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
]

export function loadDoors(): Door[] {
  const storedDoors = storage.getJSON<Door[]>("doors", [])
  return storedDoors.length > 0 ? storedDoors : DEFAULT_DOORS
}

export function saveDoors(next: Door[]) {
  storage.setJSON("doors", next)
}
