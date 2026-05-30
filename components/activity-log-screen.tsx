"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, LockIcon } from "lucide-react"
import type { Screen } from "@/app/page"
import { getDoorStatusClass } from "@/lib/color-utils"
import { useAppContext } from "@/lib/app-context"
import { ModalSelector } from "@/components/ui/modal-selector"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import { AppBottomNav } from "@/components/app-bottom-nav"
import { VisibilityThemeSelector } from "@/components/visibility-theme-selector"

interface ActivityLogScreenProps {
  onNavigate: (screen: Screen) => void
  hasPlan: boolean
  doorName: string
  currentScreen: Screen
}

type ActivityVisibilityTheme = "dark" | "soft" | "day"

const ACTIVITY_VISIBILITY_THEMES: ActivityVisibilityTheme[] = ["dark", "soft", "day"]

const ACTIVITY_VISIBILITY_THEME_CLASSES: Record<
  ActivityVisibilityTheme,
  {
    card: string
    header: string
    filterBar: string
    mutedText: string
    bottomNavInactiveText: string
    swatch: string
  }
> = {
  dark: {
    card: "bg-card",
    header: "bg-card",
    filterBar: "bg-background/95 supports-backdrop-filter:bg-background/60",
    mutedText: "text-muted-foreground",
    bottomNavInactiveText: "text-muted-foreground",
    swatch: "bg-black",
  },
  soft: {
    card: "bg-[#232b3a]",
    header: "bg-[#232b3a]",
    filterBar: "bg-[#151b27]/95 supports-backdrop-filter:bg-[#151b27]/60",
    mutedText: "text-gray-300",
    bottomNavInactiveText: "text-gray-300",
    swatch: "bg-[linear-gradient(135deg,#111827_0%,#111827_50%,#ffffff_50%,#ffffff_100%)]",
  },
  day: {
    card: "bg-[#2d374c]",
    header: "bg-[#2d374c]",
    filterBar: "bg-[#151d2b]/95 supports-backdrop-filter:bg-[#151d2b]/60",
    mutedText: "text-gray-200",
    bottomNavInactiveText: "text-gray-100",
    swatch: "bg-white",
  },
}

const users = ["John Doe", "Jane Smith", "Alice Johnson", "Bob Williams"] as const
type KnownUser = (typeof users)[number]
type UserFilter = "all" | KnownUser

type ActivityLogEntry = {
  id: number | string
  createdAt: string // ISO date string
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

function formatActivityTime(createdAt: string): string {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("bg-BG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

function formatActivityDate(createdAt: string): string {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ""

  return new Intl.DateTimeFormat("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function isDoorLockUnlock(action: string): action is "lock" | "unlock" {
  return action === "lock" || action === "unlock"
}

function withinRange(createdAtIso: string, range: TimeRange): boolean {
  const ts = Date.parse(createdAtIso)
  if (Number.isNaN(ts)) return true

  const now = Date.now()
  const diffMs = now - ts
  const day = 24 * 60 * 60 * 1000

  if (range === "day") return diffMs <= day
  if (range === "week") return diffMs <= 7 * day
  if (range === "month") return diffMs <= 30 * day
  return diffMs <= 365 * day
}

export default function ActivityLogScreen({ onNavigate, hasPlan, doorName, currentScreen }: ActivityLogScreenProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("day")
  const [eventType, setEventType] = useState<EventTypeFilter>("all")
  const [userFilter, setUserFilter] = useState<UserFilter>("all")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [visibilityTheme, setVisibilityTheme] = useState<ActivityVisibilityTheme>(() => {
    if (typeof window === "undefined") return "soft"
    const savedTheme = window.localStorage.getItem("homeVisibilityTheme")
    return savedTheme === "dark" || savedTheme === "day" ? savedTheme : "soft"
  })

  const activityTheme = ACTIVITY_VISIBILITY_THEME_CLASSES[visibilityTheme]

  const handleVisibilityThemeChange = (theme: ActivityVisibilityTheme) => {
    setVisibilityTheme(theme)
    window.localStorage.setItem("homeVisibilityTheme", theme)
  }

  const { currentUserAccess, activityLog } = useAppContext()

  // ✅ единствена истина: plan идва от parent
  const effectiveHasPlan = Boolean(hasPlan)

  const permissionContext: PermissionContext = {
    currentUserAccess,
    hasPlan: effectiveHasPlan,
  }

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)

  const canSeeActivityContent = canAccessActivity && effectiveHasPlan

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }, [])

  const demoActivityLogs: ActivityLogEntry[] = useMemo(() => {
    const now = new Date()
    const isoToday = (h: number, m: number) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0).toISOString()
    const isoYesterday = (h: number, m: number) =>
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, h, m, 0, 0).toISOString()

    return [
      { id: 1, createdAt: isoToday(10, 45), doorName, time: "10:45 AM", date: "Today", action: "open", method: null, user: null, eventType: "door-open" },
      { id: 2, createdAt: isoToday(10, 47), doorName, time: "10:47 AM", date: "Today", action: "closed", method: null, user: null, eventType: "door-closed" },
      { id: 3, createdAt: isoToday(14, 30), doorName, time: "02:30 PM", date: "Today", action: "unlock", method: "iButton", user: "Jane Smith", eventType: "door-unlock" },
      { id: 4, createdAt: isoToday(14, 35), doorName, time: "02:35 PM", date: "Today", action: "open", method: null, user: null, eventType: "door-open" },
      { id: 5, createdAt: isoToday(17, 15), doorName, time: "05:15 PM", date: "Today", action: "lock", method: "App", user: "John Doe", eventType: "door-lock" },
      { id: 6, createdAt: isoToday(17, 20), doorName, time: "05:20 PM", date: "Today", action: "closed", method: null, user: null, eventType: "door-closed" },

      { id: 7, createdAt: isoYesterday(8, 12), doorName, time: "08:12 AM", date: "Yesterday", action: "unlock", method: "App", user: "John Doe", eventType: "door-unlock" },
      { id: 8, createdAt: isoYesterday(8, 15), doorName, time: "08:15 AM", date: "Yesterday", action: "open", method: null, user: null, eventType: "door-open" },

      {
        id: 9,
        createdAt: isoYesterday(9, 22),
        time: "09:22 AM",
        date: "Yesterday",
        action: "Power restored after outage",
        user: "System",
        role: null,
        description: `Power was restored after an outage • ${new Date(isoYesterday(9, 22)).toLocaleDateString()} 09:22`,
        eventType: "power-restored",
      },
      {
        id: 10,
        createdAt: isoYesterday(11, 30),
        time: "11:30 AM",
        date: "Yesterday",
        action: "iButton created",
        user: "John Doe",
        role: "Admin",
        description: "iButton 'Front Door Key' (ID: IBT-483920, Open/Close Only) was created by Admin John Doe • 11:30",
        eventType: "ibutton-created",
      },
      {
        id: 11,
        createdAt: isoYesterday(15, 15),
        time: "03:15 PM",
        date: "Yesterday",
        action: "iButton deleted",
        user: "Jane Smith",
        role: "Full Access",
        description: "iButton 'Garage Key' (ID: IBT-294103, Open/Close Only) was deleted by Jane Smith (Full Access) • 15:15",
        eventType: "ibutton-deleted",
      },
    ]
  }, [doorName])

  const realActivityLogs: ActivityLogEntry[] = useMemo(() => {
    return activityLog.map((log) => {
      const createdAt = new Date(log.createdAt)
      return {
        id: log.id,
        createdAt: log.createdAt,
        doorName: log.doorName,
        time: formatActivityTime(log.createdAt) || log.timeLabel || "",
        date: formatActivityDate(log.createdAt) || log.dateLabel || "",
        action: log.action,
        method: log.method,
        user: log.user,
        role: log.role,
        description: log.description,
        eventType: log.eventType,
      }
    })
  }, [activityLog])

  const activityLogs = realActivityLogs

  const showUserFilter = useMemo(() => {
    return (USER_FILTER_EVENT_TYPES as readonly string[]).includes(eventType)
  }, [eventType])

  const filteredLogs = useMemo(() => {
    if (!canSeeActivityContent) return []

    return activityLogs.filter((log) => {
      if (!withinRange(log.createdAt, timeRange)) return false
      if (eventType !== "all" && log.eventType !== eventType) return false
      if (userFilter !== "all" && log.user !== userFilter) return false
      return true
    })
  }, [activityLogs, canSeeActivityContent, eventType, userFilter, timeRange])

  if (!canAccessActivity) {
    return (
      <div className="flex min-h-screen flex-col pb-20">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className={`${activityTheme.card} border-border p-8 text-center space-y-4 max-w-sm`}>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <LockIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className={`text-sm ${activityTheme.mutedText}`}>Activity log is only available for Admin and Full Access users.</p>
            <Button onClick={() => onNavigate("dashboard")} variant="outline" className="w-full border-border">
              Back to Dashboard
            </Button>
          </Card>
        </div>

        <AppBottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          hasPlan={effectiveHasPlan}
          canAccessActivity={canAccessActivity}
          canAccessScenes={canAccessScenes}
          canAccessSettings={canAccessSettings}
          inactiveTextClassName={activityTheme.bottomNavInactiveText}
        />
      </div>
    )
  }

  if (!effectiveHasPlan) {
    return (
      <div className="flex min-h-screen flex-col pb-20">
        <header className="border-b border-border bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Activity</h1>
            <VisibilityThemeSelector
              themes={ACTIVITY_VISIBILITY_THEMES}
              value={visibilityTheme}
              themeClasses={ACTIVITY_VISIBILITY_THEME_CLASSES}
              onChange={handleVisibilityThemeChange}
              ariaLabel="Activity visibility theme"
            />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className={`${activityTheme.card} border-border p-8 text-center space-y-4 max-w-sm`}>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <LockIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Premium Feature</h2>
            <p className={`text-sm ${activityTheme.mutedText}`}>
              Full activity log history is only available for Premium users. Upgrade now to access complete door activity records.
            </p>
            <Button onClick={() => onNavigate("subscription")} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
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
          hasPlan={effectiveHasPlan}
          canAccessActivity={canAccessActivity}
          canAccessScenes={canAccessScenes}
          canAccessSettings={canAccessSettings}
          inactiveTextClassName={activityTheme.bottomNavInactiveText}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className={`${activityTheme.header} border-b border-border p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("dashboard")} className="text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
          </div>

          <VisibilityThemeSelector
            themes={ACTIVITY_VISIBILITY_THEMES}
            value={visibilityTheme}
            onChange={handleVisibilityThemeChange}
            ariaLabel="Activity visibility theme"
            themeClasses={ACTIVITY_VISIBILITY_THEME_CLASSES}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`flex-none p-4 pb-3 border-b backdrop-blur ${activityTheme.filterBar}`}>
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
                if (!(USER_FILTER_EVENT_TYPES as readonly string[]).includes(value)) setUserFilter("all")
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
          {filteredLogs.map((log, index) => (
            <Card key={`${log.id}-${log.createdAt}-${index}`} className={`${activityTheme.card} border-border p-4`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  {log.description ? (
                    <>
                      <p className="text-sm font-medium text-foreground">{log.action}</p>
                      <p className={`text-xs ${activityTheme.mutedText} mt-1 whitespace-pre-line`}>{log.description}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-foreground">{log.doorName}</p>
                      <p className={`text-xs ${activityTheme.mutedText} mt-1`}>
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
                  <div className={`flex items-center gap-1 text-xs ${activityTheme.mutedText} mb-1`}>
                    <Clock className="h-3 w-3" />
                    {log.time}
                  </div>
                  <p className={`text-xs ${activityTheme.mutedText}`}>{log.date}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AppBottomNav
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        hasPlan={effectiveHasPlan}
        canAccessActivity={canAccessActivity}
        canAccessScenes={canAccessScenes}
        canAccessSettings={canAccessSettings}
        inactiveTextClassName={activityTheme.bottomNavInactiveText}
      />
    </div>
  )
}
