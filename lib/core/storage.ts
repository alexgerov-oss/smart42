// lib/core/storage.ts
export const storageKeys = {
  doors: "doors",
  controllers: "smart42:controllers:v1",
  nameOverrides: "nameOverrides",
  quickControlsLocked: "quickControlsLocked",
  trial: "trial",
  premium: "premium",
  controllerId: "controllerId",
  authUser: "authUser",

  // persisted UI/data state
  iButtonUsers: "smart42:ibuttonUsers:v1",
  appUsers: "smart42:appUsers:v1",
  scenes: "smart42:scenes:v1",
} as const

export type StorageKey = keyof typeof storageKeys

const canUseStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined"

export const storage = {
  get(key: StorageKey): string | null {
    if (!canUseStorage()) return null
    try {
      return window.localStorage.getItem(storageKeys[key])
    } catch {
      return null
    }
  },

  set(key: StorageKey, value: string): void {
    if (!canUseStorage()) return
    try {
      window.localStorage.setItem(storageKeys[key], value)
    } catch {}
  },

  remove(key: StorageKey): void {
    if (!canUseStorage()) return
    try {
      window.localStorage.removeItem(storageKeys[key])
    } catch {}
  },

  getJSON<T>(key: StorageKey, fallback: T): T {
    const raw = storage.get(key)
    if (!raw) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  },

  setJSON<T>(key: StorageKey, value: T): void {
    storage.set(key, JSON.stringify(value))
  },

  getBool(key: StorageKey, fallback = false): boolean {
    const raw = storage.get(key)
    if (raw == null) return fallback
    if (raw === "true") return true
    if (raw === "false") return false
    if (raw === "1") return true
    if (raw === "0") return false
    return fallback
  },

  setBool(key: StorageKey, value: boolean): void {
    storage.set(key, value ? "true" : "false")
  },
} as const
