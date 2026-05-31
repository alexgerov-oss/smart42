"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Screen } from "@/app/page"
import { useAppContext } from "@/lib/app-context"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import { AppBottomNav } from "@/components/app-bottom-nav"


const getStatusDotColor = (value: unknown) => {
  const n = Number(value)

  if (!Number.isFinite(n)) {
    return "#ffffff"
  }

  if (n >= 67) {
    return "#ef4444"
  }

  if (n <= 33) {
    return "#22c55e"
  }

  return "#ffffff"
}

const StatusChartDot = (props: any) => {
  const { cx, cy, value, payload } = props

  if (cx == null || cy == null) {
    return null
  }

  const rawValue = value ?? payload?.value ?? payload?.uv ?? payload?.pv
  const color = getStatusDotColor(rawValue)

  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill={color}
      stroke={color}
      strokeWidth={1}
    />
  )
}

interface ChartScreenProps {
  metric: string
  onBack: () => void
  onNavigate: (screen: Screen) => void

  // ✅ plan/trial flag from page.tsx
  hasPlan: boolean
  currentScreen: Screen
}

type ChartDataPoint = {
  name: string
  value: number
  weekDayIndex: number | null
}

type ChartVisibilityTheme = "dark" | "soft" | "day"

const CHART_RANGE_BUTTON_CLASSES: Record<ChartVisibilityTheme, string> = {
  dark: "border-border !bg-[#263044] text-foreground hover:!bg-[#2d374c]",
  soft: "border-white/15 !bg-[#30394d] text-white hover:!bg-[#39445c]",
  day: "border-white/20 !bg-[#3a455d] text-white hover:!bg-[#44516b]",
}

// ✅ deterministic “fake data” (no Math.random)
function getSeedFromString(input: string) {
  let seed = 0
  for (let i = 0; i < input.length; i++) seed = (seed + input.charCodeAt(i) * (i + 1)) % 100000
  return seed
}

const formatXAxisTick = (value: unknown) => {
  const text = String(value)
  const lower = text.toLowerCase()
  const numberOnly = text.replace(/[^0-9]/g, "")

  const weekDays: Record<string, string> = {
    "1": "Sun",
    "2": "Mon",
    "3": "Tue",
    "4": "Wed",
    "5": "Thu",
    "6": "Fri",
    "7": "Sat",
  }

  if (lower.startsWith("day") || lower.startsWith("ден")) {
    return weekDays[numberOnly] ?? text
  }

  if (lower.startsWith("month") || lower.startsWith("месец")) {
    return numberOnly || text
  }

  return text
}

const formatChartDateLabel = (date: Date) => {
  const day = date.getDate()
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
  const year = date.getFullYear()

  return `${day} ${month} ${year}`
}

const getCurrentWeekDates = () => {
  const today = new Date()
  const start = new Date(today)

  start.setHours(0, 0, 0, 0)
  start.setDate(today.getDate() - today.getDay())

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

const getChartMonthLabel = (date: Date) => date.toLocaleString("en-US", { month: "long" })

export default function ChartScreen({
  metric,
  onBack,
  onNavigate,
  hasPlan,
  currentScreen,
}: ChartScreenProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("day")
  const [selectedWeekDay, setSelectedWeekDay] = useState<number | null>(null)
  const [visibilityTheme, setVisibilityTheme] = useState<ChartVisibilityTheme>(() => {
    if (typeof window === "undefined") return "soft"
    const savedTheme = window.localStorage.getItem("homeVisibilityTheme")
    return savedTheme === "dark" || savedTheme === "day" ? savedTheme : "soft"
  })
  const { currentUserAccess } = useAppContext()

  useEffect(() => {
    const syncVisibilityTheme = () => {
      const savedTheme = window.localStorage.getItem("homeVisibilityTheme")
      setVisibilityTheme(savedTheme === "dark" || savedTheme === "day" ? savedTheme : "soft")
    }

    window.addEventListener("focus", syncVisibilityTheme)
    window.addEventListener("storage", syncVisibilityTheme)

    return () => {
      window.removeEventListener("focus", syncVisibilityTheme)
      window.removeEventListener("storage", syncVisibilityTheme)
    }
  }, [])

  const inactiveRangeButtonClass = CHART_RANGE_BUTTON_CLASSES[visibilityTheme]

  const permissionContext: PermissionContext = {
    currentUserAccess,
    hasPlan,
  }

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)

  const today = useMemo(() => new Date(), [])
  const todayLabel = useMemo(() => formatChartDateLabel(today), [today])
  const weekDates = useMemo(() => getCurrentWeekDates(), [])
  const weekMonthLabel = useMemo(() => getChartMonthLabel(today), [today])

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
    const isWeekDayDetail = timeRange === "week" && selectedWeekDay !== null
    const dataPoints = isWeekDayDetail ? 24 : timeRange === "day" ? 24 : timeRange === "week" ? 7 : timeRange === "month" ? 31 : 12

    const seed = getSeedFromString(`${metric}:${timeRange}:${selectedWeekDay ?? "all"}`)
    const base = 30
    const spread = 50

    return Array.from({ length: dataPoints }, (_, i): ChartDataPoint => {
      const name =
        isWeekDayDetail
          ? `${i}:00`
          : timeRange === "day"
            ? `${i}:00`
            : timeRange === "week"
              ? `Day ${i + 1}`
            : timeRange === "month"
              ? `${i + 1}`
              : `Month ${i + 1}`

      const value = base + ((seed + i * 17 + (i % 3) * 11) % spread)
      return { name, value, weekDayIndex: timeRange === "week" && !isWeekDayDetail ? i + 1 : null }
    })
  }, [metric, timeRange, selectedWeekDay])

  const openWeekDay = (weekDayIndex: unknown) => {
    if (timeRange === "week" && selectedWeekDay === null && typeof weekDayIndex === "number") {
      setSelectedWeekDay(weekDayIndex)
    }
  }

  const renderChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) {
      return null
    }

    const point = payload[0]?.payload
    const weekDayIndex = point?.weekDayIndex
    const value = payload[0]?.value

    if (timeRange === "week" && selectedWeekDay === null && typeof weekDayIndex === "number") {
      return (
        <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
          <button
            type="button"
            className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            onClick={() => openWeekDay(weekDayIndex)}
          >
            OPEN
          </button>
          <p className="mt-2 text-xs text-foreground">
            value: {value}
            {getMetricUnit()}
          </p>
        </div>
      )
    }

    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-lg">
        <p className="text-xs text-foreground">{String(label)}</p>
        <p className="text-xs text-foreground">
          value: {value}
          {getMetricUnit()}
        </p>
      </div>
    )
  }

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
              onClick={() => {
                setTimeRange(range)
                setSelectedWeekDay(null)
              }}
              variant={timeRange === range ? "default" : "outline"}
              className={`flex-1 capitalize ${
                timeRange === range ? "bg-primary text-primary-foreground" : inactiveRangeButtonClass
              }`}
            >
              {range}
            </Button>
          ))}
        </div>

        {timeRange === "week" && selectedWeekDay !== null ? (
          <Button
            onClick={() => setSelectedWeekDay(null)}
            variant="outline"
            className="w-full border-border text-foreground"
          >
            Back to Week
          </Button>
        ) : null}

        <Card className="bg-card border-border p-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ left: -8, right: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="#ffffff"
                style={{ fontSize: "12px" }}
                interval={timeRange === "year" ? 0 : "preserveEnd"}
                tickFormatter={formatXAxisTick}
              />
              <YAxis stroke="#ffffff" style={{ fontSize: "12px" }} unit={getMetricUnit()} />
              <Tooltip content={renderChartTooltip} wrapperStyle={{ pointerEvents: "auto" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={<StatusChartDot />}
                activeDot={{
                  r: 8,
                  fill: "transparent",
                  stroke: "transparent",
                  onClick: (event: any, point: any) => {
                    openWeekDay(point?.payload?.weekDayIndex)
                  },
                }}
                onClick={(point: any) => {
                  openWeekDay(point?.payload?.weekDayIndex)
                }}
              />
            </LineChart>
          </ResponsiveContainer>

          {timeRange === "day" ? (
            <p className="-mt-4 text-center text-xs font-medium text-muted-foreground">{todayLabel}</p>
          ) : null}

          {timeRange === "week" && selectedWeekDay !== null ? (
            <p className="-mt-4 text-center text-xs font-medium text-muted-foreground">
              {formatChartDateLabel(weekDates[selectedWeekDay - 1] ?? today)}
            </p>
          ) : null}

          {timeRange === "week" && selectedWeekDay === null ? (
            <div className="-mt-4 space-y-0 pl-[52px] pr-[18px]">
              <div className="flex justify-between text-center text-xs text-muted-foreground">
                {weekDates.map((date) => (
                  <span key={date.toISOString()} className="w-6 text-center">{date.getDate()}</span>
                ))}
              </div>
              <p className="text-center text-xs font-medium text-muted-foreground">{weekMonthLabel}</p>
            </div>
          ) : null}
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
