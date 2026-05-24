"use client"

import { useMemo, useState } from "react"
import type { AccessRole } from "@/lib/core/types"

// ✅ opts is optional + safe default (prevents "destructure of undefined")
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
    full: "Jane Smith",
    "open-close": "Guest User",
  })

  const userName = userNamesByRole[currentUserAccess] ?? userNamesByRole.admin ?? "User"

  const [userEmailsByRole, setUserEmailsByRole] = useState<Record<AccessRole, string>>({
    admin: "john.doe@example.com",
    full: "jane.smith@example.com",
    "open-close": "guest@example.com",
  })

  const userEmail = userEmailsByRole[currentUserAccess] ?? userEmailsByRole.admin ?? "user@example.com"

  const setUserEmail = (email: string) => {
    const nextEmail = email.trim()
    if (!nextEmail) return
    setUserEmailsByRole((prev) => ({ ...prev, [currentUserAccess]: nextEmail }))
  }

  // Full access profile (created by admin)
  const [fullAccessProfileByAdmin, setFullAccessProfileByAdmin] = useState<{ name: string; email: string } | null>(null)

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
