"use client"

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react"
import { storage } from "@/lib/core/storage"
import { getUserOverride, setUserOverride } from "@/lib/core/naming"
import { canRenameEntity } from "@/lib/core/permissions"
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
  appUsers: AppUser[]

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

  fullAccessAccountCount: number
  canCreateFullAccessAccount: () => boolean
  isFullAccessUserActivated: () => boolean
  canFullAccessAddUsers: (adminHasActiveSubscription: boolean) => boolean
  getFullAccessUserProfile: () => { name: string; email: string } | null
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isSystemStatusExpanded, setIsSystemStatusExpanded] = useState(true)
  const [scenes, setScenes] = useState<Scene[]>([])

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

  const [fullAccessCreatedByAdmin, setFullAccessCreatedByAdmin] = useState(false)
  const fullIsActivated = fullAccessCreatedByAdmin
  const isBlockedFull = isFull && !fullIsActivated
  const canOperateFullRestrictedActions = !isBlockedFull

  const [quickControlsLocked, setQuickControlsLockedState] = useState<boolean>(() =>
    storage.getBool("quickControlsLocked", false),
  )
  const setQuickControlsLocked = (locked: boolean) => {
    setQuickControlsLockedState(locked)
    storage.setBool("quickControlsLocked", locked)
  }

  const [userNamesByRole, setUserNamesByRole] = useState<Record<AccessRole, string>>({
    admin: "John Doe",
    full: "Jane Smith",
    "open-close": "Guest User",
  })
  const userName = userNamesByRole[currentUserAccess]
  const [userEmail, setUserEmail] = useState("john.doe@example.com")

  // ✅ FIX 1: currentUserId вече е изчисляемо (без setState в useEffect)
  const currentUserId = useMemo(() => {
    if (isAdmin) return "admin-1"
    if (isFull) return "full-1"
    return "open-close-1"
  }, [isAdmin, isFull])

  const [iButtonUsers, setIButtonUsers] = useState<IButtonUser[]>([])
  const [appUsers, setAppUsers] = useState<AppUser[]>([])

  const [fullAccessProfileByAdmin, setFullAccessProfileByAdmin] = useState<{ name: string; email: string } | null>(
    null,
  )

  const creatorIdentity = useMemo(() => {
    if (isFull && fullAccessProfileByAdmin) {
      return { name: fullAccessProfileByAdmin.name, email: fullAccessProfileByAdmin.email }
    }
    return { name: userName, email: userEmail }
  }, [isFull, fullAccessProfileByAdmin, userName, userEmail])

  const [controllers, setControllers] = useState<Controller[]>([])

  const validateSerialNumber = (serial: string): boolean => {
    const trimmed = serial.trim()
    if (trimmed.length < 8) return false
    if (!/^[A-Za-z0-9-]+$/.test(trimmed)) return false
    return true
  }

  const [sessionPassword, setSessionPassword] = useState<string>("")

  const defaultDoors: Door[] = [
    { id: "main-door", systemName: "Main door", createdBy: "admin", createdAt: new Date().toISOString() },
    { id: "second-door", systemName: "Second door", createdBy: "admin", createdAt: new Date().toISOString() },
  ]
  const [doors, setDoors] = useState<Door[]>(() => storage.getJSON("doors", defaultDoors))
  useEffect(() => {
    storage.setJSON("doors", doors)
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
      storage.setJSON("nameOverrides", updated) // keep "persist immediately"
      return updated
    })
  }

  // ✅ FIX 2: fullAccessAccountCount вече е изчисляемо (без setState в useEffect)
  const fullAccessAccountCount = useMemo(() => {
    return appUsers.filter((user) => user.access === "full").length
  }, [appUsers])

  const canCreateFullAccessAccount = (): boolean => fullAccessAccountCount < 1
  const isFullAccessUserActivated = (): boolean => fullIsActivated
  const canFullAccessAddUsers = (adminHasActiveSubscription: boolean): boolean =>
    !isFull ? true : adminHasActiveSubscription
  const getFullAccessUserProfile = () => fullAccessProfileByAdmin

  const updateIButtonUser = (id: string, name: string) => {
    if (!canOperateFullRestrictedActions) return
    setIButtonUsers((prev) => prev.map((user) => (user.id === id ? { ...user, name } : user)))
  }

  const updateAppUser = (id: string, name: string) => {
    if (!canOperateFullRestrictedActions) return

    setAppUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) return user

        if (isAdmin && id === "2") {
          const fullAccessUser = prev.find((u) => u.id === "2")
          if (fullAccessUser) setFullAccessProfileByAdmin({ name, email: fullAccessUser.email || "" })
          return { ...user, name, adminOverrideName: name }
        }

        return { ...user, name }
      }),
    )
  }

  const addIButtonUser = () => {
    if (!canOperateFullRestrictedActions) return `ibutton-blocked-${Date.now()}`
    const newId = `ibutton-${Date.now()}`
    setIButtonUsers((prev) => [
      ...prev,
      {
        id: newId,
        name: "New iButton",
        chipId: `CHIP${Date.now()}`,
        createdBy: currentUserAccess,
        createdByName: creatorIdentity.name,
        createdByRole: currentUserAccess,
        createdAt: new Date().toISOString(),
      },
    ])
    return newId
  }

  const removeIButtonUser = (id: string) => {
    if (id === "1") return
    if (!canOperateFullRestrictedActions) return
    setIButtonUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const addAppUser = (name: string, email: string, access: AccessRole) => {
    if (isAdmin && access === "full") {
      setFullAccessCreatedByAdmin(true)
      setFullAccessProfileByAdmin({ name, email })
    }
    if (!canOperateFullRestrictedActions) return

    const newId = `appuser-${Date.now()}`
    setAppUsers((prev) => [
      ...prev,
      {
        id: newId,
        name,
        email,
        status: "invited",
        access,
        createdBy: currentUserAccess,
        createdByName: creatorIdentity.name,
        createdByRole: currentUserAccess,
        createdAt: new Date().toISOString(),
      },
    ])
  }

  const removeAppUser = (id: string) => {
    if (id === "1") return
    if (!canOperateFullRestrictedActions) return
    setAppUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const updateAppUserAccess = (id: string, access: AccessRole) => {
    if (!canOperateFullRestrictedActions) return
    setAppUsers((prev) => prev.map((user) => (user.id === id ? { ...user, access } : user)))
  }

  const addDoor = (systemName: string): string | null => {
    if (!isAdmin) return null
    const newId = `door-${Date.now()}`
    setDoors((prev) => [
      ...prev,
      { id: newId, systemName: systemName.trim(), createdBy: currentUserAccess, createdAt: new Date().toISOString() },
    ])
    return newId
  }

  const updateDoor = (id: string, systemName: string): boolean => {
    if (!isAdmin) return false
    setDoors((prev) => prev.map((door) => (door.id === id ? { ...door, systemName: systemName.trim() } : door)))
    return true
  }

  const removeDoor = (id: string) => {
    if (!isAdmin) return
    setDoors((prev) => prev.filter((door) => door.id !== id))
  }

  const addController = (serialNumber: string, ip?: string): boolean => {
    if (!canOperateFullRestrictedActions) return false
    if (!validateSerialNumber(serialNumber)) return false
    if (controllers.some((c) => c.serialNumber === serialNumber.trim())) return false

    setControllers((prev) => [
      ...prev,
      {
        id: `controller-${Date.now()}`,
        serialNumber: serialNumber.trim(),
        ip: ip?.trim(),
        status: "online",
        addedAt: new Date().toISOString(),
      },
    ])
    return true
  }

  const updateController = (id: string, serialNumber: string, ip?: string): boolean => {
    if (!canOperateFullRestrictedActions) return false
    if (!validateSerialNumber(serialNumber)) return false
    if (controllers.some((c) => c.id !== id && c.serialNumber === serialNumber.trim())) return false

    setControllers((prev) =>
      prev.map((controller) =>
        controller.id === id ? { ...controller, serialNumber: serialNumber.trim(), ip: ip?.trim() } : controller,
      ),
    )
    return true
  }

  const removeController = (id: string) => {
    if (!canOperateFullRestrictedActions) return
    setControllers((prev) => prev.filter((controller) => controller.id !== id))
  }

  const updateControllerStatus = (id: string, status: "online" | "offline") => {
    if (!canOperateFullRestrictedActions) return
    setControllers((prev) => prev.map((controller) => (controller.id === id ? { ...controller, status } : controller)))
  }

  const getActiveController = (): Controller | null => {
    return controllers.length > 0 ? controllers[0] : null
  }

  const restartController = (id: string) => {
    if (!canOperateFullRestrictedActions) return

    setControllers((prev) =>
      prev.map((controller) => (controller.id === id ? { ...controller, isRestarting: true } : controller)),
    )

    setTimeout(() => {
      setControllers((prev) =>
        prev.map((controller) =>
          controller.id === id ? { ...controller, isRestarting: false, status: "online" } : controller,
        ),
      )
    }, 5000)
  }

  const handleSetUserName = (name: string) => {
    if (!canOperateFullRestrictedActions) return

    setUserNamesByRole((prev) => ({ ...prev, [currentUserAccess]: name }))

    if (isAdmin) {
      setAppUsers((prev) => prev.map((user) => (user.id === "1" ? { ...user, name } : user)))
      return
    }

    if (isFull) {
      setAppUsers((prev) =>
        prev.map((user) =>
          user.id === "2" ? { ...user, name, ownerDisplayName: name, access: currentUserAccess } : user,
        ),
      )
    }
  }

  // Този ефект реално синхронизира "профилното име" в appUsers.
  // Без него логиката/данните може да се разминат. Затова оставяме поведението и само изключваме правилото за lint.
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

  // Таймер логика (тук setState в effect е нормално/нужно за брояч). Оставяме поведението 1:1.
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
        appUsers,
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
