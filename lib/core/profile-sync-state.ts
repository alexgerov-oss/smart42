"use client"

import type { AccessRole, AppUser } from "@/lib/core/types"
import { createSetUserNameHandler } from "@/lib/core/profile-sync"

// ✅ opts optional + safe defaults (prevents "destructure of undefined")
export function useProfileSyncState(opts?: {
  currentUserAccess?: AccessRole
  isAdmin?: boolean
  isFull?: boolean
  isOpenClose?: boolean
  canOperate?: boolean
  userNamesByRole?: Record<AccessRole, string>
  setUserNamesByRole?: React.Dispatch<React.SetStateAction<Record<AccessRole, string>>>
  setAppUsers?: React.Dispatch<React.SetStateAction<AppUser[]>>
}) {
  const currentUserAccess: AccessRole = opts?.currentUserAccess ?? "admin"
  const isAdmin = opts?.isAdmin ?? (currentUserAccess === "admin")
  const isFull = opts?.isFull ?? (currentUserAccess === "full")
  const isOpenClose = opts?.isOpenClose ?? (currentUserAccess === "open-close")
  const canOperate = opts?.canOperate ?? false

  const setUserNamesByRole =
    opts?.setUserNamesByRole ?? ((_: React.SetStateAction<Record<AccessRole, string>>) => {})
  const setAppUsers = opts?.setAppUsers ?? ((_: React.SetStateAction<AppUser[]>) => {})

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
