"use client"

import { Home, Activity, SettingsIcon, User, Layers, LockIcon } from "lucide-react"
import type { Screen } from "@/app/page"
import { useAppContext } from "@/lib/app-context"
import { Permissions, type PermissionContext } from "@/lib/permissions"

type Tab = "home" | "activity-log" | "scenes" | "settings" | "profile"

interface AppBottomNavProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void

  // ✅ unified plan flag (trial/premium/subscription)
  hasPlan?: boolean

  // ✅ optional (if missing, we compute them inside)
  canAccessActivity?: boolean
  canAccessScenes?: boolean
  canAccessSettings?: boolean
}

function getActiveTabFromScreen(currentScreen: Screen): Tab {
  const s = String(currentScreen).toLowerCase()

  if (s === "dashboard" || s.includes("dash")) return "home"

  // Activity (incl. subscription/payment flow screens)
  if (
    s === "activity-log" ||
    s.includes("activity") ||
    s.includes("subscription") ||
    s.includes("trial") ||
    s.includes("payment")
  ) {
    return "activity-log"
  }

  if (s === "scenes" || s.includes("scene")) return "scenes"

  if (
    s === "settings" ||
    s.includes("setting") ||
    s.includes("controller") ||
    s.includes("door") ||
    s.includes("ibutton")
  ) {
    return "settings"
  }

  if (s === "profile" || s.includes("profile") || s.includes("login") || s.includes("register") || s.includes("account")) {
    return "profile"
  }

  return "home"
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "auto" })
}

export function AppBottomNav({
  currentScreen,
  onNavigate,
  hasPlan = false,
  canAccessActivity: canAccessActivityProp,
  canAccessScenes: canAccessScenesProp,
  canAccessSettings: canAccessSettingsProp,
}: AppBottomNavProps) {
  const activeTab = getActiveTabFromScreen(currentScreen)

  // ✅ fallback permissions if caller doesn't pass canAccess*
  const { currentUserAccess } = useAppContext()

  const permissionContext: PermissionContext = {
    currentUserAccess,
    hasPlan: hasPlan,
    isTrialActive: false,
    isTrialExpired: false,
  }

  const canAccessActivity =
    typeof canAccessActivityProp === "boolean" ? canAccessActivityProp : Permissions.canAccessActivity(permissionContext)

  const canAccessScenes =
    typeof canAccessScenesProp === "boolean" ? canAccessScenesProp : Permissions.canAccessScenes(permissionContext)

  const canAccessSettings =
    typeof canAccessSettingsProp === "boolean" ? canAccessSettingsProp : Permissions.canAccessSettings(permissionContext)

  const activityLocked = !hasPlan || !canAccessActivity

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around p-4">
        {/* Home */}
        <button
          onClick={() => {
            onNavigate("dashboard")
            scrollTop()
          }}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === "home" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </button>

        {/* Activity */}
        <button
          disabled={!canAccessActivity}
          onClick={() => {
            if (!canAccessActivity) return
            onNavigate(hasPlan ? "activity-log" : "subscription")
            scrollTop()
          }}
          className={`flex flex-col items-center gap-1 transition-colors relative disabled:opacity-50 disabled:pointer-events-none ${
            activeTab === "activity-log" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <Activity className="h-6 w-6" />
            {activityLocked && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
          </div>
          <span className="text-xs">Activity</span>
        </button>

        {/* Scenes */}
        <button
          disabled={!canAccessScenes}
          onClick={() => {
            if (!canAccessScenes) return
            onNavigate("scenes")
            scrollTop()
          }}
          className={`flex flex-col items-center gap-1 transition-colors relative disabled:opacity-50 disabled:pointer-events-none ${
            activeTab === "scenes" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <Layers className="h-6 w-6" />
            {!canAccessScenes && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
          </div>
          <span className="text-xs">Scenes</span>
        </button>

        {/* Settings */}
        <button
          disabled={!canAccessSettings}
          onClick={() => {
            if (!canAccessSettings) return
            onNavigate("settings")
            scrollTop()
          }}
          className={`flex flex-col items-center gap-1 transition-colors relative disabled:opacity-50 disabled:pointer-events-none ${
            activeTab === "settings" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            <SettingsIcon className="h-6 w-6" />
            {!canAccessSettings && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
          </div>
          <span className="text-xs">Settings</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            onNavigate("profile")
            scrollTop()
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
  )
}
