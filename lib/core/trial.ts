// lib/core/trial.ts
import { storage } from "./storage"
import type { AccessRole } from "./types"

export const TRIAL_DAYS = 30

export type TrialState = {
  active: boolean
  startedAt?: string // ISO дата, напр. new Date().toISOString()
}

export function loadTrial(): TrialState {
  return storage.getJSON("trial", { active: false } as TrialState)
}

export function saveTrial(trial: TrialState) {
  storage.setJSON("trial", trial)
}

export function startTrial(now = new Date()): TrialState {
  const trial: TrialState = { active: true, startedAt: now.toISOString() }
  saveTrial(trial)
  return trial
}

export function stopTrial(): TrialState {
  const trial: TrialState = { active: false }
  saveTrial(trial)
  return trial
}

export function trialDaysLeft(trial: TrialState, now = new Date()): number {
  if (!trial.active || !trial.startedAt) return 0

  const startMs = new Date(trial.startedAt).getTime()
  const endMs = startMs + TRIAL_DAYS * 24 * 60 * 60 * 1000
  const diffMs = endMs - now.getTime()

  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
}

export function adminHasActiveTrial(role: AccessRole, trial: TrialState, now = new Date()): boolean {
  return role === "admin" && trial.active && trialDaysLeft(trial, now) > 0
}
