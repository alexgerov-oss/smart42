/**
 * Centralized permission and role checks
 * Defaults to MOST restrictive behavior on any uncertainty
 */

import type { AccessRole, EntityType } from "@/lib/core/types"

// Alias for readability
export type UserRole = AccessRole

export interface PermissionContext {
  currentUserAccess: UserRole

  /**
   * ✅ Unified plan flag (trial/premium/subscription)
   * If missing => treated as NO plan (restrictive).
   */
  hasPlan?: boolean
  // Optional trial fields (some parts of the app may not provide them)
  trialDaysLeft?: number
  isTrialActive?: boolean
  isTrialExpired?: boolean
}

/**
 * ✅ From old lib/core/permissions.ts (merged here)
 * Entity rename rules.
 */
export function canRenameEntity(role: AccessRole, entityType: EntityType): boolean {
  // Scenes can be renamed by all roles (as it was)
  if (entityType === "scenes") return true

  // For others: admin and full can rename
  return role === "admin" || role === "full"
}

function hasActivePlan(ctx: PermissionContext): boolean {
  // ✅ Prefer unified field
  if (typeof ctx.hasPlan === "boolean") return ctx.hasPlan
  // Trial signals (restrictive defaults)
  const trialDaysLeft = typeof ctx.trialDaysLeft === "number" ? ctx.trialDaysLeft : 0
  const trialActiveFlag = Boolean(ctx.isTrialActive)
  const trialExpiredFlag = Boolean(ctx.isTrialExpired)

  const trialActive = (trialDaysLeft > 0 || trialActiveFlag) && !trialExpiredFlag
  return trialActive
}

/**
 * Permission checks - default to restrictive behavior
 */
export class Permissions {
  /**
   * Doors management (Admin only)
   */
  static canAddDoors(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin"
  }

  static canEditDoors(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin"
  }

  static canDeleteDoors(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin"
  }

  static canRenameDoors(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  /**
   * App users
   * - Open/Close: cannot add
   * - Admin/Full: can add only if plan is active (trial/premium)
   */
  static canAddAppUsers(ctx: PermissionContext): boolean {
    if (ctx.currentUserAccess === "open-close") return false
    return hasActivePlan(ctx)
  }

  static canEditAppUsers(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  static canDeleteAppUsers(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  static canRenameAppUsers(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  /**
   * iButton permissions
   * - Admin can add; free limit is enforced in core/users.ts
   * - Full Access can add only if Admin has active plan
   * - Open/Close cannot add
   */
  static canAddIButtons(ctx: PermissionContext): boolean {
    if (ctx.currentUserAccess === "admin") return true
    if (ctx.currentUserAccess === "full") return hasActivePlan(ctx)
    return false
  }

  static canEditIButtons(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  static canDeleteIButtons(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  static canRenameIButtons(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  /**
   * Controller management - Admin only
   */
  static canManageControllers(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin"
  }

  static canChangeControllerSettings(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin"
  }

  /**
   * Activity / Settings / Scenes access
   */
  static canAccessActivity(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  static canAccessSettings(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  static canAccessScenes(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  /**
   * Lock/unlock doors - ALWAYS allowed
   */
  static canLockUnlockDoors(_ctx: PermissionContext): boolean {
    return true
  }

  /**
   * Quick controls - all roles can use (admin may lock them elsewhere in UI)
   */
  static canUseQuickControls(_ctx: PermissionContext): boolean {
    return true
  }
}
