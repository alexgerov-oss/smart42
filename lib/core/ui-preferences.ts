// lib/core/ui-preferences.ts
import { storage } from "./storage"

export function loadQuickControlsLocked(): boolean {
  return storage.getBool("quickControlsLocked", false)
}

export function saveQuickControlsLocked(locked: boolean) {
  storage.setBool("quickControlsLocked", locked)
}
