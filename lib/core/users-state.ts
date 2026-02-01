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

export function useUsersState(opts: {
  currentUserAccess: AccessRole
  adminHasActiveSubscription: boolean
  canOperate: boolean
  isOpenClose: boolean
  creatorIdentity: { name: string; email: string }

  onFullAccessCreatedByAdmin: (profile: { name: string; email: string }) => void
  onFullAccessProfileByAdminChange: (profile: { name: string; email: string } | null) => void
}) {
  const {
    currentUserAccess,
    adminHasActiveSubscription,
    canOperate,
    isOpenClose,
    creatorIdentity,
    onFullAccessCreatedByAdmin,
    onFullAccessProfileByAdminChange,
  } = opts

  const [iButtonUsers, setIButtonUsers] = useState<IButtonUser[]>([])
  const [appUsers, setAppUsers] = useState<AppUser[]>([])

  const canCreateIButtonUser = () =>
    canCreateIButtonUserCore(currentUserAccess, adminHasActiveSubscription, iButtonUsers.length)

  const canCreateAppUser = () => canCreateAppUserCore(currentUserAccess, adminHasActiveSubscription)

  const updateIButtonUser = (id: string, name: string) => {
    if (!canOperate) return
    if (isOpenClose) return
    setIButtonUsers((prev) => updateIButtonUserNameCore(prev, id, name))
  }

  const updateAppUser = (id: string, name: string) => {
    if (!canOperate) return
    if (isOpenClose) return

    setAppUsers((prev) => {
      const result = updateAppUserNameCore(prev, { id, name, currentUserAccess })
      if (result.fullAccessProfileByAdmin !== undefined) {
        onFullAccessProfileByAdminChange(result.fullAccessProfileByAdmin)
      }
      return result.next
    })
  }

  const addIButtonUser = () => {
    if (!canOperate) return `ibutton-blocked-${Date.now()}`
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
    if (!canOperate) return
    if (isOpenClose) return
    setIButtonUsers((prev) => removeIButtonUserCore(prev, id))
  }

  const addAppUser = (name: string, email: string, access: AccessRole) => {
    if (!canOperate) return
    if (!canCreateAppUser()) return

    if (currentUserAccess === "admin" && access === "full") {
      onFullAccessCreatedByAdmin({ name, email })
    }

    const now = Date.now()
    const newId = `appuser-${now}`
    const newUser = makeAppUserCore({
      id: newId,
      name,
      email,
      access,
      currentUserAccess,
      creatorName: creatorIdentity.name,
    })

    setAppUsers((prev) => appendAppUserCore(prev, newUser))
  }

  const removeAppUser = (id: string) => {
    if (!canOperate) return
    if (isOpenClose) return
    setAppUsers((prev) => removeAppUserCore(prev, id))
  }

  const updateAppUserAccess = (id: string, access: AccessRole) => {
    if (!canOperate) return
    if (isOpenClose) return
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
