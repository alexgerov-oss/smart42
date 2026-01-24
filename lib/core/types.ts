// lib/core/types.ts

export type AccessRole = "admin" | "full" | "open-close"

export interface WhenCondition {
  type: "wifi" | "battery" | "cpu-temp" | "cpu-load" | "power-drops" | "latency" | "door-lock" | "door-open"
  operator?: "<" | ">" | "="
  value?: number
  doorEvent?: "lock" | "unlock" | "open" | "closed"
  timeWindow?: "between" | "always"
  timeStart?: string
  timeEnd?: string
}

export interface ThenAction {
  type: "push" | "email" | "restart"
  customText?: string
}

export interface Scene {
  id: string
  name: string
  active: boolean
  whenConditions: WhenCondition[]
  thenAction: ThenAction
  createdBy: AccessRole
}

export interface Controller {
  id: string
  serialNumber: string
  ip?: string
  status: "online" | "offline"
  addedAt: string
  isRestarting?: boolean
}

export interface Door {
  id: string
  systemName: string // Immutable system name
  createdBy: AccessRole
  createdAt: string
}

export type EntityType = "doors" | "ibuttons" | "appusers" | "scenes"

// { userId: { entityType: { entityId: customName } } }
export type NameOverrides = Record<string, Record<string, Record<string, string>>>

export interface IButtonUser {
  id: string
  name: string
  chipId: string
  createdBy: AccessRole
  createdByName: string
  createdByRole: AccessRole
  createdAt: string
}

export interface AppUser {
  id: string
  name: string
  email?: string
  status?: "active" | "invited"
  access: AccessRole
  createdBy: AccessRole
  ownerDisplayName?: string
  adminOverrideName?: string
  createdByName: string
  createdByRole: AccessRole
  createdAt: string
}
