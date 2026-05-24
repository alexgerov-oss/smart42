"use client"

import { useState } from "react"
import type { AccessRole, AppUser, IButtonUser } from "@/lib/core/types"

import {
  canCreateIButtonUser as canCreateIButtonUserCore,
  canCreateAppUser as canCreateAppUserCore,
  updateIButtonUserName as updateIButtonUserNameCore,
  removeIButtonUser as removeIButtonUserCore,
  makeIButtonUser as makeIButtonUserCore,
  appendIButtonUser as appendIButtonUserCore,
  updateAppUserName as updateAppUserNameCore,
  makeAppUser as makeAppUserCore,
  appendAppUser as appendAppUserCore,
  removeAppUser as removeAppUserCore,
  updateAppUserAccess as updateAppUserAccessCore,
} from "@/lib/core/users"

import { loadAppUsers, loadIButtonUsers, saveAppUsers, saveIButtonUsers } from "@/lib/core/users-persistence"

// ✅ opts optional + safe defaults (prevents "destructure of undefined")
export function useUsersState(opts?: {
  currentUserAccess?: AccessRole
  hasPlan?: boolean
  canOperate?: boolean
  isOpenClose?: boolean
  creatorIdentity?: { name: string; email: string }

  onFullAccessCreatedByAdmin?: (profile: { name: string; email: string }) => void
  onFullAccessProfileByAdminChange?: (profile: { name: string; email: string } | null) => void
}) {
  const currentUserAccess: AccessRole = opts?.currentUserAccess ?? "open-close"
  const hasPlan = opts?.hasPlan ?? false
  const canOperate = opts?.canOperate ?? false
  const isOpenClose = opts?.isOpenClose ?? (currentUserAccess === "open-close")
  const creatorIdentity = opts?.creatorIdentity ?? { name: "", email: "" }

  const onFullAccessCreatedByAdmin = opts?.onFullAccessCreatedByAdmin ?? (() => {})
  const onFullAccessProfileByAdminChange = opts?.onFullAccessProfileByAdminChange ?? (() => {})

  const [iButtonUsers, _setIButtonUsers] = useState<IButtonUser[]>(() => loadIButtonUsers())
  const [appUsers, _setAppUsers] = useState<AppUser[]>(() => loadAppUsers())

  // Persisting setters
  const setIButtonUsers: React.Dispatch<React.SetStateAction<IButtonUser[]>> = (value) => {
    _setIButtonUsers((prev) => {
      const next = typeof value === "function" ? (value as (p: IButtonUser[]) => IButtonUser[])(prev) : value
      saveIButtonUsers(next)
      return next
    })
  }

  const setAppUsers: React.Dispatch<React.SetStateAction<AppUser[]>> = (value) => {
    _setAppUsers((prev) => {
      const next = typeof value === "function" ? (value as (p: AppUser[]) => AppUser[])(prev) : value
      saveAppUsers(next)
      return next
    })
  }

  // ✅ Admin не трябва да бъде “тайно блокиран” от canOperate (plan-а го ограничава)
  const canMutate = (currentUserAccess === "admin" ? true : canOperate) && !isOpenClose

  const canCreateIButtonUser = () =>
    canCreateIButtonUserCore(currentUserAccess, hasPlan, iButtonUsers.length)

  // ✅ FIX: Free Admin (без plan) -> максимум 1 App User
  const canCreateAppUser = () => {
    // Free Admin limit
    if (currentUserAccess === "admin" && !hasPlan) {
      return appUsers.length < 1
    }
    return canCreateAppUserCore(currentUserAccess, hasPlan)
  }

  const updateIButtonUser = (id: string, name: string) => {
    if (!canMutate) return
    setIButtonUsers((prev) => updateIButtonUserNameCore(prev, id, name))
  }

  const updateAppUser = (id: string, name: string) => {
    if (!canMutate) return

    setAppUsers((prev) => {
      const result = updateAppUserNameCore(prev, { id, name, currentUserAccess })
      if (result.fullAccessProfileByAdmin !== undefined) {
        onFullAccessProfileByAdminChange(result.fullAccessProfileByAdmin)
      }
      return result.next
    })
  }

  const addIButtonUser = () => {
    if (!canMutate) return `ibutton-blocked-${Date.now()}`
    if (!canCreateIButtonUser()) return `ibutton-blocked-${Date.now()}`

    const now = Date.now()
    const newId = `ibutton-${now}`
    const newUser = makeIButtonUserCore({
      id: newId,
      now,
      currentUserAccess,
      creatorName: creatorIdentity.name,
    })

    setIButtonUsers((prev) => appendIButtonUserCore(prev, newUser))
    return newId
  }

  const removeIButtonUser = (id: string) => {
    if (!canMutate) return
    setIButtonUsers((prev) => removeIButtonUserCore(prev, id))
  }

  // ✅ Стабилно добавяне с проверка за план + duplicate email
  const addAppUser = (name: string, email: string, access: AccessRole): boolean => {
    if (!canMutate) return false
    if (!canCreateAppUser()) return false

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    if (!cleanName || !cleanEmail) return false

    const emailKey = cleanEmail.toLowerCase()

    const now = Date.now()
    const newId = `appuser-${now}`
    const newUser = makeAppUserCore({
      id: newId,
      name: cleanName,
      email: cleanEmail,
      access,
      currentUserAccess,
      creatorName: creatorIdentity.name,
    })

    let added = false
    let createdFullProfile: { name: string; email: string } | null = null

    setAppUsers((prev) => {
      const exists = prev.some((u) => (u.email || "").trim().toLowerCase() === emailKey)
      if (exists) return prev

      added = true
      if (currentUserAccess === "admin" && access === "full") {
        createdFullProfile = { name: cleanName, email: cleanEmail }
      }
      return appendAppUserCore(prev, newUser)
    })

    if (createdFullProfile) {
      onFullAccessCreatedByAdmin(createdFullProfile)
    }

    return added
  }

  const removeAppUser = (id: string) => {
    if (!canMutate) return
    setAppUsers((prev) => removeAppUserCore(prev, id))
  }

  const updateAppUserAccess = (id: string, access: AccessRole) => {
    if (!canMutate) return
    setAppUsers((prev) => updateAppUserAccessCore(prev, id, access))
  }

  return {
    iButtonUsers,
    setIButtonUsers,
    appUsers,
    setAppUsers,

    canCreateIButtonUser,
    canCreateAppUser,

    updateIButtonUser,
    updateAppUser,

    addIButtonUser,
    removeIButtonUser,

    addAppUser,
    removeAppUser,
    updateAppUserAccess,
  }
}
