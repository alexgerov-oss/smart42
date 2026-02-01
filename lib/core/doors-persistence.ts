"use client"

import type { Door } from "@/lib/core/types"
import { storage } from "@/lib/core/storage"

export function loadDoors(): Door[] {
  return storage.getJSON<Door[]>("doors", [])
}

export function saveDoors(next: Door[]) {
  storage.setJSON("doors", next)
}
