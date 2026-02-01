// lib/core/controllers.ts
import type { Controller } from "./types"
import { validateControllerSerialNumber } from "./validators"

export function addControllerCore(
  prev: Controller[],
  serialNumber: string,
  ip?: string,
): { ok: true; next: Controller[] } | { ok: false } {
  const serial = serialNumber.trim()
  if (!validateControllerSerialNumber(serial)) return { ok: false }
  if (prev.some((c) => c.serialNumber === serial)) return { ok: false }

  const next: Controller[] = [
    ...prev,
    {
      id: `controller-${Date.now()}`,
      serialNumber: serial,
      ip: ip?.trim(),
      status: "online",
      addedAt: new Date().toISOString(),
    },
  ]
  return { ok: true, next }
}

export function updateControllerCore(
  prev: Controller[],
  id: string,
  serialNumber: string,
  ip?: string,
): { ok: true; next: Controller[] } | { ok: false } {
  const serial = serialNumber.trim()
  if (!validateControllerSerialNumber(serial)) return { ok: false }
  if (prev.some((c) => c.id !== id && c.serialNumber === serial)) return { ok: false }

  const next = prev.map((c) => (c.id === id ? { ...c, serialNumber: serial, ip: ip?.trim() } : c))
  return { ok: true, next }
}

export function removeControllerCore(prev: Controller[], id: string): Controller[] {
  return prev.filter((c) => c.id !== id)
}

export function updateControllerStatusCore(prev: Controller[], id: string, status: "online" | "offline"): Controller[] {
  return prev.map((c) => (c.id === id ? { ...c, status } : c))
}

export function getActiveControllerCore(controllers: Controller[]): Controller | null {
  return controllers.length > 0 ? controllers[0] : null
}

export function markControllerRestartingCore(prev: Controller[], id: string, isRestarting: boolean): Controller[] {
  return prev.map((c) => (c.id === id ? { ...c, isRestarting } : c))
}
