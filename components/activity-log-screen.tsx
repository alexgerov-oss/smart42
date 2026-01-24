"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, LockIcon, Home, Activity, SettingsIcon, User, Layers } from "lucide-react"
import type { Screen } from "@/app/page"
import { getDoorStatusClass } from "@/lib/color-utils"
import { useAppContext } from "@/lib/app-context"
import { useToast } from "@/hooks/use-toast"
import { ModalSelector } from "@/components/ui/modal-selector"
import { Permissions, type PermissionContext } from "@/lib/permissions"

interface ActivityLogScreenProps {
  onNavigate: (screen: Screen) => void
  isPremium: boolean
  doorName: string
  currentScreen: Screen
}

const users = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Williams"]

type ActivityLogEntry = {
  id: number
  doorName?: string
  time: string
  date: string
  action: string
  method?: string | null
  user?: string | null
  role?: string | null
  description?: string
  eventType:
    | "door-lock"
    | "door-unlock"
    | "door-open"
    | "door-closed"
    | "power-restored"
    | "ibutton-created"
    | "ibutton-deleted"
    | "app-user-created"
    | "app-user-edited"
    | "app-user-deleted"
    | "scene-created"
    | "scene-edited"
    | "scene-deleted"
    | "quick-control-changed"
}

export default function ActivityLogScreen({ onNavigate, isPremium, doorName, currentScreen }: ActivityLogScreenProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day")
  const [eventType, setEventType] = useState<
    | "all"
    | "door-lock"
    | "door-unlock"
    | "door-open"
    | "door-closed"
    | "wifi"
    | "battery"
    | "cpu-temp"
    | "cpu-load"
    | "latency"
    | "power-drops"
    | "power-restored"
    | "ibutton-created"
    | "ibutton-deleted"
    | "app-user-created"
    | "app-user-edited"
    | "app-user-deleted"
    | "scene-created"
    | "scene-edited"
    | "scene-deleted"
    | "quick-control-changed"
  >("all")
  const [userFilter, setUserFilter] = useState<string>("all")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { currentUserAccess } = useAppContext()
  
  // Permission context - default to restrictive
  const permissionContext: PermissionContext = {
    currentUserAccess,
    adminHasActiveSubscription: isPremium,
    isTrialActive: false,
    isTrialExpired: false,
  }

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)
  const { toast } = useToast()

  // Block access for open-close users
  if (!canAccessActivity) {
    return (
      <div className="flex min-h-screen flex-col pb-20">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="bg-card border-border p-8 text-center space-y-4 max-w-sm">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <LockIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className="text-sm text-muted-foreground">
              Activity log is only available for Admin and Full Access users.
            </p>
            <Button onClick={() => onNavigate("dashboard")} variant="outline" className="w-full border-border">
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }, [])

  useEffect(() => {
    if (!["door-lock", "door-unlock"].includes(eventType)) {
      setUserFilter("all")
    }
  }, [eventType])

  const activityLogs: ActivityLogEntry[] = [
    {
      id: 1,
      doorName: doorName,
      time: "10:45 AM",
      date: "Today",
      action: "open",
      method: null,
      user: null,
      eventType: "door-open",
    },
    {
      id: 2,
      doorName: doorName,
      time: "10:47 AM",
      date: "Today",
      action: "closed",
      method: null,
      user: null,
      eventType: "door-closed",
    },
    {
      id: 3,
      doorName: doorName,
      time: "02:30 PM",
      date: "Today",
      action: "unlock",
      method: "iButton",
      user: "Jane Smith",
      eventType: "door-unlock",
    },
    {
      id: 4,
      doorName: doorName,
      time: "02:35 PM",
      date: "Today",
      action: "open",
      method: null,
      user: null,
      eventType: "door-open",
    },
    {
      id: 5,
      doorName: doorName,
      time: "05:15 PM",
      date: "Today",
      action: "lock",
      method: "App",
      user: "John Doe",
      eventType: "door-lock",
    },
    {
      id: 6,
      doorName: doorName,
      time: "05:20 PM",
      date: "Today",
      action: "closed",
      method: null,
      user: null,
      eventType: "door-closed",
    },
    {
      id: 7,
      doorName: doorName,
      time: "08:12 AM",
      date: "Yesterday",
      action: "unlock",
      method: "App",
      user: "John Doe",
      eventType: "door-unlock",
    },
    {
      id: 8,
      doorName: doorName,
      time: "08:15 AM",
      date: "Yesterday",
      action: "open",
      method: null,
      user: null,
      eventType: "door-open",
    },
    // Power restored event
    {
      id: 9,
      time: "09:22 AM",
      date: "Yesterday",
      action: "Power restored after outage",
      user: "System",
      role: null,
      description: "Power was restored after an outage • 19/12/2025 09:22",
      eventType: "power-restored",
    },
    // iButton created
    {
      id: 10,
      time: "11:30 AM",
      date: "Yesterday",
      action: "iButton created",
      user: "John Doe",
      role: "Admin",
      description:
        "iButton 'Front Door Key' (ID: IBT-483920, Open/Close Only) was created by Admin John Doe • 18/12/2025 11:30",
      eventType: "ibutton-created",
    },
    // iButton deleted
    {
      id: 11,
      time: "03:15 PM",
      date: "Yesterday",
      action: "iButton deleted",
      user: "Jane Smith",
      role: "Full Access",
      description:
        "iButton 'Garage Key' (ID: IBT-294103, Open/Close Only) was deleted by Jane Smith (Full Access) • 18/12/2025 15:15",
      eventType: "ibutton-deleted",
    },
    // App user created
    {
      id: 12,
      time: "10:05 AM",
      date: "18/12/2025",
      action: "App user created",
      user: "John Doe",
      role: "Admin",
      description: "User 'Alice Johnson' (Full Access) was created by Admin John Doe • 18/12/2025 10:05",
      eventType: "app-user-created",
    },
    // App user edited
    {
      id: 13,
      time: "02:40 PM",
      date: "18/12/2025",
      action: "App user edited",
      user: "John Doe",
      role: "Admin",
      description: "User 'Alice Johnson' (Full Access) was edited by Admin John Doe • 18/12/2025 14:40",
      eventType: "app-user-edited",
    },
    // App user deleted
    {
      id: 14,
      time: "04:22 PM",
      date: "18/12/2025",
      action: "App user deleted",
      user: "John Doe",
      role: "Admin",
      description: "User 'Mike Brown' (Open/Close Only) was deleted by Admin John Doe • 18/12/2025 16:22",
      eventType: "app-user-deleted",
    },
    // Scene created
    {
      id: 15,
      time: "09:05 PM",
      date: "17/12/2025",
      action: "Scene created",
      user: "John Doe",
      role: "Admin",
      description:
        "Scene 'Night Lock' was created by Admin John Doe • 17/12/2025 21:05\nDescription: Locks the door automatically every night at 22:00.",
      eventType: "scene-created",
    },
    // Scene edited
    {
      id: 16,
      time: "08:12 AM",
      date: "17/12/2025",
      action: "Scene edited",
      user: "Jane Smith",
      role: "Full Access",
      description:
        "Scene 'Night Lock' was edited by Jane Smith (Full Access) • 17/12/2025 08:12\nDescription: Locks the door automatically every night at 23:00.",
      eventType: "scene-edited",
    },
    // Scene deleted
    {
      id: 17,
      time: "10:44 AM",
      date: "17/12/2025",
      action: "Scene deleted",
      user: "John Doe",
      role: "Admin",
      description:
        "Scene 'Vacation Mode' was deleted by Admin John Doe • 17/12/2025 10:44\nDescription: Disables manual unlocking and sends notifications.",
      eventType: "scene-deleted",
    },
    // Quick control changed - Automatic Lock enabled
    {
      id: 18,
      time: "06:32 PM",
      date: "16/12/2025",
      action: "Quick control changed",
      user: "Jane Smith",
      role: "Full Access",
      description: "Automatic Lock was enabled (15 seconds) by Jane Smith (Full Access) • 16/12/2025 18:32",
      eventType: "quick-control-changed",
    },
    // Quick control changed - Automatic Lock disabled
    {
      id: 19,
      time: "07:01 PM",
      date: "16/12/2025",
      action: "Quick control changed",
      user: "John Doe",
      role: "Admin",
      description: "Automatic Lock was disabled by Admin John Doe • 16/12/2025 19:01",
      eventType: "quick-control-changed",
    },
    // Quick control changed - Automatic Night Lock enabled
    {
      id: 20,
      time: "09:10 PM",
      date: "16/12/2025",
      action: "Quick control changed",
      user: "John Doe",
      role: "Admin",
      description: "Automatic Night Lock was enabled (locks at 22:30) by Admin John Doe • 16/12/2025 21:10",
      eventType: "quick-control-changed",
    },
    // Quick control changed - Automatic Night Lock disabled
    {
      id: 21,
      time: "07:45 AM",
      date: "15/12/2025",
      action: "Quick control changed",
      user: "Jane Smith",
      role: "Full Access",
      description: "Automatic Night Lock was disabled by Jane Smith (Full Access) • 15/12/2025 07:45",
      eventType: "quick-control-changed",
    },
  ]

  const filteredLogs = activityLogs.filter((log) => {
    if (eventType !== "all") {
      // For door events, match the action
      if (eventType.startsWith("door-")) {
        const actionMatch = log.action === eventType.replace("door-", "")
        if (!actionMatch) return false
      }
      // For quick-control-changed, match the eventType directly
      else if (eventType === "quick-control-changed") {
        if (log.eventType !== "quick-control-changed") return false
      } else if (log.eventType !== eventType) {
        return false
      }
    }
    if (userFilter !== "all" && log.user !== userFilter) return false
    return true
  })

  const showUserFilter = [
    "door-lock",
    "door-unlock",
    "ibutton-created",
    "ibutton-deleted",
    "app-user-created",
    "app-user-edited",
    "app-user-deleted",
    "scene-created",
    "scene-edited",
    "scene-deleted",
    "quick-control-changed",
  ].includes(eventType)

  const getActiveTab = () => {
    if (currentScreen === "dashboard") return "home"
    if (currentScreen === "activity-log") return "activity-log"
    if (currentScreen === "scenes") return "scenes"
    if (currentScreen === "settings") return "settings"
    if (currentScreen === "profile") return "profile"
    return "activity-log"
  }

  const activeTab = getActiveTab()

  // Check both permission and premium status
  if (!isPremium || !canAccessActivity) {
    return (
      <div className="flex min-h-screen flex-col pb-20">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="bg-card border-border p-8 text-center space-y-4 max-w-sm">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <LockIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Premium Feature</h2>
            <p className="text-sm text-muted-foreground">
              Full activity log history is only available for Premium users. Upgrade now to access complete door
              activity records.
            </p>
            <Button
              onClick={() => onNavigate("subscription")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Upgrade to Premium
            </Button>
            <Button onClick={() => onNavigate("dashboard")} variant="outline" className="w-full border-border">
              Back to Dashboard
            </Button>
          </Card>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
          <div className="flex items-center justify-around p-4">
            <button
              onClick={() => {
                onNavigate("dashboard")
                window.scrollTo({ top: 0, behavior: "instant" })
              }}
              className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </button>

            <button className="flex flex-col items-center gap-1 transition-colors text-primary relative">
              <div className="relative">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-xs">Activity Log</span>
            </button>

            <button
              onClick={() => {
                onNavigate("settings")
                window.scrollTo({ top: 0, behavior: "instant" })
              }}
              className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
            >
              <SettingsIcon className="h-6 w-6" />
              <span className="text-xs">Settings</span>
            </button>

            <button
              onClick={() => {
                onNavigate("profile")
                window.scrollTo({ top: 0, behavior: "instant" })
              }}
              className="flex flex-col items-center gap-1 transition-colors text-muted-foreground"
            >
              <User className="h-6 w-6" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className="text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter Controls */}
        <div className="flex-none p-4 pb-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col gap-2">
            <ModalSelector
              value={timeRange}
              onValueChange={(value: any) => setTimeRange(value)}
              label="Select Time Range"
              options={[
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
                { value: "year", label: "Year" },
              ]}
            />

            <ModalSelector
              value={eventType}
              onValueChange={(value: any) => setEventType(value)}
              label="Select Event Type"
              options={[
                { value: "all", label: "All events" },
                { value: "door-lock", label: "door lock" },
                { value: "door-unlock", label: "door unlock" },
                { value: "door-open", label: "door open" },
                { value: "door-closed", label: "door closed" },
                { value: "wifi", label: "wifi" },
                { value: "battery", label: "battery" },
                { value: "cpu-temp", label: "cpu temperature" },
                { value: "cpu-load", label: "cpu load" },
                { value: "latency", label: "latency" },
                { value: "power-drops", label: "power drops" },
                { value: "power-restored", label: "power restored" },
                { value: "ibutton-created", label: "iButton created" },
                { value: "ibutton-deleted", label: "iButton deleted" },
                { value: "app-user-created", label: "App user created" },
                { value: "app-user-edited", label: "App user edited" },
                { value: "app-user-deleted", label: "App user deleted" },
                { value: "scene-created", label: "Scene created" },
                { value: "scene-edited", label: "Scene edited" },
                { value: "scene-deleted", label: "Scene deleted" },
                { value: "quick-control-changed", label: "Quick control changed" },
              ]}
            />

            {showUserFilter && (
              <ModalSelector
                value={userFilter}
                onValueChange={setUserFilter}
                label="Select User"
                options={[{ value: "all", label: "All users" }, ...users.map((user) => ({ value: user, label: user }))]}
              />
            )}
          </div>
        </div>

        {/* Activity Log Entries */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {filteredLogs.map((log) => (
            <Card key={log.id} className="bg-card border-border p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {log.description ? (
                    <>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">{log.description}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">{log.doorName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.action === "open" || log.action === "closed" ? (
                          <span className={getDoorStatusClass(log.action as "open" | "closed") + " font-medium"}>
                            {log.action}
                          </span>
                        ) : (
                          <>
                            <span className={getDoorStatusClass(log.action as "lock" | "unlock") + " font-medium"}>
                              {log.action}
                            </span>
                            {log.method && ` via ${log.method}`}
                            {log.user && ` • ${log.user}`}
                          </>
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3 w-3" />
                    {log.time}
                  </div>
                  <p className="text-xs text-muted-foreground">{log.date}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around p-4">
          <button
            onClick={() => {
              onNavigate("dashboard")
              window.scrollTo({ top: 0, behavior: "instant" })
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "home" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </button>

          <button
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "activity-log" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Activity className="h-6 w-6" />
            <span className="text-xs">Activity</span>
          </button>

          <button
            onClick={() => {
              if (canAccessScenes) {
                onNavigate("scenes")
                window.scrollTo({ top: 0, behavior: "instant" })
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "scenes" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Layers className="h-6 w-6" />
              {!canAccessScenes && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
            </div>
            <span className="text-xs">Scenes</span>
          </button>

          <button
            onClick={() => {
              if (canAccessSettings) {
                onNavigate("settings")
                window.scrollTo({ top: 0, behavior: "instant" })
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "settings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <SettingsIcon className="h-6 w-6" />
              {!canAccessSettings && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
            </div>
            <span className="text-xs">Settings</span>
          </button>

          <button
            onClick={() => {
              onNavigate("profile")
              window.scrollTo({ top: 0, behavior: "instant" })
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "profile" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
