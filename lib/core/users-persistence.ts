"use client"

import type { AppUser, IButtonUser } from "@/lib/core/types"
import { storage } from "@/lib/core/storage"

export function loadIButtonUsers(): IButtonUser[] {
  return storage.getJSON<IButtonUser[]>("iButtonUsers", [])
}

export function saveIButtonUsers(next: IButtonUser[]) {
  storage.setJSON("iButtonUsers", next)
}

export function loadAppUsers(): AppUser[] {
  return storage.getJSON<AppUser[]>("appUsers", [])
}

export function saveAppUsers(next: AppUser[]) {
  storage.setJSON("appUsers", next)
}
