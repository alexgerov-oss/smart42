"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, LockIcon } from "lucide-react"
import type { Screen } from "@/app/page"
import { getDoorStatusClass } from "@/lib/color-utils"
import { useAppContext } from "@/lib/app-context"
import { ModalSelector } from "@/components/ui/modal-selector"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import { AppBottomNav } from "@/components/app-bottom-nav"

interface ActivityLogScreenProps {
  onNavigate: (screen: Screen) => void
  isPremium: boolean
  doorName: string
  currentScreen: Screen
}

const users = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Williams"] as const
type KnownUser = (typeof users)[number]
type UserFilter = "all" | KnownUser

type ActivityLogEntry = {
  id: number
  createdAt: string
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

type TimeRange = "day" | "week" | "month" | "year"
function isTimeRange(value: string): value is TimeRange {
  return value === "day" || value === "week" || value === "month" || value === "year"
}

const EVENT_TYPE_OPTIONS = [
  "all",
  "door-lock",
  "door-unlock",
  "door-open",
  "door-closed",
  "wifi",
  "battery",
  "cpu-temp",
  "cpu-load",
  "latency",
  "power-drops",
  "power-restored",
  "ibutton-created",
  "ibutton-deleted",
  "app-user-created",
  "app-user-edited",
  "app-user-deleted",
  "scene-created",
  "scene-edited",
  "scene-deleted",
  "quick-control-changed",
] as const

type EventTypeFilter = (typeof EVENT_TYPE_OPTIONS)[number]
function isEventTypeFilter(value: string): value is EventTypeFilter {
  return (EVENT_TYPE_OPTIONS as readonly string[]).includes(value)
}

const USER_FILTER_EVENT_TYPES = [
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
] as const

function isDoorOpenClosed(action: string): action is "open" | "closed" {
  return action === "open" || action === "closed"
}
function isDoorLockUnlock(action: string): action is "lock" | "unlock" {
  return action === "lock" || action === "unlock"
}

export default function ActivityLogScreen({ onNavigate, isPremium, doorName, currentScreen }: ActivityLogScreenProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("day")
  const [eventType, setEventType] = useState<EventTypeFilter>("all")
  const [userFilter, setUserFilter] = useState<UserFilter>("all")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { currentUserAccess } = useAppContext()

  const permissionContext: PermissionContext = {
    currentUserAccess,
    adminHasActiveSubscription: isPremium,
    isTrialActive: false,
    isTrialExpired: false,
  }

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }, [])

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
            <p className="text-sm text-muted-foreground">Activity log is only available for Admin and Full Access users.</p>
            <Button onClick={() => onNavigate("dashboard")} variant="outline" className="w-full border-border">
              Back to Dashboard
            </Button>
          </Card>
        </div>

        <AppBottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          isPremium={isPremium}
          canAccessActivity={canAccessActivity}
          canAccessScenes={canAccessScenes}
          canAccessSettings={canAccessSettings}
        />
      </div>
    )
  }

  if (!isPremium) {
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
              Full activity log history is only available for Premium users. Upgrade now to access complete door activity
              records.
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

        <AppBottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          isPremium={isPremium}
          canAccessActivity={canAccessActivity}
          canAccessScenes={canAccessScenes}
          canAccessSettings={canAccessSettings}
        />
      </div>
    )
  }

  const activityLogs: ActivityLogEntry[] = [
    { id: 1, createdAt: "2025-12-19T10:45:00", doorName, time: "10:45 AM", date: "Today", action: "open", method: null, user: null, eventType: "door-open" },
    { id: 2, createdAt: "2025-12-19T10:47:00", doorName, time: "10:47 AM", date: "Today", action: "closed", method: null, user: null, eventType: "door-closed" },
    { id: 3, createdAt: "2025-12-19T14:30:00", doorName, time: "02:30 PM", date: "Today", action: "unlock", method: "iButton", user: "Jane Smith", eventType: "door-unlock" },
    { id: 4, createdAt: "2025-12-19T14:35:00", doorName, time: "02:35 PM", date: "Today", action: "open", method: null, user: null, eventType: "door-open" },
    { id: 5, createdAt: "2025-12-19T17:15:00", doorName, time: "05:15 PM", date: "Today", action: "lock", method: "App", user: "John Doe", eventType: "door-lock" },
    { id: 6, createdAt: "2025-12-19T17:20:00", doorName, time: "05:20 PM", date: "Today", action: "closed", method: null, user: null, eventType: "door-closed" },

    { id: 7, createdAt: "2025-12-18T08:12:00", doorName, time: "08:12 AM", date: "Yesterday", action: "unlock", method: "App", user: "John Doe", eventType: "door-unlock" },
    { id: 8, createdAt: "2025-12-18T08:15:00", doorName, time: "08:15 AM", date: "Yesterday", action: "open", method: null, user: null, eventType: "door-open" },

    {
      id: 9,
      createdAt: "2025-12-19T09:22:00",
      time: "09:22 AM",
      date: "Yesterday",
      action: "Power restored after outage",
      user: "System",
      role: null,
      description: "Power was restored after an outage • 19/12/2025 09:22",
      eventType: "power-restored",
    },

    {
      id: 10,
      createdAt: "2025-12-18T11:30:00",
      time: "11:30 AM",
      date: "Yesterday",
      action: "iButton created",
      user: "John Doe",
      role: "Admin",
      description:
        "iButton 'Front Door Key' (ID: IBT-483920, Open/Close Only) was created by Admin John Doe • 18/12/2025 11:30",
      eventType: "ibutton-created",
    },
    {
      id: 11,
      createdAt: "2025-12-18T15:15:00",
      time: "03:15 PM",
      date: "Yesterday",
      action: "iButton deleted",
      user: "Jane Smith",
      role: "Full Access",
      description:
        "iButton 'Garage Key' (ID: IBT-294103, Open/Close Only) was deleted by Jane Smith (Full Access) • 18/12/2025 15:15",
      eventType: "ibutton-deleted",
    },

    {
      id: 12,
      createdAt: "2025-12-18T10:05:00",
      time: "10:05 AM",
      date: "18/12/2025",
      action: "App user created",
      user: "John Doe",
      role: "Admin",
      description: "User 'Alice Johnson' (Full Access) was created by Admin John Doe • 18/12/2025 10:05",
      eventType: "app-user-created",
    },
    {
      id: 13,
      createdAt: "2025-12-18T14:40:00",
      time: "02:40 PM",
      date: "18/12/2025",
      action: "App user edited",
      user: "John Doe",
      role: "Admin",
      description: "User 'Alice Johnson' (Full Access) was edited by Admin John Doe • 18/12/2025 14:40",
      eventType: "app-user-edited",
    },
    {
      id: 14,
      createdAt: "2025-12-18T16:22:00",
      time: "04:22 PM",
      date: "18/12/2025",
      action: "App user deleted",
      user: "John Doe",
      role: "Admin",
      description: "User 'Mike Brown' (Open/Close Only) was deleted by Admin John Doe • 18/12/2025 16:22",
      eventType: "app-user-deleted",
    },

    {
      id: 15,
      createdAt: "2025-12-17T21:05:00",
      time: "09:05 PM",
      date: "17/12/2025",
      action: "Scene created",
      user: "John Doe",
      role: "Admin",
      description:
        "Scene 'Night Lock' was created by Admin John Doe • 17/12/2025 21:05\nDescription: Locks the door automatically every night at 22:00.",
      eventType: "scene-created",
    },
    {
      id: 16,
      createdAt: "2025-12-17T08:12:00",
      time: "08:12 AM",
      date: "17/12/2025",
      action: "Scene edited",
      user: "Jane Smith",
      role: "Full Access",
      description:
        "Scene 'Night Lock' was edited by Jane Smith (Full Access) • 17/12/2025 08:12\nDescription: Locks the door automatically every night at 23:00.",
      eventType: "scene-edited",
    },
    {
      id: 17,
      createdAt: "2025-12-17T10:44:00",
      time: "10:44 AM",
      date: "17/12/2025",
      action: "Scene deleted",
      user: "John Doe",
      role: "Admin",
      description:
        "Scene 'Vacation Mode' was deleted by Admin John Doe • 17/12/2025 10:44\nDescription: Disables manual unlocking and sends notifications.",
      eventType: "scene-deleted",
    },

    {
      id: 18,
      createdAt: "2025-12-16T18:32:00",
      time: "06:32 PM",
      date: "16/12/2025",
      action: "Quick control changed",
      user: "Jane Smith",
      role: "Full Access",
      description: "Automatic Lock was enabled (15 seconds) by Jane Smith (Full Access) • 16/12/2025 18:32",
      eventType: "quick-control-changed",
    },
    {
      id: 19,
      createdAt: "2025-12-16T19:01:00",
      time: "07:01 PM",
      date: "16/12/2025",
      action: "Quick control changed",
      user: "John Doe",
      role: "Admin",
      description: "Automatic Lock was disabled by Admin John Doe • 16/12/2025 19:01",
      eventType: "quick-control-changed",
    },
    {
      id: 20,
      createdAt: "2025-12-16T21:10:00",
      time: "09:10 PM",
      date: "16/12/2025",
      action: "Quick control changed",
      user: "John Doe",
      role: "Admin",
      description: "Automatic Night Lock was enabled (locks at 22:30) by Admin John Doe • 16/12/2025 21:10",
      eventType: "quick-control-changed",
    },
    {
      id: 21,
      createdAt: "2025-12-15T07:45:00",
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
      if (log.eventType !== eventType) return false
    }
    if (userFilter !== "all" && log.user !== userFilter) return false
    return true
  })

  const showUserFilter = (USER_FILTER_EVENT_TYPES as readonly string[]).includes(eventType)

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("dashboard")} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-none p-4 pb-3 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex flex-col gap-2">
            <ModalSelector
              value={timeRange}
              onValueChange={(value: string) => {
                if (isTimeRange(value)) setTimeRange(value)
              }}
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
              onValueChange={(value: string) => {
                if (!isEventTypeFilter(value)) return
                setEventType(value)
                if (!["door-lock", "door-unlock"].includes(value)) setUserFilter("all")
              }}
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
                onValueChange={(value: string) => {
                  if (value === "all") setUserFilter("all")
                  else if ((users as readonly string[]).includes(value)) setUserFilter(value as KnownUser)
                }}
                label="Select User"
                options={[{ value: "all", label: "All users" }, ...users.map((u) => ({ value: u, label: u }))]}
              />
            )}
          </div>
        </div>

        <div ref={scrollContainerRef} className="space-y-3 flex-1 overflow-y-auto p-4">
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
                        {isDoorOpenClosed(log.action) ? (
                          <span className={getDoorStatusClass(log.action) + " font-medium"}>{log.action}</span>
                        ) : isDoorLockUnlock(log.action) ? (
                          <>
                            <span className={getDoorStatusClass(log.action) + " font-medium"}>{log.action}</span>
                            {log.method && ` via ${log.method}`}
                            {log.user && ` • ${log.user}`}
                          </>
                        ) : (
                          <span className="font-medium">{log.action}</span>
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

      <AppBottomNav
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        isPremium={isPremium}
        canAccessActivity={canAccessActivity}
        canAccessScenes={canAccessScenes}
        canAccessSettings={canAccessSettings}
      />
    </div>
  )
}
