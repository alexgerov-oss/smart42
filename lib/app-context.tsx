"use client"

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import { useNameOverrides } from "@/lib/core/name-overrides"
import { useDoorsState } from "@/lib/core/doors-state"
import { useControllersState } from "@/lib/core/controllers-state"
import { canCreateScene as canCreateSceneCore, normalizeNextScenes } from "@/lib/core/scenes-guard"

import type { TrialState } from "@/lib/core/trial"
import type { PremiumState } from "@/lib/core/premium"
import { loadTrial, saveTrial, trialDaysLeft, adminHasActiveTrial } from "@/lib/core/trial"
import { loadPremium, savePremium, adminHasPremium } from "@/lib/core/premium"

import { getCurrentUserId } from "@/lib/core/identity"
import { loadQuickControlsLocked, saveQuickControlsLocked } from "@/lib/core/ui-preferences"

import {
  canCreateIButtonUser as canCreateIButtonUserCore,
  canCreateAppUser as canCreateAppUserCore,
  fullAccessAccountCount as fullAccessAccountCountCore,
  canCreateFullAccessAccount as canCreateFullAccessAccountCore,
  updateIButtonUserName as updateIButtonUserNameCore,
  removeIButtonUser as removeIButtonUserCore,
  makeIButtonUser as makeIButtonUserCore,
  appendIButtonUser as appendIButtonUserCore,
  updateAppUserName as updateAppUserNameCore,
  makeAppUser as makeAppUserCore,
  appendAppUser as appendAppUserCore,
  removeAppUser as removeAppUserCore,
  updateAppUserAccess as updateAppUserAccessCore,
} from "@/lib/core/users"

import { useAutoLockCountdown, useAutoNightLock } from "@/lib/core/lock-timers"
import { createSetUserNameHandler, useProfileSyncToAppUsers } from "@/lib/core/profile-sync"

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
  const [isSystemStatusExpanded, setIsSystemStatusExpanded] = useState(true)

  // Scenes
  const [scenesState, setScenesState] = useState<Scene[]>([])
  const scenes = scenesState

  // Lock state + timers
  const [doorState, setDoorState] = useState<"lock" | "unlock">("lock")
  const [autoLockDelay, setAutoLockDelay] = useState(30)
  const [autoLockEnabled, setAutoLockEnabled] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const [autoNightLockEnabled, setAutoNightLockEnabled] = useState(false)
  const [nightLockHour, setNightLockHour] = useState("10")
  const [nightLockMinute, setNightLockMinute] = useState("00")
  const [nightLockPeriod, setNightLockPeriod] = useState<"AM" | "PM">("PM")
  const [lastNightLockDate, setLastNightLockDate] = useState<string | null>(null)

  // Access
  const [currentUserAccess, setCurrentUserAccess] = useState<AccessRole>("admin")
  const isAdmin = currentUserAccess === "admin"
  const isFull = currentUserAccess === "full"
  const isOpenClose = currentUserAccess === "open-close"

  // Trial / Premium
  const [trial, _setTrial] = useState<TrialState>(() => loadTrial())
  useEffect(() => {
    saveTrial(trial)
  }, [trial])

  const [premium, _setPremium] = useState<PremiumState>(() => loadPremium())
  useEffect(() => {
    savePremium(premium)
  }, [premium])

  const trialDaysLeftValue = useMemo(() => trialDaysLeft(trial), [trial])
  const adminHasActiveSubscription = useMemo(() => {
    return adminHasActiveTrial(currentUserAccess, trial) || adminHasPremium(currentUserAccess, premium)
  }, [currentUserAccess, trial, premium])

  // Scenes: guard extracted
  const canCreateScene = () =>
    canCreateSceneCore({
      currentUserAccess,
      adminHasActiveSubscription,
      scenesCount: scenes.length,
    })

  const setScenes = (next: Scene[]) => {
    const normalized = normalizeNextScenes({ currentUserAccess, adminHasActiveSubscription, next })
    setScenesState(normalized)
  }

  // Full Access activation gating
  const [fullAccessCreatedByAdmin, setFullAccessCreatedByAdmin] = useState(false)
  const fullIsActivated = fullAccessCreatedByAdmin
  const isBlockedFull = isFull && !fullIsActivated
  const canOperateFullRestrictedActions = !isBlockedFull

  // UI prefs
  const [quickControlsLocked, setQuickControlsLockedState] = useState<boolean>(() => loadQuickControlsLocked())
  const setQuickControlsLocked = (locked: boolean) => {
    setQuickControlsLockedState(locked)
    saveQuickControlsLocked(locked)
  }

  // Profile
  const [userNamesByRole, setUserNamesByRole] = useState<Record<AccessRole, string>>({
    admin: "John Doe",
    full: "Jane Smith",
    "open-close": "Guest User",
  })
  const userName = userNamesByRole[currentUserAccess]
  const [userEmail, setUserEmail] = useState("john.doe@example.com")

  const currentUserId = useMemo(() => getCurrentUserId(currentUserAccess), [currentUserAccess])

  // Name overrides (rename persistence)
  const { nameOverrides, getEntityName, setEntityName } = useNameOverrides({
    currentUserId,
    currentUserAccess,
  })

  // Users
  const [iButtonUsers, setIButtonUsers] = useState<IButtonUser[]>([])
  const [appUsers, setAppUsers] = useState<AppUser[]>([])

  const canCreateIButtonUser = () =>
    canCreateIButtonUserCore(currentUserAccess, adminHasActiveSubscription, iButtonUsers.length)
  const canCreateAppUser = () => canCreateAppUserCore(currentUserAccess, adminHasActiveSubscription)

  const [fullAccessProfileByAdmin, setFullAccessProfileByAdmin] = useState<{ name: string; email: string } | null>(null)

  const creatorIdentity = useMemo(() => {
    if (isFull && fullAccessProfileByAdmin) {
      return { name: fullAccessProfileByAdmin.name, email: fullAccessProfileByAdmin.email }
    }
    return { name: userName, email: userEmail }
  }, [isFull, fullAccessProfileByAdmin, userName, userEmail])

  // Profile sync (extracted)
  const setUserNameHandler = useMemo(
    () =>
      createSetUserNameHandler({
        canOperate: canOperateFullRestrictedActions,
        isOpenClose,
        currentUserAccess,
        isAdmin,
        isFull,
        setUserNamesByRole,
        setAppUsers,
      }),
    [
      canOperateFullRestrictedActions,
      isOpenClose,
      currentUserAccess,
      isAdmin,
      isFull,
      setUserNamesByRole,
      setAppUsers,
    ],
  )

  useProfileSyncToAppUsers({
    currentUserAccess,
    userNamesByRole,
    isAdmin,
    isFull,
    setAppUsers,
  })

  // Session
  const [sessionPassword, setSessionPassword] = useState<string>("")

  // Doors (extracted)
  const { doors, addDoor, updateDoor, removeDoor } = useDoorsState({ currentUserAccess })

  // Controllers (extracted)
  const {
    controllers,
    addController,
    updateController,
    removeController,
    updateControllerStatus,
    getActiveController,
    restartController,
  } = useControllersState({ canOperate: canOperateFullRestrictedActions })

  // Full access computed
  const fullAccessAccountCount = useMemo(() => fullAccessAccountCountCore(appUsers), [appUsers])
  const canCreateFullAccessAccount = () => canCreateFullAccessAccountCore(appUsers)
  const isFullAccessUserActivated = (): boolean => fullIsActivated
  const canFullAccessAddUsers = (): boolean => (!isFull ? true : adminHasActiveSubscription)
  const getFullAccessUserProfile = () => fullAccessProfileByAdmin

  // Mutations: iButton/app users
  const updateIButtonUser = (id: string, name: string) => {
    if (!canOperateFullRestrictedActions) return
    if (isOpenClose) return
    setIButtonUsers((prev) => updateIButtonUserNameCore(prev, id, name))
  }

  const updateAppUser = (id: string, name: string) => {
    if (!canOperateFullRestrictedActions) return
    if (isOpenClose) return

    setAppUsers((prev) => {
      const result = updateAppUserNameCore(prev, { id, name, currentUserAccess })
      if (result.fullAccessProfileByAdmin) setFullAccessProfileByAdmin(result.fullAccessProfileByAdmin)
      return result.next
    })
  }

  const addIButtonUser = () => {
    if (!canOperateFullRestrictedActions) return `ibutton-blocked-${Date.now()}`
    if (!canCreateIButtonUser()) return `ibutton-blocked-${Date.now()}`

    const now = Date.now()
    const newId = `ibutton-${now}`
    const newUser = makeIButtonUserCore({
      id: newId,
      now,
      currentUserAccess,
      creatorName: creatorIdentity.name,
    })

    setIButtonUsers((prev) => appendIButtonUserCore(prev, newUser))
    return newId
  }

  const removeIButtonUser = (id: string) => {
    if (!canOperateFullRestrictedActions) return
    if (isOpenClose) return
    setIButtonUsers((prev) => removeIButtonUserCore(prev, id))
  }

  const addAppUser = (name: string, email: string, access: AccessRole) => {
    if (!canOperateFullRestrictedActions) return
    if (!canCreateAppUser()) return

    if (isAdmin && access === "full") {
      setFullAccessCreatedByAdmin(true)
      setFullAccessProfileByAdmin({ name, email })
    }

    const now = Date.now()
    const newId = `appuser-${now}`
    const newUser = makeAppUserCore({
      id: newId,
      name,
      email,
      access,
      currentUserAccess,
      creatorName: creatorIdentity.name,
    })

    setAppUsers((prev) => appendAppUserCore(prev, newUser))
  }

  const removeAppUser = (id: string) => {
    if (!canOperateFullRestrictedActions) return
    if (isOpenClose) return
    setAppUsers((prev) => removeAppUserCore(prev, id))
  }

  const updateAppUserAccess = (id: string, access: AccessRole) => {
    if (!canOperateFullRestrictedActions) return
    if (isOpenClose) return
    setAppUsers((prev) => updateAppUserAccessCore(prev, id, access))
  }

  // Timers (extracted)
  useAutoLockCountdown({ autoLockEnabled, doorState, autoLockDelay, setCountdown, setDoorState })

  useAutoNightLock({
    autoNightLockEnabled,
    nightLockHour,
    nightLockMinute,
    nightLockPeriod,
    lastNightLockDate,
    setDoorState,
    setLastNightLockDate,
  })

  return (
    <AppContext.Provider
      value={{
        isSystemStatusExpanded,
        setIsSystemStatusExpanded,

        scenes,
        setScenes,
        canCreateScene,

        countdown,
        doorState,
        setDoorState,
        autoLockDelay,
        setAutoLockDelay,
        autoLockEnabled,
        setAutoLockEnabled,
        autoNightLockEnabled,
        setAutoNightLockEnabled,
        nightLockHour,
        setNightLockHour,
        nightLockMinute,
        setNightLockMinute,
        nightLockPeriod,
        setNightLockPeriod,
        lastNightLockDate,
        setLastNightLockDate,

        quickControlsLocked,
        setQuickControlsLocked,

        userName,
        setUserName: setUserNameHandler,
        userEmail,
        setUserEmail,

        iButtonUsers,
        canCreateIButtonUser,

        appUsers,
        canCreateAppUser,

        currentUserAccess,
        setCurrentUserAccess,

        updateIButtonUser,
        updateAppUser,
        addIButtonUser,
        removeIButtonUser,
        addAppUser,
        removeAppUser,
        updateAppUserAccess,

        controllers,
        addController,
        updateController,
        removeController,
        updateControllerStatus,
        getActiveController,
        restartController,

        sessionPassword,
        setSessionPassword,

        doors,
        addDoor,
        updateDoor,
        removeDoor,

        currentUserId,
        nameOverrides,
        getEntityName,
        setEntityName,

        trialDaysLeft: trialDaysLeftValue,
        adminHasActiveSubscription,

        fullAccessAccountCount,
        canCreateFullAccessAccount,
        isFullAccessUserActivated,
        canFullAccessAddUsers,
        getFullAccessUserProfile,
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
