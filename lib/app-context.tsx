"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WhenCondition {
  type: "wifi" | "battery" | "cpu-temp" | "cpu-load" | "power-drops" | "latency" | "door-lock" | "door-open"
  operator?: "<" | ">" | "="
  value?: number
  doorEvent?: "lock" | "unlock" | "open" | "closed"
  timeWindow?: "between" | "always"
  timeStart?: string
  timeEnd?: string
}

interface ThenAction {
  type: "push" | "email" | "restart"
  customText?: string
}

interface Scene {
  id: string
  name: string
  active: boolean
  whenConditions: WhenCondition[]
  thenAction: ThenAction
  createdBy: "admin" | "full" | "open-close"
}

interface Controller {
  id: string
  serialNumber: string
  ip?: string
  status: "online" | "offline"
  addedAt: string
  isRestarting?: boolean
}

interface Door {
  id: string
  systemName: string // Immutable system name
  createdBy: "admin" | "full" | "open-close"
  createdAt: string
}

interface AppContextType {
  // System Status collapse state
  isSystemStatusExpanded: boolean
  setIsSystemStatusExpanded: (expanded: boolean) => void

  // Scenes state
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
  iButtonUsers: Array<{
    id: string
    name: string
    chipId: string
    createdBy: "admin" | "full" | "open-close"
    createdByName: string
    createdByRole: "admin" | "full" | "open-close"
    createdAt: string
  }>
  appUsers: Array<{
    id: string
    name: string
    email?: string
    status?: "active" | "invited"
    access: "admin" | "full" | "open-close"
    createdBy: "admin" | "full" | "open-close"
    ownerDisplayName?: string
    adminOverrideName?: string
    createdByName: string
    createdByRole: "admin" | "full" | "open-close"
    createdAt: string
  }>
  currentUserAccess: "admin" | "full" | "open-close"
  setCurrentUserAccess: (access: "admin" | "full" | "open-close") => void
  updateIButtonUser: (id: string, name: string) => void
  updateAppUser: (id: string, name: string) => void
  addIButtonUser: () => string
  removeIButtonUser: (id: string) => void
  addAppUser: (name: string, email: string, access: "admin" | "full" | "open-close") => void
  removeAppUser: (id: string) => void
  updateAppUserAccess: (id: string, access: "admin" | "full" | "open-close") => void

  // Controller management
  controllers: Controller[]
  addController: (serialNumber: string, ip?: string) => boolean
  updateController: (id: string, serialNumber: string, ip?: string) => boolean
  removeController: (id: string) => void
  updateControllerStatus: (id: string, status: "online" | "offline") => void
  getActiveController: () => Controller | null
  restartController: (id: string) => void

  sessionPassword: string
  setSessionPassword: (password: string) => void

  // Door management
  doors: Door[]
  addDoor: (systemName: string) => string | null
  updateDoor: (id: string, systemName: string) => boolean
  removeDoor: (id: string) => void

  // Per-user name isolation
  currentUserId: string
  nameOverrides: Record<string, Record<string, Record<string, string>>>
  getEntityName: (
    entityType: "doors" | "ibuttons" | "appusers" | "scenes",
    entityId: string,
    defaultName: string,
  ) => string
  setEntityName: (
    entityType: "doors" | "ibuttons" | "appusers" | "scenes",
    entityId: string,
    customName: string,
  ) => void

  // Full Access account limit tracking
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

  const [quickControlsLocked, setQuickControlsLockedState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("quickControlsLocked")
      return saved === "true"
    }
    return false
  })

  const setQuickControlsLocked = (locked: boolean) => {
    setQuickControlsLockedState(locked)
    if (typeof window !== "undefined") {
      localStorage.setItem("quickControlsLocked", locked.toString())
    }
  }

  const [userNamesByRole, setUserNamesByRole] = useState<Record<"admin" | "full" | "open-close", string>>({
    admin: "John Doe",
    full: "Jane Smith",
    "open-close": "Guest User",
  })

  const [currentUserAccess, setCurrentUserAccess] = useState<"admin" | "full" | "open-close">("admin")
  const userName = userNamesByRole[currentUserAccess]

  const [userEmail, setUserEmail] = useState("john.doe@example.com")
  const [iButtonUsers, setIButtonUsers] = useState<
    Array<{
      id: string
      name: string
      chipId: string
      createdBy: "admin" | "full" | "open-close"
      createdByName: string
      createdByRole: "admin" | "full" | "open-close"
      createdAt: string
    }>
  >([])

  const [appUsers, setAppUsers] = useState<
    Array<{
      id: string
      name: string
      email?: string
      status?: "active" | "invited"
      access: "admin" | "full" | "open-close"
      createdBy: "admin" | "full" | "open-close"
      ownerDisplayName?: string
      adminOverrideName?: string
      createdByName: string
      createdByRole: "admin" | "full" | "open-close"
      createdAt: string
    }>
  >([])

  const [controllers, setControllers] = useState<Controller[]>([])

  const [sessionPassword, setSessionPassword] = useState<string>("")

  // Door management - doors have immutable systemName
  const [doors, setDoors] = useState<Door[]>(() => {
    // Initialize with default doors if none exist
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("doors")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // Fallback to defaults
        }
      }
    }
    return [
      {
        id: "main-door",
        systemName: "Main door",
        createdBy: "admin",
        createdAt: new Date().toISOString(),
      },
      {
        id: "second-door",
        systemName: "Second door",
        createdBy: "admin",
        createdAt: new Date().toISOString(),
      },
    ]
  })

  // Persist doors to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("doors", JSON.stringify(doors))
    }
  }, [doors])

  // Unique user ID per role
  const [currentUserId, setCurrentUserId] = useState<string>("admin-1")

  // Name overrides storage: { userId: { entityType: { entityId: customName } } }
  // Load from localStorage on init
  const [nameOverrides, setNameOverrides] = useState<Record<string, Record<string, Record<string, string>>>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("nameOverrides")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          // Invalid data, start fresh
        }
      }
    }
    return {}
  })

  // Persist name overrides to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nameOverrides", JSON.stringify(nameOverrides))
    }
  }, [nameOverrides])

  const [fullAccessAccountCount, setFullAccessAccountCount] = useState(0)

  const [fullAccessCreatedByAdmin, setFullAccessCreatedByAdmin] = useState(false)

  const [fullAccessProfileByAdmin, setFullAccessProfileByAdmin] = useState<{
    name: string
    email: string
  } | null>(null)

  const updateIButtonUser = (id: string, name: string) => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }
    // Local overrides are managed separately through setEntityName()
    setIButtonUsers((prev) => prev.map((user) => (user.id === id ? { ...user, name } : user)))
  }

  const updateAppUser = (id: string, name: string) => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }
    setAppUsers((prev) =>
      prev.map((user) => {
        if (user.id !== id) return user

        // If Admin is editing a Full Access default user (id: "2")
        if (currentUserAccess === "admin" && id === "2") {
          const fullAccessUser = prev.find((u) => u.id === "2")
          if (fullAccessUser) {
            setFullAccessProfileByAdmin({
              name,
              email: fullAccessUser.email || "",
            })
          }
          return { ...user, name, adminOverrideName: name }
        }

        // Normal name update
        return { ...user, name }
      }),
    )
  }

  const addIButtonUser = () => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return `ibutton-blocked-${Date.now()}`
    }
    const newId = `ibutton-${Date.now()}`

    let creatorName = userName
    if (currentUserAccess === "full" && fullAccessProfileByAdmin) {
      creatorName = fullAccessProfileByAdmin.name
    }

    setIButtonUsers((prev) => [
      ...prev,
      {
        id: newId,
        name: "New iButton",
        chipId: `CHIP${Date.now()}`,
        createdBy: currentUserAccess,
        createdByName: creatorName,
        createdByRole: currentUserAccess,
        createdAt: new Date().toISOString(),
      },
    ])
    return newId
  }

  const removeIButtonUser = (id: string) => {
    if (id === "1") return
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }
    setIButtonUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const addAppUser = (name: string, email: string, access: "admin" | "full" | "open-close") => {
    if (currentUserAccess === "admin" && access === "full") {
      setFullAccessCreatedByAdmin(true)
      setFullAccessProfileByAdmin({ name, email })
    }
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }

    let creatorName = userName
    let creatorEmail = userEmail

    if (currentUserAccess === "full" && fullAccessProfileByAdmin) {
      creatorName = fullAccessProfileByAdmin.name
      creatorEmail = fullAccessProfileByAdmin.email
    }

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
        createdByName: creatorName,
        createdByRole: currentUserAccess,
        createdAt: new Date().toISOString(),
      },
    ])
  }

  const removeAppUser = (id: string) => {
    if (id === "1") return
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }
    setAppUsers((prev) => prev.filter((user) => user.id !== id))
  }

  const updateAppUserAccess = (id: string, access: "admin" | "full" | "open-close") => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }
    setAppUsers((prev) => prev.map((user) => (user.id === id ? { ...user, access } : user)))
  }

  const validateSerialNumber = (serial: string): boolean => {
    // Serial number validation: must be alphanumeric and ≥8 characters (per spec)
    const trimmed = serial.trim()
    if (trimmed.length < 8) return false
    if (!/^[A-Za-z0-9-]+$/.test(trimmed)) return false
    return true
  }

  // Door management functions
  const addDoor = (systemName: string): string | null => {
    if (currentUserAccess !== "admin") {
      return null
    }
    const newId = `door-${Date.now()}`
    const newDoor: Door = {
      id: newId,
      systemName: systemName.trim(),
      createdBy: currentUserAccess,
      createdAt: new Date().toISOString(),
    }
    setDoors((prev) => [...prev, newDoor])
    return newId
  }

  const updateDoor = (id: string, systemName: string): boolean => {
    if (currentUserAccess !== "admin") {
      return false
    }
    setDoors((prev) =>
      prev.map((door) => (door.id === id ? { ...door, systemName: systemName.trim() } : door)),
    )
    return true
  }

  const removeDoor = (id: string) => {
    if (currentUserAccess !== "admin") {
      return
    }
    setDoors((prev) => prev.filter((door) => door.id !== id))
  }

  const addController = (serialNumber: string, ip?: string): boolean => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return false
    }

    if (!validateSerialNumber(serialNumber)) {
      return false
    }

    // Check if serial number already exists
    if (controllers.some((c) => c.serialNumber === serialNumber.trim())) {
      return false
    }

    const newController: Controller = {
      id: `controller-${Date.now()}`,
      serialNumber: serialNumber.trim(),
      ip: ip?.trim(),
      status: "online",
      addedAt: new Date().toISOString(),
    }

    setControllers((prev) => [...prev, newController])
    return true
  }

  const updateController = (id: string, serialNumber: string, ip?: string): boolean => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return false
    }

    if (!validateSerialNumber(serialNumber)) {
      return false
    }

    // Check if serial number already exists on different controller
    if (controllers.some((c) => c.id !== id && c.serialNumber === serialNumber.trim())) {
      return false
    }

    setControllers((prev) =>
      prev.map((controller) =>
        controller.id === id ? { ...controller, serialNumber: serialNumber.trim(), ip: ip?.trim() } : controller,
      ),
    )
    return true
  }

  const removeController = (id: string) => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }
    setControllers((prev) => prev.filter((controller) => controller.id !== id))
  }

  const updateControllerStatus = (id: string, status: "online" | "offline") => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }
    setControllers((prev) => prev.map((controller) => (controller.id === id ? { ...controller, status } : controller)))
  }

  const getActiveController = (): Controller | null => {
    return controllers.length > 0 ? controllers[0] : null
  }

  const restartController = (id: string) => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }

    // Set isRestarting to true
    setControllers((prev) =>
      prev.map((controller) => (controller.id === id ? { ...controller, isRestarting: true } : controller)),
    )

    // Simulate restart: after 5 seconds, set isRestarting to false and status back to online
    setTimeout(() => {
      setControllers((prev) =>
        prev.map((controller) =>
          controller.id === id ? { ...controller, isRestarting: false, status: "online" } : controller,
        ),
      )
    }, 5000)
  }

  const handleSetUserName = (name: string) => {
    if (currentUserAccess === "full" && !fullAccessCreatedByAdmin) {
      return
    }

    setUserNamesByRole((prev) => ({
      ...prev,
      [currentUserAccess]: name,
    }))

    if (currentUserAccess === "admin") {
      // Update the admin's entry (id: "1")
      setAppUsers((prev) => prev.map((user) => (user.id === "1" ? { ...user, name } : user)))
    } else if (currentUserAccess === "full") {
      // Update the full access user's ownerDisplayName (id: "2")
      setAppUsers((prev) =>
        prev.map((user) =>
          user.id === "2" ? { ...user, name, ownerDisplayName: name, access: currentUserAccess } : user,
        ),
      )
    }
    // Open-close users don't have entries in appUsers
  }

  const getEntityName = (
    entityType: "doors" | "ibuttons" | "appusers" | "scenes",
    entityId: string,
    defaultName: string,
  ): string => {
    const userOverrides = nameOverrides[currentUserId]
    if (userOverrides && userOverrides[entityType] && userOverrides[entityType][entityId]) {
      return userOverrides[entityType][entityId]
    }
    return defaultName
  }

  const setEntityName = (
    entityType: "doors" | "ibuttons" | "appusers" | "scenes",
    entityId: string,
    customName: string,
  ) => {
    // Permission checks based on entity type
    if (entityType === "doors") {
      // Only admin and full access can rename doors
      if (currentUserAccess !== "admin" && currentUserAccess !== "full") {
        return
      }
    } else if (entityType === "ibuttons") {
      // Only admin and full access can rename iButtons
      if (currentUserAccess !== "admin" && currentUserAccess !== "full") {
        return
      }
    } else if (entityType === "appusers") {
      // Only admin and full access can rename app users
      if (currentUserAccess !== "admin" && currentUserAccess !== "full") {
        return
      }
    }

    // Set the local override for the current user
    setNameOverrides((prev) => {
      const updated = {
        ...prev,
        [currentUserId]: {
          ...(prev[currentUserId] || {}),
          [entityType]: {
            ...((prev[currentUserId] || {})[entityType] || {}),
            [entityId]: customName,
          },
        },
      }
      // Persist to localStorage immediately
      if (typeof window !== "undefined") {
        localStorage.setItem("nameOverrides", JSON.stringify(updated))
      }
      return updated
    })
  }

  const canCreateFullAccessAccount = (): boolean => {
    return fullAccessAccountCount < 1
  }

  const isFullAccessUserActivated = (): boolean => {
    return fullAccessCreatedByAdmin
  }

  const canFullAccessAddUsers = (adminHasActiveSubscription: boolean): boolean => {
    if (currentUserAccess !== "full") return true
    return adminHasActiveSubscription
  }

  const getFullAccessUserProfile = () => {
    return fullAccessProfileByAdmin
  }

  useEffect(() => {
    const currentName = userNamesByRole[currentUserAccess]

    if (currentUserAccess === "admin") {
      setAppUsers((prev) =>
        prev.map((user) => (user.id === "1" ? { ...user, name: currentName, access: currentUserAccess } : user)),
      )
    } else if (currentUserAccess === "full") {
      // Only update if the user already exists
      setAppUsers((prev) =>
        prev.map((user) =>
          user.id === "2" && user.access === "full"
            ? { ...user, name: currentName, ownerDisplayName: currentName }
            : user,
        ),
      )
    }
  }, [currentUserAccess, userNamesByRole])

  useEffect(() => {
    if (!autoLockEnabled) {
      setCountdown(null)
      return
    }

    if (doorState === "unlock" && autoLockEnabled) {
      setCountdown(autoLockDelay)

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 0) {
            return null
          }

          const newCount = prev - 1

          if (newCount <= 0) {
            setDoorState("lock")
            return null
          }

          return newCount
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setCountdown(null)
    }
  }, [doorState, autoLockDelay, autoLockEnabled])

  useEffect(() => {
    if (!autoNightLockEnabled) return

    const checkNightLock = () => {
      const now = new Date()
      const currentDate = now.toDateString()

      let targetHour = Number.parseInt(nightLockHour)
      if (nightLockPeriod === "PM" && targetHour !== 12) {
        targetHour += 12
      } else if (nightLockPeriod === "AM" && targetHour === 12) {
        targetHour = 0
      }

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
  }, [autoNightLockEnabled, nightLockHour, nightLockMinute, nightLockPeriod, lastNightLockDate, setDoorState])

  useEffect(() => {
    const count = appUsers.filter((user) => user.access === "full").length
    setFullAccessAccountCount(count)
  }, [appUsers])

  useEffect(() => {
    if (currentUserAccess === "admin") {
      setCurrentUserId("admin-1")
    } else if (currentUserAccess === "full") {
      setCurrentUserId("full-1")
    } else {
      setCurrentUserId("open-close-1")
    }
  }, [currentUserAccess])

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
