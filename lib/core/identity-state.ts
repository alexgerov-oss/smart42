"use client"

import { getCurrentUserId } from "@/lib/core/identity"
import { useNameOverrides } from "@/lib/core/name-overrides"
import type { AccessRole, EntityType, NameOverrides } from "@/lib/core/types"

export function useIdentityState(opts: { currentUserAccess: AccessRole }) {
  const { currentUserAccess } = opts
  const currentUserId = getCurrentUserId(currentUserAccess)

  const { nameOverrides, getEntityName, setEntityName } = useNameOverrides({
    currentUserId,
    currentUserAccess,
  })

  return {
    currentUserId,
    nameOverrides: nameOverrides as NameOverrides,
    getEntityName: getEntityName as (entityType: EntityType, entityId: string, defaultName: string) => string,
    setEntityName: setEntityName as (entityType: EntityType, entityId: string, customName: string) => void,
  }
}
