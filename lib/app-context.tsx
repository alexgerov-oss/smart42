"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { doorActions } from "@/lib/core/door-actions"

import { useSystemStatusState } from "@/lib/core/system-status-state"
import { useAccessState } from "@/lib/core/access-state"
import { useSubscriptionState } from "@/lib/core/subscription-state"
import { useUiPreferences } from "@/lib/core/ui-preferences"
import { useSessionState } from "@/lib/core/session-state"

import { useProfileState } from "@/lib/core/profile-state"
import { useProfileSyncWiring } from "@/lib/core/profile-sync-wiring"

import { useUsersState } from "@/lib/core/users-state"
import { useScenesState } from "@/lib/core/scenes-state"
import { useLockState } from "@/lib/core/lock-state"
import { useLockUnlockWiring } from "@/lib/core/lock-unlock-wiring"

import { useIdentityState } from "@/lib/core/identity-state"
import { useDoorsState } from "@/lib/core/doors-state"

import { useFullAccessState } from "@/lib/core/full-access-state"
import { useControllersWiring } from "@/lib/core/controllers-wiring"

import { useActivityLogState, type AddActivityLogInput } from "@/lib/core/activity-log-state"
import type { ActivityLogEntry } from "@/lib/core/activity-log"

import type {
  AccessRole,
  AppUser,
  Controller,
  Door,
  EntityType,
  IButtonUser,
  NameOverrides,
  Scene,
} from "@/lib/core/types"

interface AppContextType {
  isSystemStatusExpanded: boolean
  setIsSystemStatusExpanded: (expanded: boolean) => void

  scenes: Scene[]
  setScenes: (scenes: Scene[]) => void
  canCreateScene: () => boolean

  countdown: number | null
  doorState: "lock" | "unlock"
  setDoorState: (state: "lock" | "unlock") => void

  // ✅ Explicit actions (anti-regression)
  lockDoor: (doorId: string) => ReturnType<typeof doorActions.lock>
  unlockDoor: (doorId: string) => ReturnType<typeof doorActions.unlock>

  autoLockDelay: number
  setAutoLockDelay: (delay: number) => void
  autoLockEnabled: boolean
  setAutoLockEnabled: (enabled: boolean) => void

  autoNightLockEnabled: boolean
  setAutoNightLockEnabled: (enabled: boolean) => void
  nightLockHour: string
  setNightLockHour: (hour: string) => void
  nightLockMinute: string
  setNightLockMinute: (minute: string) => void
  nightLockPeriod: "AM" | "PM"
  setNightLockPeriod: (period: "AM" | "PM") => void
  lastNightLockDate: string | null
  setLastNightLockDate: (date: string | null) => void

  quickControlsLocked: boolean
  setQuickControlsLocked: (locked: boolean) => void

  userName: string
  setUserName: (name: string) => void
  userEmail: string
  setUserEmail: (email: string) => void
  setUserProfileForRole: (role: AccessRole, profile: { name?: string; email?: string }) => void

  iButtonUsers: IButtonUser[]
  canCreateIButtonUser: () => boolean

  appUsers: AppUser[]
  canCreateAppUser: () => boolean

  currentUserAccess: AccessRole
  setCurrentUserAccess: (access: AccessRole) => void

  updateIButtonUser: (id: string, name: string) => void
  updateAppUser: (id: string, name: string) => void
  addIButtonUser: () => string
  removeIButtonUser: (id: string) => void
  addAppUser: (name: string, email: string, access: AccessRole) => boolean

  removeAppUser: (id: string) => void
  updateAppUserAccess: (id: string, access: AccessRole) => void

  controllers: Controller[]
  addController: (serialNumber: string, ip?: string) => boolean
  updateController: (id: string, serialNumber: string, ip?: string) => boolean
  removeController: (id: string) => void
  updateControllerStatus: (id: string, status: "online" | "offline") => void
  getActiveController: () => Controller | null
  restartController: (id: string) => void

  sessionPassword: string
  setSessionPassword: (password: string) => void

  selectedDoorId: string
  setSelectedDoorId: (doorId: string) => void

  doors: Door[]
  addDoor: (systemName: string) => string | null
  updateDoor: (id: string, systemName: string) => boolean
  removeDoor: (id: string) => void

  currentUserId: string
  nameOverrides: NameOverrides
  getEntityName: (entityType: EntityType, entityId: string, defaultName: string) => string
  setEntityName: (entityType: EntityType, entityId: string, customName: string) => void

  // ✅ Activity Log (persisted)
  activityLog: ActivityLogEntry[]
  logActivity: (input: AddActivityLogInput) => void
  clearActivityLog: () => void

  trialDaysLeft: number

  // ✅ unified flag for UI (trial OR premium)
  hasPlan: boolean

  fullAccessAccountCount: number
  canCreateFullAccessAccount: () => boolean
  isFullAccessUserActivated: () => boolean
  canFullAccessAddUsers: () => boolean
  getFullAccessUserProfile: () => { name: string; email: string } | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedDoorId, setSelectedDoorId] = useState("main-door")

  // System UI
  const { isSystemStatusExpanded, setIsSystemStatusExpanded } = useSystemStatusState(true)

  // Access
  const { currentUserAccess, setCurrentUserAccess } = useAccessState("admin")

  // Subscription (core = source of truth)
  const subscription = useSubscriptionState()
  const trialDaysLeftValue = subscription.trialDaysLeft

  const hasPlan = subscription.hasPlan

  // Profile base state
  const profile = useProfileState({ currentUserAccess })

  // Users
  const users = useUsersState({
    currentUserAccess,
    hasPlan,
    canOperate: profile.canOperateFullRestrictedActions,
    isOpenClose: profile.isOpenClose,
    creatorIdentity: profile.creatorIdentity,
    doorId: selectedDoorId,
    onFullAccessCreatedByAdmin: (p) => {
      profile.setFullAccessCreatedByAdmin(true)
      profile.setFullAccessProfileByAdmin(p)
    },
    onFullAccessProfileByAdminChange: (p) => {
      profile.setFullAccessProfileByAdmin(p)
    },
  })

  // Profile sync (extracted wiring)
  const { setUserName: setUserNameHandler } = useProfileSyncWiring({
    currentUserAccess,
    profile,
    users,
  })

  // Scenes
  const { scenes, setScenes, canCreateScene } = useScenesState({
    currentUserAccess,
    hasPlan,
    doorId: selectedDoorId,
  })

  // Lock/timers (UI state)
  const lock = useLockState()

  // UI preferences (quick controls lock)
  const { quickControlsLocked, setQuickControlsLocked } = useUiPreferences()

  // Session
  const { sessionPassword, setSessionPassword } = useSessionState()

  // Identity + name overrides
  const identity = useIdentityState({ currentUserAccess })

  // Doors
  const { doors, addDoor, updateDoor, removeDoor } = useDoorsState({ currentUserAccess })

  // ✅ Lock/Unlock wiring extracted into core hook
  const { lockDoor, unlockDoor } = useLockUnlockWiring({
    doors,
    doorState: lock.doorState,
    setDoorState: lock.setDoorState,
  })

  // Controllers
  const controllersApi = useControllersWiring({ canOperate: profile.canOperateFullRestrictedActions })

  // ✅ Activity log (persisted)
  const activity = useActivityLogState()

  // Full access computed
  const fullAccess = useFullAccessState({
    appUsers: users.appUsers,
    isFull: profile.isFull,
    hasPlan,
    fullIsActivated: profile.fullIsActivated,
    fullAccessProfileByAdmin: profile.fullAccessProfileByAdmin,
  })

  return (
    <AppContext.Provider
      value={{
        isSystemStatusExpanded,
        setIsSystemStatusExpanded,

        scenes,
        setScenes,
        canCreateScene,

        countdown: lock.countdown,
        doorState: lock.doorState,

        // NOTE: keep this for internal/timers; UI should use lockDoor/unlockDoor
        setDoorState: lock.setDoorState,

        // ✅ explicit actions
        lockDoor,
        unlockDoor,

        autoLockDelay: lock.autoLockDelay,
        setAutoLockDelay: lock.setAutoLockDelay,
        autoLockEnabled: lock.autoLockEnabled,
        setAutoLockEnabled: lock.setAutoLockEnabled,
        autoNightLockEnabled: lock.autoNightLockEnabled,
        setAutoNightLockEnabled: lock.setAutoNightLockEnabled,
        nightLockHour: lock.nightLockHour,
        setNightLockHour: lock.setNightLockHour,
        nightLockMinute: lock.nightLockMinute,
        setNightLockMinute: lock.setNightLockMinute,
        nightLockPeriod: lock.nightLockPeriod,
        setNightLockPeriod: lock.setNightLockPeriod,
        lastNightLockDate: lock.lastNightLockDate,
        setLastNightLockDate: lock.setLastNightLockDate,

        quickControlsLocked,
        setQuickControlsLocked,

        userName: profile.userName,
        setUserName: setUserNameHandler,
        userEmail: profile.userEmail,
        setUserEmail: profile.setUserEmail,
        setUserProfileForRole: profile.setUserProfileForRole,

        iButtonUsers: users.iButtonUsers,
        canCreateIButtonUser: users.canCreateIButtonUser,

        appUsers: users.appUsers,
        canCreateAppUser: users.canCreateAppUser,

        currentUserAccess,
        setCurrentUserAccess,

        updateIButtonUser: users.updateIButtonUser,
        updateAppUser: users.updateAppUser,
        addIButtonUser: users.addIButtonUser,
        removeIButtonUser: users.removeIButtonUser,
        addAppUser: users.addAppUser,
        removeAppUser: users.removeAppUser,
        updateAppUserAccess: users.updateAppUserAccess,

        controllers: controllersApi.controllers,
        addController: controllersApi.addController,
        updateController: controllersApi.updateController,
        removeController: controllersApi.removeController,
        updateControllerStatus: controllersApi.updateControllerStatus,
        getActiveController: controllersApi.getActiveController,
        restartController: controllersApi.restartController,

        sessionPassword,
        setSessionPassword,

        selectedDoorId,
        setSelectedDoorId,

        doors,
        addDoor,
        updateDoor,
        removeDoor,

        currentUserId: identity.currentUserId,
        nameOverrides: identity.nameOverrides,
        getEntityName: identity.getEntityName,
        setEntityName: identity.setEntityName,

        // ✅ activity log
        activityLog: activity.activityLog,
        logActivity: activity.logActivity,
        clearActivityLog: activity.clearActivityLog,

        trialDaysLeft: trialDaysLeftValue,
        hasPlan,

        fullAccessAccountCount: fullAccess.fullAccessAccountCount,
        canCreateFullAccessAccount: fullAccess.canCreateFullAccessAccount,
        isFullAccessUserActivated: fullAccess.isFullAccessUserActivated,
        canFullAccessAddUsers: fullAccess.canFullAccessAddUsers,
        getFullAccessUserProfile: fullAccess.getFullAccessUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
