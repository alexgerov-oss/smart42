"use client"

import { Activity, Home, Layers, LockIcon, SettingsIcon, User } from "lucide-react"
import type { Screen } from "@/app/page"
import { cn } from "@/lib/utils"

type Props = {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
  isPremium: boolean
  canAccessActivity: boolean
  canAccessScenes: boolean
  canAccessSettings: boolean
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "auto" })
}

export function AppBottomNav({
  currentScreen,
  onNavigate,
  isPremium,
  canAccessActivity,
  canAccessScenes,
  canAccessSettings,
}: Props) {
  const activeTab =
    currentScreen === "dashboard"
      ? "home"
      : currentScreen === "activity-log"
        ? "activity"
        : currentScreen === "scenes"
          ? "scenes"
          : currentScreen === "settings"
            ? "settings"
            : currentScreen === "profile"
              ? "profile"
              : "home"

  const tabClass = (active: boolean) =>
    cn("flex flex-col items-center gap-1 transition-colors", active ? "text-primary" : "text-muted-foreground")

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around p-4">
        {/* Home */}
        <button
          onClick={() => {
            onNavigate("dashboard")
            scrollToTop()
          }}
          className={tabClass(activeTab === "home")}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </button>

        {/* Activity */}
        <button
          onClick={() => {
            if (!canAccessActivity) return
            onNavigate(isPremium ? "activity-log" : "subscription")
            scrollToTop()
          }}
          className={cn(tabClass(activeTab === "activity"), "relative")}
        >
          <div className="relative">
            <Activity className="h-6 w-6" />
            {(!isPremium || !canAccessActivity) && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
          </div>
          <span className="text-xs">Activity</span>
        </button>

        {/* Scenes */}
        <button
          onClick={() => {
            if (!canAccessScenes) return
            onNavigate("scenes")
            scrollToTop()
          }}
          className={cn(tabClass(activeTab === "scenes"), "relative")}
        >
          <div className="relative">
            <Layers className="h-6 w-6" />
            {!canAccessScenes && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
          </div>
          <span className="text-xs">Scenes</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            if (!canAccessSettings) return
            onNavigate("settings")
            scrollToTop()
          }}
          className={cn(tabClass(activeTab === "settings"), "relative")}
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
            scrollToTop()
          }}
          className={tabClass(activeTab === "profile")}
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </div>
  )
}
