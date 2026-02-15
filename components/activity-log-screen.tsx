"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, LockIcon, Home, Activity, SettingsIcon, User, Layers } from "lucide-react"
import type { Screen } from "@/app/page"
import { getDoorStatusClass } from "@/lib/color-utils"
import { useAppContext } from "@/lib/app-context"
import { ModalSelector } from "@/components/ui/modal-selector"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import type { ActivityLogEntry } from "@/lib/core/activity-log"

interface ActivityLogScreenProps {
  onNavigate: (screen: Screen) => void
  isPremium: boolean
  doorName: string
  currentScreen: Screen
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
  // future (няма реални записи още, но оставяме филтрите)
  "wifi",
  "battery",
  "cpu-temp",
  "cpu-load",
  "latency",
  "power-drops",
  // реални
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
  const [userFilter, setUserFilter] = useState<string>("all")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { currentUserAccess, activityLog } = useAppContext()

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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
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

  // Demo fallback (ако още няма real записи)
  const sampleActivityLogs: ActivityLogEntry[] = [
    {
      id: "sample-1",
      createdAt: "2025-12-19T10:45:00.000Z",
      doorName,
      time: "10:45 AM",
      date: "Today",
      action: "open",
      method: null,
      user: null,
      role: null,
      eventType: "door-open",
    },
    {
      id: "sample-2",
      createdAt: "2025-12-19T10:47:00.000Z",
      doorName,
      time: "10:47 AM",
      date: "Today",
      action: "closed",
      method: null,
      user: null,
      role: null,
      eventType: "door-closed",
    },
    {
      id: "sample-3",
      createdAt: "2025-12-19T14:30:00.000Z",
      doorName,
      time: "02:30 PM",
      date: "Today",
      action: "unlock",
      method: "iButton",
      user: "Jane Smith",
      role: "Full Access",
      eventType: "door-unlock",
    },
    {
      id: "sample-4",
      createdAt: "2025-12-19T17:15:00.000Z",
      doorName,
      time: "05:15 PM",
      date: "Today",
      action: "lock",
      method: "App",
      user: "John Doe",
      role: "Admin",
      eventType: "door-lock",
    },
    {
      id: "sample-5",
      createdAt: "2025-12-19T09:22:00.000Z",
      time: "09:22 AM",
      date: "Yesterday",
      action: "Power restored after outage",
      user: "System",
      role: null,
      description: "Power was restored after an outage • 19/12/2025 09:22",
      eventType: "power-restored",
    },
    {
      id: "sample-6",
      createdAt: "2025-12-18T11:30:00.000Z",
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
      id: "sample-7",
      createdAt: "2025-12-16T21:10:00.000Z",
      time: "09:10 PM",
      date: "16/12/2025",
      action: "Quick control changed",
      user: "John Doe",
      role: "Admin",
      description: "Automatic Night Lock was enabled (locks at 22:30) by Admin John Doe • 16/12/2025 21:10",
      eventType: "quick-control-changed",
    },
  ]

  const activityLogs: ActivityLogEntry[] = activityLog.length ? activityLog : sampleActivityLogs

  const filteredLogs = activityLogs.filter((log) => {
    if (eventType !== "all") {
      // NOTE: някои филтри (wifi/battery/etc) може да няма записи още -> просто ще е празно
      if (log.eventType !== (eventType as any)) return false
    }
    if (userFilter !== "all" && log.user !== userFilter) return false
    return true
  })

  const showUserFilter = (USER_FILTER_EVENT_TYPES as readonly string[]).includes(eventType)

  const availableUsers = Array.from(
    new Set(activityLogs.map((l) => l.user).filter((u): u is string => typeof u === "string" && u.length > 0))
  )

  const getActiveTab = () => {
    if (currentScreen === "dashboard") return "home"
    if (currentScreen === "activity-log") return "activity-log"
    if (currentScreen === "scenes") return "scenes"
    if (currentScreen === "settings") return "settings"
    if (currentScreen === "profile") return "profile"
    return "activity-log"
  }

  const activeTab = getActiveTab()

  return (
    <div className="flex flex-col h-full">
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

                // ако избрания тип НЕ поддържа User filter -> reset
                if (!(USER_FILTER_EVENT_TYPES as readonly string[]).includes(value)) {
                  setUserFilter("all")
                }
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
                onValueChange={(value: string) => setUserFilter(value)}
                label="Select User"
                options={[
                  { value: "all", label: "All users" },
                  ...availableUsers.map((u) => ({ value: u, label: u })),
                ]}
              />
            )}
          </div>
        </div>

        <div ref={scrollContainerRef} className="space-y-3 flex-1 overflow-y-auto">
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
