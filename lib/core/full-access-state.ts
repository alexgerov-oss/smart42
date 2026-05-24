"use client"

import { useMemo } from "react"
import type { AppUser } from "@/lib/core/types"
import {
  fullAccessAccountCount as fullAccessAccountCountCore,
  canCreateFullAccessAccount as canCreateFullAccessAccountCore,
} from "@/lib/core/users"

const EMPTY_APP_USERS: AppUser[] = []

// ✅ opts optional + safe defaults (prevents "destructure of undefined")
export function useFullAccessState(opts?: {
  appUsers?: AppUser[]
  isFull?: boolean
  hasPlan?: boolean
  fullIsActivated?: boolean
  fullAccessProfileByAdmin?: { name: string; email: string } | null
}) {
  const appUsers = opts?.appUsers ?? EMPTY_APP_USERS
  const isFull = opts?.isFull ?? false
  const hasPlan = opts?.hasPlan ?? false
  const fullIsActivated = opts?.fullIsActivated ?? false
  const fullAccessProfileByAdmin = opts?.fullAccessProfileByAdmin ?? null

  const fullAccessAccountCount = useMemo(() => fullAccessAccountCountCore(appUsers), [appUsers])
  const canCreateFullAccessAccount = () => canCreateFullAccessAccountCore(appUsers)
  const isFullAccessUserActivated = (): boolean => fullIsActivated
  const canFullAccessAddUsers = (): boolean => (!isFull ? true : hasPlan)
  const getFullAccessUserProfile = () => fullAccessProfileByAdmin

  return {
    fullAccessAccountCount,
    canCreateFullAccessAccount,
    isFullAccessUserActivated,
    canFullAccessAddUsers,
    getFullAccessUserProfile,
  }
}
