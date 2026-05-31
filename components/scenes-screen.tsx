"use client"

import { useState, type KeyboardEvent } from "react"
import { newId } from "@/lib/id"
import { Card } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, LockIcon, SquarePen } from "lucide-react"
import type { Screen } from "@/app/page"
import { CircularTimePicker } from "@/components/ui/circular-time-picker"
import { useAppContext } from "@/lib/app-context"
import { useToast } from "@/components/ui/use-toast"
import { ModalSelector } from "@/components/ui/modal-selector"
import type { Scene as CoreScene, WhenCondition as CoreWhenCondition } from "@/lib/core/types"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import { AppBottomNav } from "@/components/app-bottom-nav"
import { VisibilityThemeSelector } from "@/components/visibility-theme-selector"

const UI_WHEN_TYPES = [
  "wifi",
  "battery",
  "cpu-temp",
  "cpu-load",
  "power-drops",
  "latency",
  "door-lock",
  "door-unlock",
  "door-open",
  "door-closed",
  "user-ibutton-created",
  "user-ibutton-deleted",
  "scene-created",
  "scene-edited",
  "scene-deleted",
  "quick-controls-changed",
] as const

type UiWhenType = (typeof UI_WHEN_TYPES)[number]
function isUiWhenType(value: string): value is UiWhenType {
  return (UI_WHEN_TYPES as readonly string[]).includes(value)
}

const TIME_WINDOW_SUPPORTED_TYPES = [
  "door-lock",
  "door-unlock",
  "door-open",
  "door-closed",
  "user-ibutton-created",
  "user-ibutton-deleted",
  "scene-created",
  "scene-edited",
  "scene-deleted",
  "quick-controls-changed",
] as const satisfies readonly UiWhenType[]

const OPERATOR_VALUES = ["<", ">", "="] as const
type Operator = (typeof OPERATOR_VALUES)[number]
function isOperator(value: string): value is Operator {
  return (OPERATOR_VALUES as readonly string[]).includes(value)
}

const TIME_WINDOW_VALUES = ["between", "always"] as const
type TimeWindow = (typeof TIME_WINDOW_VALUES)[number]
function isTimeWindow(value: string): value is TimeWindow {
  return (TIME_WINDOW_VALUES as readonly string[]).includes(value)
}

const THEN_ACTION_VALUES = ["push", "email", "restart"] as const
type ThenActionType = (typeof THEN_ACTION_VALUES)[number]
function isThenActionType(value: string): value is ThenActionType {
  return (THEN_ACTION_VALUES as readonly string[]).includes(value)
}

type ThenAction = {
  type: ThenActionType
  customText?: string
}

interface WhenCondition {
  type: UiWhenType
  operator?: Operator
  value?: number
  timeWindow?: TimeWindow
  timeStartHour?: string
  timeStartMinute?: string
  timeStartPeriod?: "AM" | "PM"
  timeEndHour?: string
  timeEndMinute?: string
  timeEndPeriod?: "AM" | "PM"
}

/**
 * Разширение над CoreWhenCondition за полета които в UI реално използваме.
 * (Core типовете ти са по-тесни, затова държим Ext отделно.)
 */
type DoorEvent = "unlock" | "closed" | "lock" | "open"
type CoreWhenConditionExt = Omit<CoreWhenCondition, "type"> & {
  type: string
  doorEvent?: DoorEvent
  timeStart?: string
  timeEnd?: string
  timeWindow?: TimeWindow
  operator?: Operator
  value?: number
}

interface ScenesScreenProps {
  onNavigate: (screen: Screen) => void
  doorName: string

  // ✅ единственото важно: plan flag
  hasPlan: boolean

  currentScreen: Screen
}

type ScenesVisibilityTheme = "dark" | "soft" | "day"

const SCENES_VISIBILITY_THEMES: ScenesVisibilityTheme[] = ["dark", "soft", "day"]

const SCENES_VISIBILITY_THEME_CLASSES: Record<
  ScenesVisibilityTheme,
  {
    card: string
    header: string
    tile: string
    mutedText: string
    bottomNavInactiveText: string
    swatch: string
  }
> = {
  dark: {
    card: "bg-card",
    header: "bg-card",
    tile: "bg-background",
    mutedText: "text-muted-foreground",
    bottomNavInactiveText: "text-muted-foreground",
    swatch: "bg-black",
  },
  soft: {
    card: "bg-[#232b3a]",
    header: "bg-[#232b3a]",
    tile: "bg-[#151b27]",
    mutedText: "text-gray-300",
    bottomNavInactiveText: "text-gray-300",
    swatch: "bg-[linear-gradient(135deg,#111827_0%,#111827_50%,#ffffff_50%,#ffffff_100%)]",
  },
  day: {
    card: "bg-[#2d374c]",
    header: "bg-[#2d374c]",
    tile: "bg-[#151d2b]",
    mutedText: "text-gray-200",
    bottomNavInactiveText: "text-gray-100",
    swatch: "bg-white",
  },
}

// ---- Helpers ----
const getUnit = (type: string): string => {
  const unitMap: Record<string, string> = {
    wifi: "dBm",
    battery: "%",
    "cpu-temp": "°C",
    "cpu-load": "%",
    "power-drops": "count",
    latency: "ms",
  }
  return unitMap[type] || ""
}

function to12HourParts(h24: number, minute: number): { hour: string; minute: string; period: "AM" | "PM" } {
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM"
  let hourNum = h24 % 12
  if (hourNum === 0) hourNum = 12
  return { hour: String(hourNum), minute: String(minute).padStart(2, "0"), period }
}

function parseHHMM(time?: string): { h: number; m: number } | null {
  if (!time) return null
  const parts = time.split(":")
  if (parts.length !== 2) return null
  const h = Number.parseInt(parts[0] ?? "", 10)
  const m = Number.parseInt(parts[1] ?? "", 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return { h, m }
}

function formatBetweenFromCore(timeStart?: string, timeEnd?: string): string {
  const start = parseHHMM(timeStart)
  const end = parseHHMM(timeEnd)
  if (!start || !end) return ""
  const s = to12HourParts(start.h, start.m)
  const e = to12HourParts(end.h, end.m)
  return ` (between ${s.hour}:${s.minute} ${s.period}–${e.hour}:${e.minute} ${e.period})`
}

/**
 * UI -> Core map
 */
function uiTypeToCoreType(uiType: UiWhenType): { coreType: string; doorEvent?: DoorEvent } {
  switch (uiType) {
    case "door-lock":
      return { coreType: "door-lock", doorEvent: "lock" }
    case "door-open":
      return { coreType: "door-open", doorEvent: "open" }
    case "door-unlock":
      return { coreType: "door-open", doorEvent: "unlock" }
    case "door-closed":
      return { coreType: "door-open", doorEvent: "closed" }

    case "user-ibutton-created":
      return { coreType: "ibutton-created" }
    case "user-ibutton-deleted":
      return { coreType: "ibutton-deleted" }
    case "quick-controls-changed":
      return { coreType: "quick-control-changed" }

    default:
      return { coreType: uiType }
  }
}

/**
 * Core -> UI map
 */
function coreTypeToUiType(cond: CoreWhenCondition): UiWhenType {
  const c = cond as unknown as CoreWhenConditionExt

  if (c.type === "door-open") {
    if (c.doorEvent === "unlock") return "door-unlock"
    if (c.doorEvent === "closed") return "door-closed"
    return "door-open"
  }

  if (c.type === "door-lock") return "door-lock"
  if (c.type === "ibutton-created") return "user-ibutton-created"
  if (c.type === "ibutton-deleted") return "user-ibutton-deleted"
  if (c.type === "quick-control-changed") return "quick-controls-changed"

  if (isUiWhenType(c.type)) return c.type
  return "wifi"
}

function coreWhenToUi(cond: CoreWhenCondition): WhenCondition {
  const c = cond as unknown as CoreWhenConditionExt
  const uiType = coreTypeToUiType(cond)

  const ui: WhenCondition = { type: uiType }

  if (typeof c.operator === "string" && isOperator(c.operator)) ui.operator = c.operator
  if (typeof c.value === "number") ui.value = c.value
  if (typeof c.timeWindow === "string" && isTimeWindow(c.timeWindow)) ui.timeWindow = c.timeWindow

  if (ui.timeWindow === "between") {
    const start = parseHHMM(c.timeStart)
    const end = parseHHMM(c.timeEnd)

    if (start) {
      const s = to12HourParts(start.h, start.m)
      ui.timeStartHour = s.hour
      ui.timeStartMinute = s.minute
      ui.timeStartPeriod = s.period
    }
    if (end) {
      const e = to12HourParts(end.h, end.m)
      ui.timeEndHour = e.hour
      ui.timeEndMinute = e.minute
      ui.timeEndPeriod = e.period
    }
  }

  return ui
}

const formatSceneDescription = (scene: CoreScene): string => {
  const conditions = scene.whenConditions
    .map((cond) => {
      const c = cond as unknown as CoreWhenConditionExt
      const timeInfo = c.timeWindow === "between" ? formatBetweenFromCore(c.timeStart, c.timeEnd) : ""

      if (c.type === "door-lock") return `Door locked${timeInfo}`

      if (c.type === "door-open") {
        if (c.doorEvent === "unlock") return `Door unlocked${timeInfo}`
        if (c.doorEvent === "closed") return `Door closed${timeInfo}`
        return `Door opened${timeInfo}`
      }

      if (c.type === "ibutton-created") return `User/iButton created${timeInfo}`
      if (c.type === "ibutton-deleted") return `User/iButton deleted${timeInfo}`
      if (c.type === "scene-created") return `Scene created${timeInfo}`
      if (c.type === "scene-edited") return `Scene edited${timeInfo}`
      if (c.type === "scene-deleted") return `Scene deleted${timeInfo}`
      if (c.type === "quick-control-changed") return `Quick controls changed${timeInfo}`

      if (c.type === "power-drops") return `Power drops > ${c.value ?? 0}`

      const typeMap: Record<string, string> = {
        wifi: "WiFi",
        battery: "Battery",
        "cpu-temp": "CPU temperature",
        "cpu-load": "CPU load",
        latency: "Latency",
      }

      const name = typeMap[c.type] || c.type
      if (!c.operator || typeof c.value !== "number") return `${name}`
      return `${name} ${c.operator} ${c.value}${getUnit(c.type)}`
    })
    .join(" and ")

  const actionType = (scene.thenAction as unknown as { type?: string }).type
  const action =
    actionType === "push" ? "Send push notification" : actionType === "email" ? "Send email" : "Restart controller"

  return `IF ${conditions} → ${action}`
}

export default function ScenesScreen({ onNavigate, doorName: _doorName, hasPlan, currentScreen }: ScenesScreenProps) {
  const [isCreatingScene, setIsCreatingScene] = useState(false)
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null)
  const [sceneName, setSceneName] = useState("")
  const [sceneNameError, setSceneNameError] = useState("")
  const [whenConditions, setWhenConditions] = useState<WhenCondition[]>([{ type: "wifi", operator: "<" }])
  const [thenAction, setThenAction] = useState<ThenAction>({ type: "push", customText: "" })
  const [visibilityTheme, setVisibilityTheme] = useState<ScenesVisibilityTheme>(() => {
    if (typeof window === "undefined") return "soft"
    const savedTheme = window.localStorage.getItem("homeVisibilityTheme")
    return savedTheme === "dark" || savedTheme === "day" ? savedTheme : "soft"
  })

  const scenesTheme = SCENES_VISIBILITY_THEME_CLASSES[visibilityTheme]
  const scenesFieldBorder =
    visibilityTheme === "dark" ? "!border-gray-600" : visibilityTheme === "soft" ? "!border-gray-500" : "!border-gray-400"
  const scenesSelectChevron =
    visibilityTheme === "dark"
      ? "[&>svg]:!text-gray-400 [&>svg]:!opacity-100"
      : visibilityTheme === "soft"
        ? "[&>svg]:!text-gray-300 [&>svg]:!opacity-100"
        : "[&>svg]:!text-gray-200 [&>svg]:!opacity-100"
  const scenesFieldBackground =
    visibilityTheme === "dark" ? "!bg-card" : visibilityTheme === "soft" ? "!bg-[#232b3a]" : "!bg-[#2d374c]"

  const handleVisibilityThemeChange = (theme: ScenesVisibilityTheme) => {
    setVisibilityTheme(theme)
    window.localStorage.setItem("homeVisibilityTheme", theme)
  }

  const { toast } = useToast()

  const { currentUserAccess,
    logActivity, scenes, setScenes, getEntityName, setEntityName, isFullAccessUserActivated } = useAppContext()

  const permissionContext: PermissionContext = {
    currentUserAccess,
    hasPlan,
  }

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)

  const visibleScenes = scenes.filter((scene) => {
    if (currentUserAccess === "admin") return true
    if (currentUserAccess === "full") return scene.createdBy === "full"
    return false
  })

  const handleAddCondition = () => setWhenConditions((prev) => [...prev, { type: "wifi", operator: "<" }])

  const handleUpdateCondition = (index: number, updates: Partial<WhenCondition>) => {
    setWhenConditions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const handleRemoveCondition = (index: number) => setWhenConditions((prev) => prev.filter((_, i) => i !== index))

  const handleSceneInputEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return

    event.preventDefault()

    const fields = Array.from(document.querySelectorAll<HTMLElement>("[data-scene-input-order]")).filter(
      (field) => !field.hasAttribute("disabled"),
    )

    const currentIndex = fields.indexOf(event.currentTarget)
    const nextField = fields[currentIndex + 1]

    if (nextField) nextField.focus()
    else event.currentTarget.blur()
  }

  const handleCancelEdit = () => {
    setIsCreatingScene(false)
    setEditingSceneId(null)
    setSceneName("")
    setSceneNameError("")
    setWhenConditions([{ type: "wifi", operator: "<" }])
    setThenAction({ type: "push", customText: "" })
  }

  const getActivityActorLabel = () => {
    if (currentUserAccess === "admin") return "Admin"
    if (currentUserAccess === "full") return "Full Access user"
    return "Open / Close Only user"
  }

  const logSceneActivity = (
    action: string,
    eventType: "scene-created" | "scene-edited" | "scene-deleted",
    description: string,
  ) => {
    const actor = getActivityActorLabel()

    logActivity({
      createdAt: new Date().toISOString(),
      action,
      eventType,
      user: actor,
      role: currentUserAccess,
      method: "Scenes",
      description: `${description} by ${actor}`,
    })
  }

  const handleSaveScene = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return

    if (!sceneName.trim()) {
      setSceneNameError("Scene name is required")
      return
    }

    if (whenConditions.length === 0) {
      toast({ title: "No conditions set", description: "Please add at least one condition.", variant: "destructive" })
      return
    }

    const sceneId = editingSceneId ?? newId("scene")

    const adaptedWhenConditions: CoreWhenConditionExt[] = whenConditions.map((cond) => {
      const { coreType, doorEvent } = uiTypeToCoreType(cond.type)

      const adapted: CoreWhenConditionExt = {
        type: coreType,
        operator: cond.type === "power-drops" ? ">" : cond.operator,
        value: cond.value,
        timeWindow: cond.timeWindow,
      }

      if (doorEvent) adapted.doorEvent = doorEvent

      if (cond.timeWindow === "between" && cond.timeStartHour) {
        const startHour = Number.parseInt(cond.timeStartHour, 10)
        const startMinute = Number.parseInt(cond.timeStartMinute || "00", 10)
        const startPeriod = cond.timeStartPeriod || "AM"

        const endHour = Number.parseInt(cond.timeEndHour || "11", 10)
        const endMinute = Number.parseInt(cond.timeEndMinute || "59", 10)
        const endPeriod = cond.timeEndPeriod || "PM"

        let startHour24 = startHour
        if (startPeriod === "PM" && startHour !== 12) startHour24 += 12
        if (startPeriod === "AM" && startHour === 12) startHour24 = 0

        let endHour24 = endHour
        if (endPeriod === "PM" && endHour !== 12) endHour24 += 12
        if (endPeriod === "AM" && endHour === 12) endHour24 = 0

        adapted.timeStart = `${String(startHour24).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`
        adapted.timeEnd = `${String(endHour24).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`
      }

      return adapted
    })

    const scene: CoreScene = {
      id: sceneId,
      name: sceneName,
      active: true,
      whenConditions: adaptedWhenConditions as unknown as CoreScene["whenConditions"],
      thenAction: thenAction as unknown as CoreScene["thenAction"],
      createdBy: currentUserAccess,
    }

    setEntityName("scenes", sceneId, sceneName)

    if (editingSceneId) {
      setScenes(scenes.map((s) => (s.id === editingSceneId ? scene : s)))
      logSceneActivity("Scene edited", "scene-edited", `Scene "${sceneName}" was edited`)
    } else {
      setScenes([...scenes, scene])
      logSceneActivity("Scene created", "scene-created", `Scene "${sceneName}" was created`)
    }

    handleCancelEdit()
  }

  const handleEditScene = (scene: CoreScene) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    if (currentUserAccess === "full" && scene.createdBy !== "full") {
      toast({ title: "Access Restricted", description: "You can only edit scenes created by you.", variant: "default" })
      return
    }
    setEditingSceneId(scene.id)
    setSceneName(scene.name)
    setWhenConditions(scene.whenConditions.map(coreWhenToUi))
    setThenAction(scene.thenAction as unknown as ThenAction)
    setIsCreatingScene(true)
  }

  const handleToggleScene = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    const scene = scenes.find((s) => s.id === id)
    if (scene && currentUserAccess === "full" && scene.createdBy !== "full") {
      toast({ title: "Access Restricted", description: "You can only toggle scenes created by you.", variant: "default" })
      return
    }
    setScenes(scenes.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }

  const handleDeleteScene = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    const scene = scenes.find((s) => s.id === id)
    if (scene && currentUserAccess === "full" && scene.createdBy !== "full") {
      toast({ title: "Access Restricted", description: "You can only delete scenes created by you.", variant: "default" })
      return
    }
    setScenes(scenes.filter((s) => s.id !== id))
    if (scene) {
      logSceneActivity("Scene deleted", "scene-deleted", `Scene "${scene.name}" was deleted`)
    }
  }

  const isFreeAdmin = currentUserAccess === "admin" && !hasPlan
  const canCreateScene = isFreeAdmin ? scenes.length === 0 : true

  const handleStartCreatingScene = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    if (isFreeAdmin && scenes.length >= 1) {
      toast({ title: "Upgrade Required", description: "Upgrade to create more scenes.", variant: "destructive" })
      return
    }
    setIsCreatingScene(true)
  }

  if (!canAccessScenes) {
    return (
      <div className="flex min-h-screen flex-col pb-20">
        <div className={`${scenesTheme.header} border-b border-border p-4`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => onNavigate("dashboard")} className="text-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold text-foreground">Scenes</h1>
            </div>

            <VisibilityThemeSelector
              themes={SCENES_VISIBILITY_THEMES}
              value={visibilityTheme}
              onChange={handleVisibilityThemeChange}
              ariaLabel="Scenes visibility theme"
              themeClasses={SCENES_VISIBILITY_THEME_CLASSES}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className={`${scenesTheme.card} border-border p-8 text-center space-y-4 max-w-sm`}>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <LockIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
            <p className={`text-sm ${scenesTheme.mutedText}`}>Scenes are available for Full access and Admin users only.</p>
            <Button onClick={() => onNavigate("dashboard")} variant="outline" className="w-full border-border">
              Back to Dashboard
            </Button>
          </Card>
        </div>

        <AppBottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
          hasPlan={hasPlan}
          canAccessActivity={canAccessActivity}
          canAccessScenes={canAccessScenes}
          canAccessSettings={canAccessSettings}
          inactiveTextClassName={scenesTheme.bottomNavInactiveText}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className={`${scenesTheme.header} border-b border-border p-4`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("dashboard")} className="text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Scenes</h1>
          </div>

          <VisibilityThemeSelector
            themes={SCENES_VISIBILITY_THEMES}
            value={visibilityTheme}
            onChange={handleVisibilityThemeChange}
            ariaLabel="Scenes visibility theme"
            themeClasses={SCENES_VISIBILITY_THEME_CLASSES}
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4">
        {!isCreatingScene && (
          <div className="space-y-2">
            <Button onClick={handleStartCreatingScene} className="w-full flex items-center gap-2" disabled={!canCreateScene}>
              {!canCreateScene && <LockIcon className="h-4 w-4" />}
              <Plus className="h-4 w-4" />
              Add Scene
            </Button>

            {isFreeAdmin && scenes.length >= 1 && <p className={`text-sm ${scenesTheme.mutedText}`}>Upgrade to create more scenes.</p>}

            {visibleScenes.map((scene) => (
              <Card key={scene.id} className={`${scenesTheme.card} border-border`}>
                <div className="px-4 py-0 space-y-0 -my-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold leading-tight text-foreground">{getEntityName("scenes", scene.id, scene.name)}</h3>
                      <p className={`text-xs ${scenesTheme.mutedText} leading-relaxed tracking-wide mt-0`}>{formatSceneDescription(scene)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={buttonVariants({ variant: "ghost", size: "sm" })}>
                        <Switch
                          checked={scene.active}
                          onCheckedChange={() => handleToggleScene(scene.id)}
                          className="data-[state=unchecked]:bg-gray-500"
                        />
                      </div>
                      <Button onClick={() => handleEditScene(scene)} variant="ghost" size="sm">
                        <SquarePen className="h-4 w-4 text-primary" />
                      </Button>
                      <Button onClick={() => handleDeleteScene(scene.id)} variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {isCreatingScene && (
          <Card className={`${scenesTheme.card} border-border p-4 space-y-4`}>
            <h3 className="text-lg font-semibold text-foreground">{editingSceneId ? "Edit Scene" : "New Scene"}</h3>

            <div className="space-y-2">
              <Label className={`text-sm ${scenesTheme.mutedText}`}>Scene Name</Label>
              <Input
                value={sceneName}
                onChange={(e) => {
                  setSceneName(e.target.value)
                  if (e.target.value.trim()) setSceneNameError("")
                }}
                placeholder="Enter scene name"
                enterKeyHint="next"
                data-scene-input-order
                onKeyDown={handleSceneInputEnter}
                className={`bg-background ${scenesFieldBorder}`}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className={`text-sm ${scenesTheme.mutedText}`}>WHEN Conditions</Label>
                <Button onClick={handleAddCondition} size="sm" variant="outline">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              {whenConditions.map((condition, index) => (
                <div key={index} className={`rounded-lg ${scenesTheme.tile} p-3 space-y-3`}>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-3">
                      <ModalSelector
                        value={condition.type}
                        onValueChange={(value: string) => {
                          if (!isUiWhenType(value)) return

                          const supportsTimeWindow = (TIME_WINDOW_SUPPORTED_TYPES as readonly UiWhenType[]).includes(value)

                          if (value === "power-drops") {
                            handleUpdateCondition(index, {
                              type: value,
                              operator: ">",
                              timeWindow: undefined,
                              timeStartHour: undefined,
                              timeStartMinute: undefined,
                              timeStartPeriod: undefined,
                              timeEndHour: undefined,
                              timeEndMinute: undefined,
                              timeEndPeriod: undefined,
                            })
                            return
                          }

                          if (supportsTimeWindow) {
                            handleUpdateCondition(index, {
                              type: value,
                              operator: undefined,
                              value: undefined,
                              timeWindow: "always",
                              timeStartHour: undefined,
                              timeStartMinute: undefined,
                              timeStartPeriod: undefined,
                              timeEndHour: undefined,
                              timeEndMinute: undefined,
                              timeEndPeriod: undefined,
                            })
                          } else {
                            handleUpdateCondition(index, {
                              type: value,
                              operator: "<",
                              timeWindow: undefined,
                              timeStartHour: undefined,
                              timeStartMinute: undefined,
                              timeStartPeriod: undefined,
                              timeEndHour: undefined,
                              timeEndMinute: undefined,
                              timeEndPeriod: undefined,
                            })
                          }
                        }}
                        label="Select Condition"
                        options={[
                          { value: "wifi", label: "wifi" },
                          { value: "battery", label: "battery" },
                          { value: "cpu-temp", label: "cpu temperature" },
                          { value: "cpu-load", label: "cpu load" },
                          { value: "latency", label: "latency" },
                          { value: "power-drops", label: "power drops" },
                          { value: "door-lock", label: "door lock" },
                          { value: "door-unlock", label: "door unlock" },
                          { value: "door-open", label: "door open" },
                          { value: "door-closed", label: "door closed" },
                          { value: "user-ibutton-created", label: "User or iButton created" },
                          { value: "user-ibutton-deleted", label: "User or iButton deleted" },
                          { value: "scene-created", label: "Scene created" },
                          { value: "scene-edited", label: "Scene edited" },
                          { value: "scene-deleted", label: "Scene deleted" },
                          { value: "quick-controls-changed", label: "Quick controls changed" },
                        ]}
                      />

                      {condition.operator &&
                        condition.type !== "power-drops" &&
                        !(TIME_WINDOW_SUPPORTED_TYPES as readonly UiWhenType[]).includes(condition.type) && (
                          <div className="space-y-2">
                            <ModalSelector
                              value={condition.operator}
                              onValueChange={(value: string) => {
                                if (!isOperator(value)) return
                                handleUpdateCondition(index, { operator: value })
                              }}
                              label="Select Operator"
                              options={[
                                { value: "<", label: "<" },
                                { value: ">", label: ">" },
                                { value: "=", label: "=" },
                              ]}
                            />

                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={condition.value ?? ""}
                                onChange={(e) => {
                                  const val = e.target.value
                                  handleUpdateCondition(index, { value: val === "" ? undefined : Number.parseFloat(val) })
                                }}
                                placeholder="Enter value"
                                enterKeyHint="next"
                                data-scene-input-order
                                onKeyDown={handleSceneInputEnter}
                                className={`flex-1 ${scenesFieldBackground} border-border`}
                              />
                              <span className={`text-xs ${scenesTheme.mutedText} whitespace-nowrap`}>{getUnit(condition.type)}</span>
                            </div>
                          </div>
                        )}

                      {condition.type === "power-drops" && (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min="0"
                            value={condition.value ?? ""}
                            onChange={(e) => {
                              const val = e.target.value
                              handleUpdateCondition(index, { value: val === "" ? undefined : Number.parseInt(val, 10) })
                            }}
                            placeholder="Enter value"
                            enterKeyHint="next"
                            data-scene-input-order
                            onKeyDown={handleSceneInputEnter}
                            className={` ${scenesFieldBackground} border-border`}
                          />
                          <p className={`text-xs ${scenesTheme.mutedText}`}>
                            Notifications will be sent only after power is restored. 0 or 1 = every restore.
                          </p>
                        </div>
                      )}

                      {(TIME_WINDOW_SUPPORTED_TYPES as readonly UiWhenType[]).includes(condition.type) && (
                        <div className="space-y-2">
                          <ModalSelector
                            value={condition.timeWindow || "always"}
                            onValueChange={(value: string) => {
                              if (!isTimeWindow(value)) return

                              if (value === "always") {
                                handleUpdateCondition(index, {
                                  timeWindow: "always",
                                  timeStartHour: undefined,
                                  timeStartMinute: undefined,
                                  timeStartPeriod: undefined,
                                  timeEndHour: undefined,
                                  timeEndMinute: undefined,
                                  timeEndPeriod: undefined,
                                })
                              } else {
                                handleUpdateCondition(index, {
                                  timeWindow: "between",
                                  timeStartHour: "12",
                                  timeStartMinute: "00",
                                  timeStartPeriod: "AM",
                                  timeEndHour: "11",
                                  timeEndMinute: "59",
                                  timeEndPeriod: "PM",
                                })
                              }
                            }}
                            label="Select Time Window"
                            options={[
                              { value: "always", label: "always" },
                              { value: "between", label: "between hours" },
                            ]}
                          />

                          {condition.timeWindow === "between" && (
                            <div className="grid grid-cols-2 gap-3">
                              <CircularTimePicker
                                hour={condition.timeStartHour || "12"}
                                minute={condition.timeStartMinute || "00"}
                                period={condition.timeStartPeriod || "AM"}
                                onTimeChange={(h, m, p) =>
                                  handleUpdateCondition(index, { timeStartHour: h, timeStartMinute: m, timeStartPeriod: p })
                                }
                                label="Start time"
                              />
                              <CircularTimePicker
                                hour={condition.timeEndHour || "11"}
                                minute={condition.timeEndMinute || "59"}
                                period={condition.timeEndPeriod || "PM"}
                                onTimeChange={(h, m, p) =>
                                  handleUpdateCondition(index, { timeEndHour: h, timeEndMinute: m, timeEndPeriod: p })
                                }
                                label="End time"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button onClick={() => handleRemoveCondition(index)} variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Label className={`text-sm ${scenesTheme.mutedText}`}>THEN Action (select one)</Label>
              <Select
                value={thenAction.type}
                onValueChange={(value: string) => {
                  if (!isThenActionType(value)) return
                  setThenAction((prev) => ({ ...prev, type: value }))
                }}
              >
                <SelectTrigger className={`bg-background ${scenesFieldBorder} ${scenesSelectChevron}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">send push notification</SelectItem>
                  <SelectItem value="email">send email</SelectItem>
                  {currentUserAccess === "admin" && <SelectItem value="restart">restart controller</SelectItem>}
                </SelectContent>
              </Select>

              {(thenAction.type === "push" || thenAction.type === "email") && (
                <Input
                  placeholder="Custom message text"
                  enterKeyHint="done"
                  data-scene-input-order
                  onKeyDown={handleSceneInputEnter}
                  value={thenAction.customText || ""}
                  onChange={(e) => setThenAction((prev) => ({ ...prev, customText: e.target.value }))}
                  className={`bg-background ${scenesFieldBorder}`}
                />
              )}
            </div>

            {sceneNameError && <p className="text-sm text-destructive text-center">{sceneNameError}</p>}

            <div className="flex gap-2">
              <Button onClick={handleSaveScene} className="flex-1">
                {editingSceneId ? "Update Scene" : "Create Scene"}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </Card>
        )}
      </div>

      <AppBottomNav
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        hasPlan={hasPlan}
        canAccessActivity={canAccessActivity}
        canAccessScenes={canAccessScenes}
        canAccessSettings={canAccessSettings}
        inactiveTextClassName={scenesTheme.bottomNavInactiveText}
      />
    </div>
  )
}
