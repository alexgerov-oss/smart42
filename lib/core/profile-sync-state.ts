"use client"

import type { AccessRole, AppUser } from "@/lib/core/types"
import { createSetUserNameHandler, useProfileSyncToAppUsers } from "@/lib/core/profile-sync"

export function useProfileSyncState(opts: {
  currentUserAccess: AccessRole
  isAdmin: boolean
  isFull: boolean
  isOpenClose: boolean
  canOperate: boolean
  userNamesByRole: Record<AccessRole, string>
  setUserNamesByRole: React.Dispatch<React.SetStateAction<Record<AccessRole, string>>>
  setAppUsers: React.Dispatch<React.SetStateAction<AppUser[]>>
}) {
  const {
    currentUserAccess,
    isAdmin,
    isFull,
    isOpenClose,
    canOperate,
    userNamesByRole,
    setUserNamesByRole,
    setAppUsers,
  } = opts

  const setUserName = createSetUserNameHandler({
    canOperate,
    isOpenClose,
    currentUserAccess,
    isAdmin,
    isFull,
    setUserNamesByRole,
    setAppUsers,
  })

  useProfileSyncToAppUsers({
    currentUserAccess,
    userNamesByRole,
    isAdmin,
    isFull,
    setAppUsers,
  })

  return { setUserName }
}
