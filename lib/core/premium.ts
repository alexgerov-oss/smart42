// lib/core/premium.ts
import { storage } from "./storage"
import type { AccessRole } from "./types"

export type PremiumState = {
  active: boolean
}

export function loadPremium(): PremiumState {
  return storage.getJSON("premium", { active: false } as PremiumState)
}

export function savePremium(premium: PremiumState) {
  storage.setJSON("premium", premium)
}

export function setPremiumActive(active: boolean): PremiumState {
  const premium: PremiumState = { active }
  savePremium(premium)
  return premium
}

export function adminHasPremium(role: AccessRole, premium: PremiumState): boolean {
  return role === "admin" && premium.active
}
