// lib/core/naming.ts
import { storage } from "./storage"
import type { EntityType, NameOverrides } from "./types"

// Четене/запис на целия обект от storage
export function readNameOverrides(): NameOverrides {
  return storage.getJSON("nameOverrides", {} as NameOverrides)
}

export function writeNameOverrides(next: NameOverrides) {
  storage.setJSON("nameOverrides", next)
}

// Вземи override име (ако има)
export function getUserOverride(
  overrides: NameOverrides,
  userId: string,
  entityType: EntityType,
  entityId: string,
): string | undefined {
  return overrides?.[userId]?.[entityType]?.[entityId]
}

// Запиши override име (връща нов обект, НЕ мутира стария)
export function setUserOverride(
  overrides: NameOverrides,
  userId: string,
  entityType: EntityType,
  entityId: string,
  customName: string,
): NameOverrides {
  return {
    ...overrides,
    [userId]: {
      ...(overrides[userId] || {}),
      [entityType]: {
        ...((overrides[userId] || {})[entityType] || {}),
        [entityId]: customName,
      },
    },
  }
}
