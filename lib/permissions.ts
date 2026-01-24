/**
 * Centralized permission and role checks
 * Defaults to MOST restrictive behavior on any uncertainty
 */

export type UserRole = "admin" | "full" | "open-close"

export interface PermissionContext {
  currentUserAccess: UserRole
  adminHasActiveSubscription: boolean
  isTrialActive: boolean
  isTrialExpired: boolean
}

/**
 * Permission checks - all default to restrictive behavior
 */
export class Permissions {
  /**
   * Admin can do everything except be restricted by trial
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
   * Full Access can add app users ONLY if admin has premium OR active trial
   */
  static canAddAppUsers(ctx: PermissionContext): boolean {
    if (ctx.currentUserAccess === "admin") {
      // Admin can always add users (not restricted by trial)
      return true
    }
    if (ctx.currentUserAccess === "full") {
      // Full Access can add users if admin has premium OR active trial
      return ctx.adminHasActiveSubscription && !ctx.isTrialExpired
    }
    // Open/Close Only cannot add users
    return false
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
   */
  static canAddIButtons(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
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
   * Activity access
   */
  static canAccessActivity(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  /**
   * Settings access
   */
  static canAccessSettings(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  /**
   * Scenes access
   */
  static canAccessScenes(ctx: PermissionContext): boolean {
    return ctx.currentUserAccess === "admin" || ctx.currentUserAccess === "full"
  }

  /**
   * Lock/unlock doors - all roles can do this
   */
  static canLockUnlockDoors(ctx: PermissionContext): boolean {
    return true
  }

  /**
   * Quick controls - all roles can use, but admin can lock them
   */
  static canUseQuickControls(ctx: PermissionContext): boolean {
    return true
  }
}






