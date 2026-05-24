"use client"

import { useMemo, useState } from "react"
import type { AccessRole } from "@/lib/core/types"

// ✅ opts is optional + safe default (prevents "destructure of undefined")
const DEFAULT_FULL_ACCESS_NAME = ""
const DEFAULT_FULL_ACCESS_EMAIL = ""

export function useProfileState(opts?: { currentUserAccess?: AccessRole }) {
  const currentUserAccess: AccessRole = opts?.currentUserAccess ?? "admin"

  const isAdmin = currentUserAccess === "admin"
  const isFull = currentUserAccess === "full"
  const isOpenClose = currentUserAccess === "open-close"

  // Full Access activation gating
  const [fullAccessCreatedByAdmin, setFullAccessCreatedByAdmin] = useState(false)
  const fullIsActivated = fullAccessCreatedByAdmin
  const isBlockedFull = isFull && !fullIsActivated
  const canOperateFullRestrictedActions = !isBlockedFull

  // Profile
  const [userNamesByRole, setUserNamesByRole] = useState<Record<AccessRole, string>>({
    admin: "John Doe",
    full: DEFAULT_FULL_ACCESS_NAME,
    "open-close": "",
  })

  const userName = userNamesByRole[currentUserAccess] ?? ""

  const [userEmailsByRole, setUserEmailsByRole] = useState<Record<AccessRole, string>>({
    admin: "john.doe@example.com",
    full: DEFAULT_FULL_ACCESS_EMAIL,
    "open-close": "",
  })

  const userEmail = userEmailsByRole[currentUserAccess] ?? ""

  const setUserEmail = (email: string) => {
    const nextEmail = email.trim()
    if (!nextEmail) return
    setUserEmailsByRole((prev) => ({ ...prev, [currentUserAccess]: nextEmail }))
  }

  // Full access profile (created by admin)
  const [fullAccessProfileByAdmin, _setFullAccessProfileByAdmin] = useState<{ name: string; email: string } | null>(null)

  const setFullAccessProfileByAdmin = (profile: { name: string; email: string } | null) => {
    const previousProfile = fullAccessProfileByAdmin
    _setFullAccessProfileByAdmin(profile)

    if (!profile) return

    setUserNamesByRole((prev) => {
      const currentFullName = prev.full
      const canInitializeFullName =
        currentFullName === DEFAULT_FULL_ACCESS_NAME ||
        Boolean(previousProfile && currentFullName === previousProfile.name)

      return canInitializeFullName ? { ...prev, full: profile.name } : prev
    })

    setUserEmailsByRole((prev) => {
      const currentFullEmail = prev.full
      const canInitializeFullEmail =
        currentFullEmail === DEFAULT_FULL_ACCESS_EMAIL ||
        Boolean(previousProfile && currentFullEmail === previousProfile.email)

      return canInitializeFullEmail ? { ...prev, full: profile.email } : prev
    })
  }

  const creatorIdentity = useMemo(() => {
    if (isFull && fullAccessProfileByAdmin) {
      return { name: fullAccessProfileByAdmin.name, email: fullAccessProfileByAdmin.email }
    }
    return { name: userName, email: userEmail }
  }, [isFull, fullAccessProfileByAdmin, userName, userEmail])

  return {
    isAdmin,
    isFull,
    isOpenClose,

    userNamesByRole,
    setUserNamesByRole,
    userName,
    userEmail,
    setUserEmail,

    fullAccessCreatedByAdmin,
    setFullAccessCreatedByAdmin,
    fullIsActivated,
    canOperateFullRestrictedActions,

    fullAccessProfileByAdmin,
    setFullAccessProfileByAdmin,

    creatorIdentity,
  }
}
