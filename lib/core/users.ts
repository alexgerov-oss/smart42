import type { AccessRole, AppUser, IButtonUser } from "@/lib/core/types"

export type CreatorIdentity = { name: string; email: string }

/**
 * iButtons:
 * - Open/Close не може да добавя
 * - Ако има trial/premium (active plan) -> unlimited
 * - Ако няма -> само 1 общо
 */
export function canCreateIButtonUser(role: AccessRole, adminHasActiveSubscription: boolean, currentCount: number): boolean {
  if (role === "open-close") return false
  return adminHasActiveSubscription ? true : currentCount < 1
}

/**
 * App users:
 * - Open/Close не може
 * - Трябва active plan (trial/premium)
 */
export function canCreateAppUser(role: AccessRole, adminHasActiveSubscription: boolean): boolean {
  if (role === "open-close") return false
  return adminHasActiveSubscription
}

export function fullAccessAccountCount(appUsers: AppUser[]): number {
  return appUsers.filter((u) => u.access === "full").length
}

export function canCreateFullAccessAccount(appUsers: AppUser[]): boolean {
  return fullAccessAccountCount(appUsers) < 1
}

export function updateIButtonUserName(users: IButtonUser[], id: string, name: string): IButtonUser[] {
  const nextName = name.trim()
  if (!nextName) return users
  return users.map((u) => (u.id === id ? { ...u, name: nextName } : u))
}

export function removeIButtonUser(users: IButtonUser[], id: string): IButtonUser[] {
  if (id === "1") return users
  return users.filter((u) => u.id !== id)
}

export function makeIButtonUser(params: {
  id: string
  now: number
  currentUserAccess: AccessRole
  creatorName: string
}): IButtonUser {
  return {
    id: params.id,
    name: "New iButton",
    chipId: `CHIP${params.now}`,
    createdBy: params.currentUserAccess,
    createdByName: params.creatorName,
    createdByRole: params.currentUserAccess,
    createdAt: new Date().toISOString(),
  }
}

export function appendIButtonUser(users: IButtonUser[], newUser: IButtonUser): IButtonUser[] {
  // basic safety: avoid duplicate id
  if (users.some((u) => u.id === newUser.id)) return users
  return [...users, newUser]
}

export function updateAppUserName(
  users: AppUser[],
  params: { id: string; name: string; currentUserAccess: AccessRole },
): { next: AppUser[]; fullAccessProfileByAdmin: { name: string; email: string } | null } {
  const nextName = params.name.trim()
  if (!nextName) return { next: users, fullAccessProfileByAdmin: null }

  // Special case: admin renames the "full" user id === "2"
  if (params.currentUserAccess === "admin" && params.id === "2") {
    const full = users.find((u) => u.id === "2")
    const profile = full ? { name: nextName, email: full.email || "" } : { name: nextName, email: "" }

    const next = users.map((u) => (u.id === params.id ? { ...u, name: nextName, adminOverrideName: nextName } : u))
    return { next, fullAccessProfileByAdmin: profile }
  }

  const next = users.map((u) => (u.id === params.id ? { ...u, name: nextName } : u))
  return { next, fullAccessProfileByAdmin: null }
}

export function makeAppUser(params: {
  id: string
  name: string
  email: string
  access: AccessRole
  currentUserAccess: AccessRole
  creatorName: string
}): AppUser {
  return {
    id: params.id,
    name: params.name.trim(),
    email: params.email.trim(),
    status: "invited",
    access: params.access,
    createdBy: params.currentUserAccess,
    createdByName: params.creatorName,
    createdByRole: params.currentUserAccess,
    createdAt: new Date().toISOString(),
  }
}

export function appendAppUser(users: AppUser[], newUser: AppUser): AppUser[] {
  const emailKey = (newUser.email || "").trim().toLowerCase()
  if (!emailKey) return users

  const exists = users.some((u) => (u.email || "").trim().toLowerCase() === emailKey)
  if (exists) return users

  return [...users, newUser]
}

export function removeAppUser(users: AppUser[], id: string): AppUser[] {
  if (id === "1") return users
  return users.filter((u) => u.id !== id)
}

export function updateAppUserAccess(users: AppUser[], id: string, access: AccessRole): AppUser[] {
  return users.map((u) => (u.id === id ? { ...u, access } : u))
}
