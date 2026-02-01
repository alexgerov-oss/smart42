"use client"

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import { storage } from "@/lib/core/storage"
import { getUserOverride, setUserOverride } from "@/lib/core/naming"
import { canRenameEntity } from "@/lib/core/permissions"

import type { TrialState } from "@/lib/core/trial"
import type { PremiumState } from "@/lib/core/premium"
import { loadTrial, saveTrial, trialDaysLeft, adminHasActiveTrial } from "@/lib/core/trial"
import { loadPremium, savePremium, adminHasPremium } from "@/lib/core/premium"

import { getCurrentUserId } from "@/lib/core/identity"
import {
  addControllerCore,
  updateControllerCore,
  removeControllerCore,
  updateControllerStatusCore,
  getActiveControllerCore,
  markControllerRestartingCore,
} from "@/lib/core/controllers"
import { loadQuickControlsLocked, saveQuickControlsLocked } from "@/lib/core/ui-preferences"
import { loadDoorsFromStorage, saveDoorsToStorage, canAdminManageDoors, getDefaultDoors } from "@/lib/core/doors"

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

  // scenes (guarded)
  const [scenesState, setScenesState] = useState<Scene[]>([])
  const scenes = scenesState

  const [doorState, setDoorState] = useState<"lock" | "unlock">("lock")
  const [autoLockDelay, setAutoLockDelay] = useState(30)
  const [autoLockEnabled, setAutoLockEnabled] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  const [autoNightLockEnabled, setAutoNightLockEnabled] = useState(false)
  const [nightLockHour, setNightLockHour] = useState("10")
  const [nightLockMinute, setNightLockMinute] = useState("00")
  const [nightLockPeriod, setNightLockPeriod] = useState<"AM" | "PM">("PM")
  const [lastNightLockDate, setLastNightLockDate] = useState<string | null>(null)

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

  // Scenes: Open/Close няма право. Free -> max 1.
  const canCreateScene = () => {
    if (isOpenClose) return false
    return adminHasActiveSubscription ? true : scenes.length < 1
  }

  const setScenes = (next: Scene[]) => {
    if (isOpenClose) return
    if (!adminHasActiveSubscription && next.length > 1) {
      setScenesState(next.slice(0, 1))
      return
    }
    setScenesState(next)
  }

  const [fullAccessCreatedByAdmin, setFullAccessCreatedByAdmin] = useState(false)
  const fullIsActivated = fullAccessCreatedByAdmin
  const isBlockedFull = isFull && !fullIsActivated
  const canOperateFullRestrictedActions = !isBlockedFull

  const [quickControlsLocked, setQuickControlsLockedState] = useState<boolean>(() => loadQuickControlsLocked())
  const setQuickControlsLocked = (locked: boolean) => {
    setQuickControlsLockedState(locked)
    saveQuickControlsLocked(locked)
  }

  const [userNamesByRole, setUserNamesByRole] = useState<Record<AccessRole, string>>({
    admin: "John Doe",
    full: "Jane Smith",
    "open-close": "Guest User",
  })
  const userName = userNamesByRole[currentUserAccess]
  const [userEmail, setUserEmail] = useState("john.doe@example.com")

  const currentUserId = useMemo(() => getCurrentUserId(currentUserAccess), [currentUserAccess])

  const [iButtonUsers, setIButtonUsers] = useState<IButtonUser[]>([])
  const [appUsers, setAppUsers] = useState<AppUser[]>([])

  // ✅ now driven by core/users.ts
  const canCreateIButtonUser = () => canCreateIButtonUserCore(currentUserAccess, adminHasActiveSubscription, iButtonUsers.length)
  const canCreateAppUser = () => canCreateAppUserCore(currentUserAccess, adminHasActiveSubscription)

  const [fullAccessProfileByAdmin, setFullAccessProfileByAdmin] = useState<{ name: string; email: string } | null>(null)

  const creatorIdentity = useMemo(() => {
    if (isFull && fullAccessProfileByAdmin) {
      return { name: fullAccessProfileByAdmin.name, email: fullAccessProfileByAdmin.email }
    }
    return { name: userName, email: userEmail }
  }, [isFull, fullAccessProfileByAdmin, userName, userEmail])

  const [controllers, setControllers] = useState<Controller[]>([])
  const [sessionPassword, setSessionPassword] = useState<string>("")

  const defaultDoors = useMemo(() => getDefaultDoors(), [])
  const [doors, setDoors] = useState<Door[]>(() => loadDoorsFromStorage(defaultDoors))
  useEffect(() => {
    saveDoorsToStorage(doors)
  }, [doors])

  const [nameOverrides, setNameOverrides] = useState<NameOverrides>(() => storage.getJSON("nameOverrides", {}))
  useEffect(() => {
    storage.setJSON("nameOverrides", nameOverrides)
  }, [nameOverrides])

  const getEntityName = (entityType: EntityType, entityId: string, defaultName: string): string => {
    return getUserOverride(nameOverrides, currentUserId, entityType, entityId) ?? defaultName
  }

  const setEntityName = (entityType: EntityType, entityId: string, customName: string) => {
    if (!canRenameEntity(currentUserAccess, entityType)) return

    setNameOverrides((prev) => {
      const updated = setUserOverride(prev, currentUserId, entityType, entityId, customName)
      storage.setJSON("nameOverrides", updated)
      return updated
    })
  }

  const fullAccessAccountCount = useMemo(() => fullAccessAccountCountCore(appUsers), [appUsers])
  const canCreateFullAccessAccount = () => canCreateFullAccessAccountCore(appUsers)
  const isFullAccessUserActivated = (): boolean => fullIsActivated
  const canFullAccessAddUsers = (): boolean => (!isFull ? true : adminHasActiveSubscription)
  const getFullAccessUserProfile = () => fullAccessProfileByAdmin

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

  // Controllers
  const addController = (serialNumber: string, ip?: string): boolean => {
    if (!canOperateFullRestrictedActions) return false
    const result = addControllerCore(controllers, serialNumber, ip)
    if (!result.ok) return false
    setControllers(result.next)
    return true
  }

  const updateController = (id: string, serialNumber: string, ip?: string): boolean => {
    if (!canOperateFullRestrictedActions) return false
    const result = updateControllerCore(controllers, id, serialNumber, ip)
    if (!result.ok) return false
    setControllers(result.next)
    return true
  }

  const removeController = (id: string) => {
    if (!canOperateFullRestrictedActions) return
    setControllers((prev) => removeControllerCore(prev, id))
  }

  const updateControllerStatus = (id: string, status: "online" | "offline") => {
    if (!canOperateFullRestrictedActions) return
    setControllers((prev) => updateControllerStatusCore(prev, id, status))
  }

  const getActiveController = (): Controller | null => getActiveControllerCore(controllers)

  const restartController = (id: string) => {
    if (!canOperateFullRestrictedActions) return
    setControllers((prev) => markControllerRestartingCore(prev, id, true))
    setTimeout(() => {
      setControllers((prev) => updateControllerStatusCore(markControllerRestartingCore(prev, id, false), id, "online"))
    }, 5000)
  }

  const addDoor = (systemName: string): string | null => {
    if (!canAdminManageDoors(currentUserAccess)) return null
    const newId = `door-${Date.now()}`
    setDoors((prev) => [
      ...prev,
      { id: newId, systemName: systemName.trim(), createdBy: currentUserAccess, createdAt: new Date().toISOString() },
    ])
    return newId
  }

  const updateDoor = (id: string, systemName: string): boolean => {
    if (!canAdminManageDoors(currentUserAccess)) return false
    setDoors((prev) => prev.map((door) => (door.id === id ? { ...door, systemName: systemName.trim() } : door)))
    return true
  }

  const removeDoor = (id: string) => {
    if (!canAdminManageDoors(currentUserAccess)) return
    setDoors((prev) => prev.filter((door) => door.id !== id))
  }

  const handleSetUserName = (name: string) => {
    if (!canOperateFullRestrictedActions) return
    if (isOpenClose) return

    setUserNamesByRole((prev) => ({ ...prev, [currentUserAccess]: name }))

    if (isAdmin) {
      setAppUsers((prev) => prev.map((user) => (user.id === "1" ? { ...user, name } : user)))
      return
    }

    if (isFull) {
      setAppUsers((prev) =>
        prev.map((user) => (user.id === "2" ? { ...user, name, ownerDisplayName: name, access: currentUserAccess } : user)),
      )
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const currentName = userNamesByRole[currentUserAccess]

    if (isAdmin) {
      setAppUsers((prev) =>
        prev.map((user) => (user.id === "1" ? { ...user, name: currentName, access: currentUserAccess } : user)),
      )
    } else if (isFull) {
      setAppUsers((prev) =>
        prev.map((user) =>
          user.id === "2" && user.access === "full"
            ? { ...user, name: currentName, ownerDisplayName: currentName }
            : user,
        ),
      )
    }
  }, [currentUserAccess, userNamesByRole, isAdmin, isFull])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!autoLockEnabled) {
      setCountdown(null)
      return
    }

    if (doorState === "unlock" && autoLockEnabled) {
      setCountdown(autoLockDelay)

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 0) return null
          const newCount = prev - 1
          if (newCount <= 0) {
            setDoorState("lock")
            return null
          }
          return newCount
        })
      }, 1000)

      return () => clearInterval(interval)
    }

    setCountdown(null)
  }, [doorState, autoLockDelay, autoLockEnabled])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!autoNightLockEnabled) return

    const checkNightLock = () => {
      const now = new Date()
      const currentDate = now.toDateString()

      let targetHour = Number.parseInt(nightLockHour)
      if (nightLockPeriod === "PM" && targetHour !== 12) targetHour += 12
      else if (nightLockPeriod === "AM" && targetHour === 12) targetHour = 0

      const currentHour = now.getHours()
      const currentMinute = now.getMinutes()
      const targetMinute = Number.parseInt(nightLockMinute)

      if (currentHour === targetHour && currentMinute === targetMinute) {
        setDoorState("lock")
        setLastNightLockDate(currentDate)
      }
    }

    const interval = setInterval(checkNightLock, 30000)
    checkNightLock()

    return () => clearInterval(interval)
  }, [autoNightLockEnabled, nightLockHour, nightLockMinute, nightLockPeriod, lastNightLockDate])

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
        setUserName: handleSetUserName,
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
