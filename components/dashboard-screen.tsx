"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { doorActions } from "@/lib/core/door-actions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Home,
  LockIcon,
  LockOpen,
  Settings,
  User,
  Wifi,
  Battery,
  Cpu,
  Activity,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import type { Screen } from "@/app/page"
import { useAppContext } from "@/lib/app-context"
import { getWifiClass, getDoorStatusClass, validateColorTokens } from "@/lib/color-utils"
import { useToast } from "@/hooks/use-toast"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void
  isPremium: boolean
  premiumExpiry: string
  isOnTrial: boolean
  remainingTrialDays: number | null
  onShowChart: (metric: string) => void
  doorName: string
  setDoorName: (name: string) => void
  currentScreen: Screen
}

export default function DashboardScreen({
  onNavigate,
  isPremium,
  premiumExpiry,
  isOnTrial,
  remainingTrialDays,
  onShowChart,
  doorName,
  setDoorName,
  currentScreen,
}: DashboardScreenProps) {
  const [doorSensorOpen, setDoorSensorOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedDoorId, setSelectedDoorId] = useState("main-door")
  const [isAddDoorModalOpen, setIsAddDoorModalOpen] = useState(false)
  const [isEditDoorModalOpen, setIsEditDoorModalOpen] = useState(false)
  const [isDeleteDoorDialogOpen, setIsDeleteDoorDialogOpen] = useState(false)
  const [newDoorName, setNewDoorName] = useState("")
  const [editDoorName, setEditDoorName] = useState("")

  const {
    isSystemStatusExpanded,
    setIsSystemStatusExpanded,
    countdown,
    doorState,
    setDoorState,
    autoLockEnabled,
    userName,
    getActiveController,
    currentUserAccess,
    getEntityName,
    setEntityName,
    getFullAccessUserProfile,
    doors,
    addDoor,
    updateDoor,
    removeDoor,
  } = useAppContext()

  const { toast } = useToast()
  const controller = getActiveController()

  // ✅ Always use a valid door id (no setState in useEffect)
  const activeDoorId =
    doors.length === 0 ? "" : doors.some((d) => d.id === selectedDoorId) ? selectedDoorId : doors[0].id

  const selectedDoor = doors.find((d) => d.id === activeDoorId)
  const doorSystemName = selectedDoor?.systemName || doorName
  const displayDoorName = getEntityName("doors", activeDoorId, doorSystemName)

  const displayUserName = currentUserAccess === "full" ? getFullAccessUserProfile()?.name || userName : userName

  const permissionContext: PermissionContext = {
    currentUserAccess,
    adminHasActiveSubscription: isPremium || isOnTrial,
    isTrialActive: isOnTrial,
    isTrialExpired: remainingTrialDays !== null && remainingTrialDays === 0,
  }

  const canAddDoors = Permissions.canAddDoors(permissionContext)
  const canEditDoors = Permissions.canEditDoors(permissionContext)
  const canDeleteDoors = Permissions.canDeleteDoors(permissionContext)

  useEffect(() => {
    validateColorTokens()
  }, [])

  const callDoorAction = async (doorId: string, nextState: "lock" | "unlock") => {
    const res = nextState === "lock" ? await doorActions.lock(doorId) : await doorActions.unlock(doorId)

    if (!res.ok) {
      toast({
        title: "Action failed",
        description: res.error,
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleLabelClick = async (targetState: "lock" | "unlock") => {
    if (!Permissions.canLockUnlockDoors(permissionContext)) return
    if (!activeDoorId) return
    if (doorState === targetState) return

    const ok = await callDoorAction(activeDoorId, targetState)
    if (!ok) return

    setDoorState(targetState)
  }

  const handleSliderInteraction = async (clientX: number, rect: DOMRect) => {
    if (!Permissions.canLockUnlockDoors(permissionContext)) return
    if (!activeDoorId) return

    const relativeX = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (relativeX / rect.width) * 100))

    const targetState: "lock" | "unlock" = percentage < 50 ? "lock" : "unlock"

    if (doorState === targetState) return

    const ok = await callDoorAction(activeDoorId, targetState)
    if (!ok) return

    setDoorState(targetState)
  }

  const handleSliderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    void handleSliderInteraction(e.clientX, rect)
  }

  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const rect = e.currentTarget.getBoundingClientRect()
      void handleSliderInteraction(e.clientX, rect)
    }
  }

  const handleSliderMouseUp = () => setIsDragging(false)

  const handleSliderTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    void handleSliderInteraction(touch.clientX, rect)
  }

  const handleSliderTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging && e.touches.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const touch = e.touches[0]
      void handleSliderInteraction(touch.clientX, rect)
    }
  }

  const handleSliderTouchEnd = () => setIsDragging(false)

  const handleRestrictedAccess = (tabName: string) => {
    toast({
      title: "Access Restricted",
      description: `You don't have permission to access ${tabName}.`,
      variant: "default",
    })
  }

  const activityLogs = [
    { id: 1, doorName: displayDoorName, time: "10:45 AM", action: "open", method: null, user: null },
    { id: 2, doorName: displayDoorName, time: "10:47 AM", action: "closed", method: null, user: null },
    { id: 3, doorName: displayDoorName, time: "02:30 PM", action: "unlock", method: "iButton", user: "Jane Smith" },
    { id: 4, doorName: displayDoorName, time: "02:35 PM", action: "open", method: null, user: null },
    { id: 5, doorName: displayDoorName, time: "05:15 PM", action: "lock", method: "App", user: "John Doe" },
  ]

  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)
  const canAccessActivity = Permissions.canAccessActivity(permissionContext)

  const getActiveTab = () => {
    if (currentScreen === "dashboard") return "home"
    if (currentScreen === "activity-log") return "activity-log"
    if (currentScreen === "scenes") return "scenes"
    if (currentScreen === "settings") return "settings"
    if (currentScreen === "profile") return "profile"
    return "home"
  }

  const activeTab = getActiveTab()

  const handleAddDoor = () => {
    if (!canAddDoors) return
    setNewDoorName("")
    setIsAddDoorModalOpen(true)
  }

  const handleSaveNewDoor = () => {
    if (!canAddDoors || !newDoorName.trim()) return
    const newId = addDoor(newDoorName.trim())
    if (newId) {
      setSelectedDoorId(newId)
      setIsAddDoorModalOpen(false)
      setNewDoorName("")
    }
  }

  const handleEditDoor = () => {
    if (!canEditDoors) return
    if (!activeDoorId) return
    const currentDoor = doors.find((d) => d.id === activeDoorId)
    if (currentDoor) {
      setEditDoorName(currentDoor.systemName)
      setIsEditDoorModalOpen(true)
    }
  }

  const handleSaveEditDoor = () => {
    if (!canEditDoors || !editDoorName.trim()) return
    if (!activeDoorId) return
    const success = updateDoor(activeDoorId, editDoorName.trim())
    if (success) setIsEditDoorModalOpen(false)
  }

  const handleConfirmDelete = () => {
    if (!canDeleteDoors) return
    setIsEditDoorModalOpen(false)
    setIsDeleteDoorDialogOpen(true)
  }

  const handleDeleteDoor = () => {
    if (!canDeleteDoors) return
    if (!activeDoorId) return

    const remaining = doors.filter((d) => d.id !== activeDoorId)
    removeDoor(activeDoorId)
    setSelectedDoorId(remaining[0]?.id ?? "")
    setIsDeleteDoorDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="bg-background p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">SmartDoor Inc.</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back</p>
            <p className="text-lg font-semibold text-foreground">{displayUserName}</p>
          </div>
          <div className="text-right">
            {isPremium ? (
              <div>
                {isOnTrial && remainingTrialDays !== null ? (
                  <>
                    <span className="text-sm font-semibold text-yellow-500">Trial version</span>
                    <p className="text-xs text-gray-400">{remainingTrialDays} days left</p>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-yellow-500">Member</span>
                    <p className="text-xs text-muted-foreground">Until: {premiumExpiry}</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Free user</p>
                <button
                  onClick={() => onNavigate("subscription")}
                  className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <Zap className="h-3 w-3" />
                  Get Premium
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Select value={activeDoorId} onValueChange={setSelectedDoorId}>
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {doors.map((door) => {
                const doorDisplayName = getEntityName("doors", door.id, door.systemName)
                return (
                  <SelectItem key={door.id} value={door.id}>
                    {doorDisplayName}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {canAddDoors && (
            <div className="flex gap-2">
              <Button onClick={handleAddDoor} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
              {canEditDoors && (
                <Button onClick={handleEditDoor} variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        <Card className="bg-card border-border p-4 space-y-3 min-h-[140px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span
                onClick={() => void handleLabelClick("lock")}
                className={`text-sm font-semibold transition-all duration-100 whitespace-nowrap cursor-pointer ${
                  doorState === "lock" ? "text-red-500 opacity-100" : "text-gray-300 opacity-50"
                }`}
              >
                Lock
              </span>

              <div
                className="relative w-24 h-16 bg-black rounded-full cursor-pointer select-none overflow-hidden border-2 border-border"
                onMouseDown={handleSliderMouseDown}
                onMouseMove={handleSliderMouseMove}
                onMouseUp={handleSliderMouseUp}
                onMouseLeave={handleSliderMouseUp}
                onTouchStart={handleSliderTouchStart}
                onTouchMove={handleSliderTouchMove}
                onTouchEnd={handleSliderTouchEnd}
              >
                <div
                  className="absolute w-12 h-12 rounded-full transition-all duration-100 top-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg"
                  style={{
                    left: doorState === "lock" ? "4px" : "calc(100% - 52px)",
                    backgroundColor: doorState === "lock" ? "var(--color-status-lock)" : "var(--color-status-unlock)",
                  }}
                >
                  {doorState === "lock" ? (
                    <LockIcon className="h-6 w-6 text-white" />
                  ) : (
                    <LockOpen className="h-6 w-6 text-white" />
                  )}
                </div>
              </div>

              <span
                onClick={() => void handleLabelClick("unlock")}
                className={`text-sm font-semibold transition-all duration-100 whitespace-nowrap cursor-pointer ${
                  doorState === "unlock" ? "text-green-500 opacity-100" : "text-gray-300 opacity-50"
                }`}
              >
                Unlock
              </span>
            </div>

            <div className="flex items-center justify-between min-h-[32px]">
              {doorState === "unlock" && autoLockEnabled && countdown !== null && countdown > 0 ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Automatic lock</span>
                  <span className={`font-bold tabular-nums text-lg ${getDoorStatusClass("lock")}`}>{countdown}s</span>
                </div>
              ) : (
                <div></div>
              )}

              <div>
                {doorSensorOpen ? (
                  <p className="text-sm font-medium text-green-500">Open</p>
                ) : (
                  <p className="text-sm font-medium">Closed</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">System Status</h2>
            {controller ? (
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${controller.status === "online" ? "animate-pulse" : ""}`}
                  style={{
                    backgroundColor:
                      controller.status === "online" ? `var(${getWifiClass(-50).match(/--[^)]+/)?.[0]})` : "#ef4444",
                  }}
                />
                <span className={controller.status === "online" ? getWifiClass(-50) : "text-red-500"}>
                  {controller.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No controller</span>
            )}
          </div>

          {isSystemStatusExpanded && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onShowChart("wifi")}
                className="space-y-1 rounded-lg bg-background p-3 hover:bg-background/80 transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground">WiFi Signal</p>
                <div className="flex items-center gap-2">
                  <Wifi className={`${getWifiClass(-50)}`} />
                  <p className={`text-sm font-semibold ${getWifiClass(-50)}`}>-50 dBm</p>
                </div>
              </button>

              <button
                onClick={() => onShowChart("battery")}
                className="space-y-1 rounded-lg bg-background p-3 hover:bg-background/80 transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground">Battery</p>
                <div className="flex items-center gap-2">
                  <Battery className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-foreground">78%</p>
                </div>
              </button>

              <button
                onClick={() => onShowChart("cpu-temp")}
                className="space-y-1 rounded-lg bg-background p-3 hover:bg-background/80 transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground">CPU Temp</p>
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">42°C</p>
                </div>
              </button>

              <button
                onClick={() => onShowChart("cpu-load")}
                className="space-y-1 rounded-lg bg-background p-3 hover:bg-background/80 transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground">CPU Load</p>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">35%</p>
                </div>
              </button>

              <button
                onClick={() => onShowChart("latency")}
                className="space-y-1 rounded-lg bg-background p-3 hover:bg-background/80 transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground">Latency</p>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-foreground">12 ms</p>
                </div>
              </button>

              <button
                onClick={() => onShowChart("power-drops")}
                className="space-y-1 rounded-lg bg-background p-3 hover:bg-background/80 transition-colors text-left"
              >
                <p className="text-xs text-muted-foreground">Power Drops</p>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <p className="text-sm font-semibold text-foreground">2 events</p>
                </div>
              </button>

              {controller && (
                <div className="space-y-1 rounded-lg bg-background p-3 col-span-2">
                  <p className="text-xs text-muted-foreground">Controller</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{controller.serialNumber}</p>
                    {controller.ip && <p className="text-xs text-muted-foreground">{controller.ip}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => setIsSystemStatusExpanded(!isSystemStatusExpanded)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSystemStatusExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </button>
          </div>
        </Card>

        <Card className="bg-card border-border p-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Activity Log</h2>

          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div key={log.id} className="rounded-lg bg-background p-3 space-y-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{log.doorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.action === "open" || log.action === "closed" ? (
                        <span className={getDoorStatusClass(log.action as "open" | "closed") + " font-medium"}>
                          {log.action.toUpperCase()}
                        </span>
                      ) : (
                        <>
                          <span className={getDoorStatusClass(log.action as "lock" | "unlock") + " font-medium"}>
                            {log.action.toUpperCase()}
                          </span>
                          {log.method && ` via ${log.method}`}
                          {log.user && ` • ${log.user}`}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {log.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
            onClick={() => {
              if (canAccessActivity && isPremium) {
                onNavigate("activity-log")
              } else if (canAccessActivity) {
                onNavigate("subscription")
              } else {
                handleRestrictedAccess("Activity")
              }
              window.scrollTo({ top: 0, behavior: "instant" })
            }}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "activity-log" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Activity className="h-6 w-6" />
              {(!canAccessActivity || !isPremium) && (
                <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />
              )}
            </div>
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
              <Settings className="h-6 w-6" />
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

      {/* Add Door Modal */}
      <Dialog open={isAddDoorModalOpen} onOpenChange={setIsAddDoorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Door</DialogTitle>
            <DialogDescription>Enter a name for the new door.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="door-name">Door Name</Label>
              <Input
                id="door-name"
                value={newDoorName}
                onChange={(e) => setNewDoorName(e.target.value)}
                placeholder="Enter door name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveNewDoor()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDoorModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewDoor}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Door Modal */}
      <Dialog open={isEditDoorModalOpen} onOpenChange={setIsEditDoorModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Door</DialogTitle>
            <DialogDescription>Edit the door name or delete this door.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-door-name">Door Name</Label>
              <Input
                id="edit-door-name"
                value={editDoorName}
                onChange={(e) => setEditDoorName(e.target.value)}
                placeholder="Enter door name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEditDoor()
                }}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleConfirmDelete} className="mr-auto">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Door
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDoorModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditDoor}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDoorDialogOpen} onOpenChange={setIsDeleteDoorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Door</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this door? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoor}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
