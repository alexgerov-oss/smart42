"use client"

import { useMemo } from "react"
import type { AppUser } from "@/lib/core/types"
import {
  fullAccessAccountCount as fullAccessAccountCountCore,
  canCreateFullAccessAccount as canCreateFullAccessAccountCore,
} from "@/lib/core/users"

export function useFullAccessState(opts: {
  appUsers: AppUser[]
  isFull: boolean
  adminHasActiveSubscription: boolean
  fullIsActivated: boolean
  fullAccessProfileByAdmin: { name: string; email: string } | null
}) {
  const { appUsers, isFull, adminHasActiveSubscription, fullIsActivated, fullAccessProfileByAdmin } = opts

  const fullAccessAccountCount = useMemo(() => fullAccessAccountCountCore(appUsers), [appUsers])
  const canCreateFullAccessAccount = () => canCreateFullAccessAccountCore(appUsers)
  const isFullAccessUserActivated = (): boolean => fullIsActivated
  const canFullAccessAddUsers = (): boolean => (!isFull ? true : adminHasActiveSubscription)
  const getFullAccessUserProfile = () => fullAccessProfileByAdmin

  return {
    fullAccessAccountCount,
    canCreateFullAccessAccount,
    isFullAccessUserActivated,
    canFullAccessAddUsers,
    getFullAccessUserProfile,
  }
}
