"use client"

import type { AccessRole, AppUser } from "@/lib/core/types"
import { createSetUserNameHandler } from "@/lib/core/profile-sync"

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
    setUserNamesByRole,
    setAppUsers,
  } = opts

  // IMPORTANT:
  // НЕ викаме useProfileSyncToAppUsers тук, защото може да презаписва appUsers
  // и да "изяжда" новодобавените покани.
  const setUserName = createSetUserNameHandler({
    canOperate,
    isOpenClose,
    currentUserAccess,
    isAdmin,
    isFull,
    setUserNamesByRole,
    setAppUsers,
  })

  return { setUserName }
}
