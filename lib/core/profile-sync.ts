import { useEffect, type Dispatch, type SetStateAction } from "react"
import type { AccessRole, AppUser } from "@/lib/core/types"

export type UserNamesByRole = Record<AccessRole, string>

export function updateRoleName(prev: UserNamesByRole, role: AccessRole, name: string): UserNamesByRole {
  const nextName = name.trim()
  if (!nextName) return prev
  return { ...prev, [role]: nextName }
}

export function syncProfileNameInAppUsers(
  users: AppUser[],
  params: { role: AccessRole; name: string; isAdmin: boolean; isFull: boolean },
): AppUser[] {
  const nextName = params.name.trim()
  if (!nextName) return users

  if (params.isAdmin) {
    return users.map((u) => (u.id === "1" ? { ...u, name: nextName, access: params.role } : u))
  }

  if (params.isFull) {
    return users.map((u) =>
      u.id === "2" && u.access === "full" ? { ...u, name: nextName, ownerDisplayName: nextName } : u,
    )
  }

  return users
}

export function useProfileSyncToAppUsers(params: {
  currentUserAccess: AccessRole
  userNamesByRole: UserNamesByRole
  isAdmin: boolean
  isFull: boolean
  setAppUsers: Dispatch<SetStateAction<AppUser[]>>
}) {
  const { currentUserAccess, userNamesByRole, isAdmin, isFull, setAppUsers } = params

  useEffect(() => {
    const currentName = userNamesByRole[currentUserAccess]
    if (!currentName) return

    setAppUsers((prev) =>
      syncProfileNameInAppUsers(prev, {
        role: currentUserAccess,
        name: currentName,
        isAdmin,
        isFull,
      }),
    )
  }, [currentUserAccess, userNamesByRole, isAdmin, isFull, setAppUsers])
}

export function createSetUserNameHandler(params: {
  canOperate: boolean
  isOpenClose: boolean
  currentUserAccess: AccessRole
  isAdmin: boolean
  isFull: boolean
  setUserNamesByRole: Dispatch<SetStateAction<UserNamesByRole>>
  setAppUsers: Dispatch<SetStateAction<AppUser[]>>
}) {
  const { canOperate, isOpenClose, currentUserAccess, isAdmin, isFull, setUserNamesByRole, setAppUsers } = params

  return (name: string) => {
    if (isOpenClose) return
    if (!canOperate && !isFull) return

    setUserNamesByRole((prev) => updateRoleName(prev, currentUserAccess, name))

    const nextName = name.trim()
    if (!nextName) return

    setAppUsers((prev) =>
      syncProfileNameInAppUsers(prev, {
        role: currentUserAccess,
        name: nextName,
        isAdmin,
        isFull,
      }),
    )
  }
}
