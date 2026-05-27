"use client"

import type { AppUser, IButtonUser } from "@/lib/core/types"
import { storage } from "@/lib/core/storage"

function doorScopedKey(baseKey: string, doorId?: string): string {
  return doorId ? `${baseKey}:${doorId}` : baseKey
}

export function loadIButtonUsers(doorId?: string): IButtonUser[] {
  return storage.getJSON<IButtonUser[]>(doorScopedKey("iButtonUsers", doorId), [])
}

export function saveIButtonUsers(next: IButtonUser[], doorId?: string) {
  storage.setJSON(doorScopedKey("iButtonUsers", doorId), next)
}

export function loadAppUsers(doorId?: string): AppUser[] {
  return storage.getJSON<AppUser[]>(doorScopedKey("appUsers", doorId), [])
}

export function saveAppUsers(next: AppUser[], doorId?: string) {
  storage.setJSON(doorScopedKey("appUsers", doorId), next)
}
