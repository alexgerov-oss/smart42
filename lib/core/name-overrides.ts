import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { storage } from "@/lib/core/storage"
import { getUserOverride, setUserOverride } from "@/lib/core/naming"
import { canRenameEntity } from "@/lib/core/permissions"
import type { AccessRole, EntityType, NameOverrides } from "@/lib/core/types"

type UseNameOverridesParams = {
  currentUserId: string
  currentUserAccess: AccessRole
}

export function useNameOverrides({ currentUserId, currentUserAccess }: UseNameOverridesParams): {
  nameOverrides: NameOverrides
  getEntityName: (entityType: EntityType, entityId: string, defaultName: string) => string
  setEntityName: (entityType: EntityType, entityId: string, customName: string) => void
  setNameOverrides: Dispatch<SetStateAction<NameOverrides>>
} {
  const [nameOverrides, setNameOverrides] = useState<NameOverrides>(() => storage.getJSON("nameOverrides", {}))

  useEffect(() => {
    storage.setJSON("nameOverrides", nameOverrides)
  }, [nameOverrides])

  const getEntityName = useMemo(() => {
    return (entityType: EntityType, entityId: string, defaultName: string) => {
      return getUserOverride(nameOverrides, currentUserId, entityType, entityId) ?? defaultName
    }
  }, [nameOverrides, currentUserId])

  const setEntityName = useMemo(() => {
    return (entityType: EntityType, entityId: string, customName: string) => {
      if (!canRenameEntity(currentUserAccess, entityType)) return

      setNameOverrides((prev) => {
        const updated = setUserOverride(prev, currentUserId, entityType, entityId, customName)
        storage.setJSON("nameOverrides", updated) // persist immediately
        return updated
      })
    }
  }, [currentUserAccess, currentUserId])

  return { nameOverrides, getEntityName, setEntityName, setNameOverrides }
}
