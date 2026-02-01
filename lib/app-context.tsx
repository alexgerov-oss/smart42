"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useDoorsState } from "@/lib/core/doors-state"

import { useAccessState } from "@/lib/core/access-state"
import { useSystemStatusState } from "@/lib/core/system-status-state"
import { useIdentityState } from "@/lib/core/identity-state"

import { useSubscriptionState } from "@/lib/core/subscription-state"
import { useQuickControlsState } from "@/lib/core/quick-controls-state"
import { useSessionState } from "@/lib/core/session-state"

import { useScenesState } from "@/lib/core/scenes-state"
import { useLockState } from "@/lib/core/lock-state"
import { useProfileState } from "@/lib/core/profile-state"

import { useUsersState } from "@/lib/core/users-state"
import { useProfileSyncState } from "@/lib/core/profile-sync-state"
import { useFullAccessState } from "@/lib/core/full-access-state"
import { useControllersWiring } from "@/lib/core/controllers-wiring"

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
  addAppUser: (name: string, email: string, access: AccessRole) => void
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

  doors: Door[]
  addDoor: (systemName: string) => string | null
  updateDoor: (id: string, systemName: string) => boolean
  removeDoor: (id: string) => void

  currentUserId: string
  nameOverrides: NameOverrides
  getEntityName: (entityType: EntityType, entityId: string, defaultName: string) => string
  setEntityName: (entityType: EntityType, entityId: string, customName: string) => void

  trialDaysLeft: number
  adminHasActiveSubscription: boolean

  fullAccessAccountCount: number
  canCreateFullAccessAccount: () => boolean
  isFullAccessUserActivated: () => boolean
  canFullAccessAddUsers: () => boolean
  getFullAccessUserProfile: () => { name: string; email: string } | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // System UI
  const { isSystemStatusExpanded, setIsSystemStatusExpanded } = useSystemStatusState(true)

  // Access
  const { currentUserAccess, setCurrentUserAccess } = useAccessState("admin")

  // Subscription
  const { trialDaysLeft: trialDaysLeftValue, adminHasActiveSubscription } = useSubscriptionState({
    currentUserAccess,
  })

  // Profile base state (no sync inside)
  const profile = useProfileState({ currentUserAccess })

  // Users
  const users = useUsersState({
    currentUserAccess,
    adminHasActiveSubscription,
    canOperate: profile.canOperateFullRestrictedActions,
    isOpenClose: profile.isOpenClose,
    creatorIdentity: profile.creatorIdentity,
    onFullAccessCreatedByAdmin: (p) => {
      profile.setFullAccessCreatedByAdmin(true)
      profile.setFullAccessProfileByAdmin(p)
    },
    onFullAccessProfileByAdminChange: (p) => {
      profile.setFullAccessProfileByAdmin(p)
    },
  })

  // Profile sync (extracted)
  const { setUserName: setUserNameHandler } = useProfileSyncState({
    currentUserAccess,
    isAdmin: profile.isAdmin,
    isFull: profile.isFull,
    isOpenClose: profile.isOpenClose,
    canOperate: profile.canOperateFullRestrictedActions,
    userNamesByRole: profile.userNamesByRole,
    setUserNamesByRole: profile.setUserNamesByRole,
    setAppUsers: users.setAppUsers,
  })

  // Scenes
  const { scenes, setScenes, canCreateScene } = useScenesState({
    currentUserAccess,
    adminHasActiveSubscription,
  })

  // Lock/timers
  const lock = useLockState()

  // UI prefs
  const { quickControlsLocked, setQuickControlsLocked } = useQuickControlsState()

  // Session
  const { sessionPassword, setSessionPassword } = useSessionState()

  // Identity + name overrides
  const identity = useIdentityState({ currentUserAccess })

  // Doors
  const { doors, addDoor, updateDoor, removeDoor } = useDoorsState({ currentUserAccess })

  // Controllers
  const controllersApi = useControllersWiring({ canOperate: profile.canOperateFullRestrictedActions })

  // Full access computed
  const fullAccess = useFullAccessState({
    appUsers: users.appUsers,
    isFull: profile.isFull,
    adminHasActiveSubscription,
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
        setDoorState: lock.setDoorState,
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

        doors,
        addDoor,
        updateDoor,
        removeDoor,

        currentUserId: identity.currentUserId,
        nameOverrides: identity.nameOverrides,
        getEntityName: identity.getEntityName,
        setEntityName: identity.setEntityName,

        trialDaysLeft: trialDaysLeftValue,
        adminHasActiveSubscription,

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
