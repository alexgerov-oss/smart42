"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Activity, Settings, User, Lock, Layers } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Screen } from "@/app/page"
import { useAppContext } from "@/lib/app-context"
import { useToast } from "@/hooks/use-toast"

interface ChartScreenProps {
  metric: string
  onBack: () => void
  onNavigate: (screen: Screen) => void
  isPremium: boolean
  currentScreen: Screen
}

export default function ChartScreen({ metric, onBack, onNavigate, isPremium, currentScreen }: ChartScreenProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day")

  const { currentUserAccess } = useAppContext()
  const canAccessScenes = currentUserAccess === "admin" || currentUserAccess === "full"
  const canAccessSettings = currentUserAccess === "admin" || currentUserAccess === "full"
  const { toast } = useToast()

  const getMetricTitle = () => {
    const titles: Record<string, string> = {
      wifi: "WiFi Signal Strength",
      battery: "%",
      "cpu-temp": "°C",
      "cpu-load": "%",
      latency: "ms",
      "power-drops": "count",
    }
    return titles[metric] || "Metric"
  }

  const getMetricUnit = () => {
    const units: Record<string, string> = {
      wifi: "dBm",
      battery: "%",
      "cpu-temp": "°C",
      "cpu-load": "%",
      latency: "ms",
      "power-drops": "count",
    }
    return units[metric] || ""
  }

  const generateData = () => {
    const dataPoints = timeRange === "day" ? 24 : timeRange === "week" ? 7 : timeRange === "month" ? 30 : 12
    return Array.from({ length: dataPoints }, (_, i) => ({
      name:
        timeRange === "day"
          ? `${i}:00`
          : timeRange === "week"
            ? `Day ${i + 1}`
            : timeRange === "month"
              ? `${i + 1}`
              : `Month ${i + 1}`,
      value: Math.floor(Math.random() * 50) + 30,
    }))
  }

  const data = generateData()

  const getActiveTab = () => {
    if (currentScreen === "dashboard") return "home"
    if (currentScreen === "activity-log") return "activity-log"
    if (currentScreen === "scenes") return "scenes"
    if (currentScreen === "settings") return "settings"
    if (currentScreen === "profile") return "profile"
    return "home"
  }

  const activeTab = getActiveTab()

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{getMetricTitle()}</h1>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4">
        <div className="flex gap-2">
          {(["day", "week", "month", "year"] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? "default" : "outline"}
              className={`flex-1 capitalize ${
                timeRange === range ? "bg-primary text-primary-foreground" : "border-border text-foreground"
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        <Card className="bg-card border-border p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} />
              <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: "12px" }} unit={getMetricUnit()} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-card border-border p-4 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Statistics</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-background p-3 text-center">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-bold text-foreground">
                {Math.floor(data.reduce((acc, d) => acc + d.value, 0) / data.length)}
                {getMetricUnit()}
              </p>
            </div>
            <div className="rounded-lg bg-background p-3 text-center">
              <p className="text-xs text-muted-foreground">Min</p>
              <p className="text-lg font-bold text-accent">
                {Math.min(...data.map((d) => d.value))}
                {getMetricUnit()}
              </p>
            </div>
            <div className="rounded-lg bg-background p-3 text-center">
              <p className="text-xs text-muted-foreground">Max</p>
              <p className="text-lg font-bold text-destructive">
                {Math.max(...data.map((d) => d.value))}
                {getMetricUnit()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around p-4">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "home" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={() => {
              if (isPremium) {
                onNavigate("activity-log")
              } else {
                onNavigate("subscription")
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "activity-log" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Activity className="h-6 w-6" />
              {!isPremium && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
            </div>
            <span className="text-xs">Activity</span>
          </button>

          <button
            onClick={() => {
              if (canAccessScenes) {
                onNavigate("scenes")
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "scenes" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Layers className="h-6 w-6" />
              {!canAccessScenes && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
            </div>
            <span className="text-xs">Scenes</span>
          </button>

          <button
            onClick={() => {
              if (canAccessSettings) {
                onNavigate("settings")
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "settings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Settings className="h-6 w-6" />
              {!canAccessSettings && <Lock className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
            </div>
            <span className="text-xs">Settings</span>
          </button>

          <button
            onClick={() => onNavigate("profile")}
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
