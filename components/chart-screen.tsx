"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Screen } from "@/app/page"
import { useAppContext } from "@/lib/app-context"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import { AppBottomNav } from "@/components/app-bottom-nav"

interface ChartScreenProps {
  metric: string
  onBack: () => void
  onNavigate: (screen: Screen) => void

  // ✅ plan/trial flag from page.tsx
  hasPlan: boolean

  // kept for permissions context
  isOnTrial: boolean
  remainingTrialDays: number | null

  currentScreen: Screen
}

// ✅ deterministic “fake data” (no Math.random)
function getSeedFromString(input: string) {
  let seed = 0
  for (let i = 0; i < input.length; i++) seed = (seed + input.charCodeAt(i) * (i + 1)) % 100000
  return seed
}

export default function ChartScreen({
  metric,
  onBack,
  onNavigate,
  hasPlan,
  isOnTrial,
  remainingTrialDays,
  currentScreen,
}: ChartScreenProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day")
  const { currentUserAccess } = useAppContext()

  const isTrialExpired = remainingTrialDays !== null && remainingTrialDays === 0

  const permissionContext: PermissionContext = {
    currentUserAccess,
    hasPlan: hasPlan,
    isTrialActive: isOnTrial,
    isTrialExpired,
  }

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)

  const getMetricTitle = () => {
    const titles: Record<string, string> = {
      wifi: "WiFi Signal Strength",
      battery: "Battery",
      "cpu-temp": "CPU Temp",
      "cpu-load": "CPU Load",
      latency: "Latency",
      "power-drops": "Power Drops",
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

  const data = useMemo(() => {
    const dataPoints = timeRange === "day" ? 24 : timeRange === "week" ? 7 : timeRange === "month" ? 30 : 12

    const seed = getSeedFromString(`${metric}:${timeRange}`)
    const base = 30
    const spread = 50

    return Array.from({ length: dataPoints }, (_, i) => {
      const name =
        timeRange === "day"
          ? `${i}:00`
          : timeRange === "week"
            ? `Day ${i + 1}`
            : timeRange === "month"
              ? `${i + 1}`
              : `Month ${i + 1}`

      const value = base + ((seed + i * 17 + (i % 3) * 11) % spread)
      return { name, value }
    })
  }, [metric, timeRange])

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

      <AppBottomNav
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        hasPlan={hasPlan}
        canAccessActivity={canAccessActivity}
        canAccessScenes={canAccessScenes}
        canAccessSettings={canAccessSettings}
      />
    </div>
  )
}
