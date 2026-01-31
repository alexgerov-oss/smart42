// lib/core/doors.ts
import { storage } from "./storage"
import type { Door, AccessRole } from "./types"

export function getDefaultDoors(): Door[] {
  return [
    { id: "main-door", systemName: "Main door", createdBy: "admin", createdAt: new Date().toISOString() },
    { id: "second-door", systemName: "Second door", createdBy: "admin", createdAt: new Date().toISOString() },
  ]
}

export function loadDoorsFromStorage(fallback?: Door[]): Door[] {
  const defaultDoors = fallback ?? getDefaultDoors()
  return storage.getJSON("doors", defaultDoors)
}

export function saveDoorsToStorage(doors: Door[]) {
  storage.setJSON("doors", doors)
}

export function canAdminManageDoors(role: AccessRole) {
  return role === "admin"
}
