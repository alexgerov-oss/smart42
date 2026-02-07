// lib/core/storage.ts
/**
 * SSR-safe localStorage wrapper.
 * Rule: NO direct localStorage usage outside this file.
 */

export const storageKeys = {
  doors: "doors",
  nameOverrides: "nameOverrides",
  quickControlsLocked: "quickControlsLocked",
  trial: "trial",
  premium: "premium",
  sessionPassword: "sessionPassword",
} as const;

type JsonValue = unknown;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore quota / privacy mode errors
  }
}

function safeRemoveItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function get(key: string): string | null {
  return safeGetItem(key);
}

export function set(key: string, value: string): void {
  safeSetItem(key, value);
}

export function remove(key: string): void {
  safeRemoveItem(key);
}

export function getJSON<T = JsonValue>(key: string, fallback: T): T {
  const raw = safeGetItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON(key: string, value: JsonValue): void {
  safeSetItem(key, JSON.stringify(value));
}

export function getBool(key: string, fallback = false): boolean {
  const raw = safeGetItem(key);
  if (raw === null) return fallback;
  if (raw === "true") return true;
  if (raw === "false") return false;
  // tolerate "1"/"0"
  if (raw === "1") return true;
  if (raw === "0") return false;
  return fallback;
}

export function setBool(key: string, value: boolean): void {
  safeSetItem(key, value ? "true" : "false");
}

export function getNumber(key: string, fallback = 0): number {
  const raw = safeGetItem(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function setNumber(key: string, value: number): void {
  safeSetItem(key, String(value));
}

/**
 * Compatibility object export (some files may import `storage.getBool(...)`)
 */
export const storage = {
  keys: storageKeys,
  get,
  set,
  remove,
  getJSON,
  setJSON,
  getBool,
  setBool,
  getNumber,
  setNumber,
} as const;
