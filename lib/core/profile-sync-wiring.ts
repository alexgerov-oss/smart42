"use client"

import type React from "react"
import type { AccessRole, AppUser } from "@/lib/core/types"
import { useProfileSyncState } from "@/lib/core/profile-sync-state"

type ProfileLike = {
  isAdmin: boolean
  isFull: boolean
  isOpenClose: boolean
  canOperateFullRestrictedActions: boolean
  userNamesByRole: Record<AccessRole, string>
  setUserNamesByRole: React.Dispatch<React.SetStateAction<Record<AccessRole, string>>>
}

type UsersLike = {
  setAppUsers: React.Dispatch<React.SetStateAction<AppUser[]>>
}

export function useProfileSyncWiring(args: {
  currentUserAccess: AccessRole
  profile: ProfileLike
  users: UsersLike
}) {
  const { currentUserAccess, profile, users } = args

  // IMPORTANT:
  // Реалната логика остава в useProfileSyncState (без да пипаме поведението).
  return useProfileSyncState({
    currentUserAccess,
    isAdmin: profile.isAdmin,
    isFull: profile.isFull,
    isOpenClose: profile.isOpenClose,
    canOperate: profile.canOperateFullRestrictedActions,
    userNamesByRole: profile.userNamesByRole,
    setUserNamesByRole: profile.setUserNamesByRole,
    setAppUsers: users.setAppUsers,
  })
}
