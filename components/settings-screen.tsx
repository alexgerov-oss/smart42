"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ArrowLeft, Info, LockIcon, Trash2, SquarePen } from "lucide-react"
import type { Screen } from "@/app/page"
import { useAppContext } from "@/lib/app-context"
import { CircularTimePicker } from "@/components/ui/circular-time-picker"
import { Permissions, type PermissionContext } from "@/lib/permissions"
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { DialogCancel } from "@/components/ui/dialog-cancel"
import { DialogAction } from "@/components/ui/dialog-action"
import { AppBottomNav } from "@/components/app-bottom-nav"
import { VisibilityThemeSelector } from "@/components/visibility-theme-selector"

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void

  // ✅ единственото важно: plan flag (trial/premium)
  hasPlan: boolean

  currentScreen: Screen

  // legacy trial props removed (plan gating uses hasPlan only)
}

type SettingsVisibilityTheme = "dark" | "soft" | "day"

const SETTINGS_VISIBILITY_THEMES: SettingsVisibilityTheme[] = ["dark", "soft", "day"]

const SETTINGS_VISIBILITY_THEME_CLASSES: Record<
  SettingsVisibilityTheme,
  {
    card: string
    tile: string
    mutedText: string
    bottomNavInactiveText: string
    sliderTrack: string
    swatch: string
  }
> = {
  dark: {
    card: "bg-card",
    tile: "bg-background",
    mutedText: "text-muted-foreground",
    bottomNavInactiveText: "text-muted-foreground",
    sliderTrack: "[&_[data-slot=slider-track]]:!bg-muted",
    swatch: "bg-black",
  },
  soft: {
    card: "bg-[#232b3a]",
    tile: "bg-[#151b27]",
    mutedText: "text-gray-300",
    bottomNavInactiveText: "text-gray-300",
    sliderTrack: "[&_[data-slot=slider-track]]:!bg-gray-600",
    swatch: "bg-[linear-gradient(135deg,#111827_0%,#111827_50%,#ffffff_50%,#ffffff_100%)]",
  },
  day: {
    card: "bg-[#2d374c]",
    tile: "bg-[#151d2b]",
    mutedText: "text-gray-200",
    bottomNavInactiveText: "text-gray-100",
    sliderTrack: "[&_[data-slot=slider-track]]:!bg-gray-500",
    swatch: "bg-white",
  },
}

export default function SettingsScreen({
  onNavigate,
  hasPlan,
  currentScreen,
}: SettingsScreenProps) {
  const [showControllerDialog, setShowControllerDialog] = useState(false)
  const [serialNumber, setSerialNumber] = useState("")
  const [controllerIp, setControllerIp] = useState("")
  const [editingControllerId, setEditingControllerId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string>("")

  const [showPremiumDialog, setShowPremiumDialog] = useState(false)

  const [showEditIButtonDialog, setShowEditIButtonDialog] = useState(false)
  const [showEditAppUserDialog, setShowEditAppUserDialog] = useState(false)
  const [showInviteAppUserDialog, setShowInviteAppUserDialog] = useState(false)

  const [inviteUserName, setInviteUserName] = useState("")
  const [inviteUserEmail, setInviteUserEmail] = useState("")
  const [inviteUserAccess, setInviteUserAccess] = useState<"full" | "open-close">("open-close")

  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editingUserAccess, setEditingUserAccess] = useState<"full" | "open-close">("open-close")

  const [isListeningMode, setIsListeningMode] = useState(false)
  const [newIButtonChipId, setNewIButtonChipId] = useState("A1F3-C92D")
  const [newIButtonName, setNewIButtonName] = useState("")
  const [registeringIButtonId, setRegisteringIButtonId] = useState<string | null>(null)

  const [showRestartConfirmDialog, setShowRestartConfirmDialog] = useState(false)

  const [deleteIButtonId, setDeleteIButtonId] = useState<string | null>(null)
  const [deleteAppUserId, setDeleteAppUserId] = useState<string | null>(null)

  const [visibilityTheme, setVisibilityTheme] = useState<SettingsVisibilityTheme>(() => {
    if (typeof window === "undefined") return "soft"
    const savedTheme = window.localStorage.getItem("homeVisibilityTheme")
    return savedTheme === "dark" || savedTheme === "day" ? savedTheme : "soft"
  })

  const settingsTheme = SETTINGS_VISIBILITY_THEME_CLASSES[visibilityTheme]

  const handleVisibilityThemeChange = (theme: SettingsVisibilityTheme) => {
    setVisibilityTheme(theme)
    window.localStorage.setItem("homeVisibilityTheme", theme)
  }

  const { toast } = useToast()

  const {
    autoLockEnabled,
    setAutoLockEnabled,
    autoLockDelay,
    setAutoLockDelay,
    autoNightLockEnabled,
    setAutoNightLockEnabled,
    nightLockHour,
    setNightLockHour,
    nightLockMinute,
    setNightLockMinute,
    nightLockPeriod,
    setNightLockPeriod,

    iButtonUsers,
    appUsers,
    updateIButtonUser,
    addIButtonUser,
    removeIButtonUser,
    addAppUser,
    removeAppUser,
    updateAppUserAccess,

    controllers,
    addController,
    updateController,
    getActiveController,
    restartController,
    removeController,

    currentUserAccess,
    quickControlsLocked,
    setQuickControlsLocked,
    logActivity,
    getEntityName,
    setEntityName,

    canCreateFullAccessAccount,
    isFullAccessUserActivated,
  } = useAppContext()

  const controller = getActiveController()
  const isAdmin = currentUserAccess === "admin"


  const permissionContext: PermissionContext = {
    currentUserAccess,
    hasPlan,
  }

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canManageControllers = Permissions.canManageControllers(permissionContext)
  const canAddAppUsers = Permissions.canAddAppUsers(permissionContext) && hasPlan
  const canAddIButtons = Permissions.canAddIButtons(permissionContext)
  const canRenameIButtons = Permissions.canRenameIButtons(permissionContext)
  const canRenameAppUsers = Permissions.canRenameAppUsers(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)

  const isFreeAdmin = isAdmin && !hasPlan

  const canAddMoreAppUsers = canAddAppUsers

  const visibleIButtonUsers =
    currentUserAccess === "admin" ? iButtonUsers : iButtonUsers.filter((user) => user.createdBy === currentUserAccess)

  const visibleAppUsers =
    currentUserAccess === "admin" ? appUsers : appUsers.filter((user) => user.createdBy === currentUserAccess)

  const canEditItem = (itemCreatedBy: "admin" | "full" | "open-close", itemId?: string) => {
    if (currentUserAccess === "admin") return true
    if (currentUserAccess === "full" && itemId === "2") return false
    return itemCreatedBy === currentUserAccess
  }

  const handleOpenControllerDialog = () => {
    if (controller) {
      setEditingControllerId(controller.id)
      setSerialNumber(controller.serialNumber)
      setControllerIp(controller.ip || "")
    } else {
      setEditingControllerId(null)
      setSerialNumber("")
      setControllerIp("")
    }
    setValidationError("")
    setShowControllerDialog(true)
  }

  const handleCancelControllerDialog = () => {
    setShowControllerDialog(false)
    setSerialNumber("")
    setControllerIp("")
    setEditingControllerId(null)
    setValidationError("")
  }

  const handleAddControllerClick = () => {
    setEditingControllerId(null)
    setSerialNumber("")
    setControllerIp("")
    setValidationError("")
    setShowControllerDialog(true)
  }

  const confirmRestart = () => {
    if (!controller) return
    restartController(controller.id)
    setShowRestartConfirmDialog(false)
  }

  const handleIButtonNameChange = (name: string) => {
    setNewIButtonName(name)
    if (registeringIButtonId) updateIButtonUser(registeringIButtonId, name || "Unnamed iButton")
  }

  const saveNewIButton = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    if (newIButtonName.trim() || registeringIButtonId) {
      const finalName = newIButtonName.trim() || "Unnamed iButton"
      if (registeringIButtonId) {
        updateIButtonUser(registeringIButtonId, finalName)
        logSettingsActivity(
          "iButton created",
          "ibutton-created",
          `iButton "${finalName}" (ID: ${registeringIButtonId}) was created`,
        )
      }
    }
    setIsListeningMode(false)
    setNewIButtonName("")
    setRegisteringIButtonId(null)
  }

  const cancelIButtonRegistration = () => {
    if (registeringIButtonId) removeIButtonUser(registeringIButtonId)
    setIsListeningMode(false)
    setNewIButtonName("")
    setRegisteringIButtonId(null)
  }

  const handleOpenInviteDialog = () => {
    if (!canAddAppUsers) return

    if (!hasPlan) {
      toast({
        title: "User not added",
        description: "Get trial or premium to add app users.",
        variant: "destructive",
      })
      setShowPremiumDialog(true)
      return
    }

    setInviteUserName("")
    setInviteUserEmail("")
    setInviteUserAccess("open-close")
    setShowInviteAppUserDialog(true)
  }

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSendInvitation =
    inviteUserName.trim() !== "" &&
    inviteUserEmail.trim() !== "" &&
    isValidEmail(inviteUserEmail.trim())

  const getAppUserDisplayName = (user: { id: string; name: string }) => getEntityName("appusers", user.id, user.name)

  const formatCreatedAt = (createdAt: string) => {
    const date = new Date(createdAt)
    const day = date.getDate().toString().padStart(2, "0")
    const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase()
    const year = date.getFullYear()
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })

    return `${day} ${month} ${year} - ${time}`
  }

  const handleSendInvitation = () => {
    if (!canAddAppUsers) return
    if (!canSendInvitation) return

    if (!hasPlan) {
      toast({
        title: "Invitation not sent",
        description: "Get trial or premium to add app users.",
        variant: "destructive",
      })
      setShowPremiumDialog(true)
      return
    }

    const finalAccess = inviteUserAccess

    if (finalAccess === "full") {
      if (!isAdmin) {
        toast({ title: "Access Denied", description: "Only Admin can create Full Access users.", variant: "destructive" })
        return
      }
      if (!canCreateFullAccessAccount()) {
        toast({
          title: "Full Access Limit Reached",
          description: "Only one Full Access account is allowed.",
          variant: "destructive",
        })
        return
      }
    }

    const finalName = inviteUserName.trim()
    const finalEmail = inviteUserEmail.trim()
    const ok = addAppUser(finalName, finalEmail, finalAccess)

    if (!ok) {
      toast({
        title: "Invitation not sent",
        description: "User was not added. Check plan/trial and duplicate email.",
        variant: "destructive",
      })
      return
    }

    logSettingsActivity(
      "App user created",
      "app-user-created",
      `App user "${finalName}" (${finalEmail}, ${getAccessLabel(finalAccess)}) was created`,
    )

    setInviteUserName("")
    setInviteUserEmail("")
    setInviteUserAccess("open-close")
    setShowInviteAppUserDialog(false)

    toast({ title: "Invitation sent", description: "The user will receive an email to join." })
  }

  const handleDeleteIButton = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    const deletedIButton = iButtonUsers.find((u) => u.id === id)
    removeIButtonUser(id)
    if (deletedIButton) {
      logSettingsActivity(
        "iButton deleted",
        "ibutton-deleted",
        `iButton "${deletedIButton.name}" (ID: ${deletedIButton.id}) was deleted`,
      )
    }
    setDeleteIButtonId(null)
  }

  const handleDeleteAppUser = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    const deletedAppUser = appUsers.find((u) => u.id === id)
    removeAppUser(id)
    if (deletedAppUser) {
      logSettingsActivity(
        "App user deleted",
        "app-user-deleted",
        `App user "${deletedAppUser.name}" (${deletedAppUser.email}, ${getAccessLabel(deletedAppUser.access)}) was deleted`,
      )
    }
    setDeleteAppUserId(null)
  }

  const iButtonToDelete = iButtonUsers.find((u) => u.id === deleteIButtonId)
  const appUserToDelete = appUsers.find((u) => u.id === deleteAppUserId)

  const getActivityActorLabel = () => {
    if (currentUserAccess === "admin") return "Admin"
    if (currentUserAccess === "full") return "Full Access user"
    return "Open / Close Only user"
  }

  const getAccessLabel = (access: "admin" | "full" | "open-close") => {
    if (access === "admin") return "Admin"
    if (access === "full") return "Full Access"
    return "Open / Close Only"
  }

  const logSettingsActivity = (
    action: string,
    eventType:
      | "ibutton-created"
      | "ibutton-edited"
      | "ibutton-deleted"
      | "app-user-created"
      | "app-user-edited"
      | "app-user-deleted"
      | "quick-control-changed",
    description: string,
  ) => {
    const actor = getActivityActorLabel()

    logActivity({
      createdAt: new Date().toISOString(),
      action,
      eventType,
      user: actor,
      role: currentUserAccess,
      method: "Settings",
      description: `${description} by ${actor}`,
    })
  }

  const logQuickControlChanged = (description: string) => {
    logSettingsActivity("Quick control changed", "quick-control-changed", description)
  }

  const handleToggleQuickControlsLock = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    const nextLocked = !quickControlsLocked
    setQuickControlsLocked(nextLocked)
    logQuickControlChanged(nextLocked ? "Quick Controls locked" : "Quick Controls unlocked")
  }

  const areQuickControlsDisabled = quickControlsLocked

  const handleSaveIButtonName = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    const editedIButton = editingUserId ? iButtonUsers.find((u) => u.id === editingUserId) : undefined
    const previousName = editedIButton && editingUserId ? getEntityName("ibuttons", editingUserId, editedIButton.name) : ""
    const nextName = editingName?.trim()

    if (editingUserId && nextName) {
      setEntityName("ibuttons", editingUserId, nextName)
      logSettingsActivity(
        "iButton edited",
        "ibutton-edited",
        `iButton name changed from "${previousName || "Unnamed iButton"}" to "${nextName}" (ID: ${editingUserId})`,
      )
    }

    setShowEditIButtonDialog(false)
    setEditingUserId(null)
    setEditingName(null)
  }

  const handleSaveAppUserName = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    if (editingUserId && editingName) setEntityName("appusers", editingUserId, editingName)
    setShowEditAppUserDialog(false)
    setEditingUserId(null)
    setEditingName(null)
  }

  const handleAddIButtonUser = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return

    if (isFreeAdmin && iButtonUsers.length >= 1) {
      toast({
        title: "iButton not added",
        description: "You cannot add more Ibuttons in the current plan. Get trial or premium.",
        variant: "destructive",
      })
      return
    }

    const newId = addIButtonUser()

    if (typeof newId === "string" && newId.startsWith("ibutton-blocked-")) {
      toast({
        title: "iButton not added",
        description: hasPlan
          ? "Trial/Premium is active but the app is still in free mode. Please refresh the page."
          : "You cannot add more Ibuttons in the current plan. Get trial or premium.",
        variant: "destructive",
      })
      return
    }

    setRegisteringIButtonId(newId)
    setIsListeningMode(true)
    setNewIButtonChipId("A1F3-C92D")
    setNewIButtonName("")
  }

  const handleToggleAutoLock = (checked: boolean) => {
    setAutoLockEnabled(checked)
    logQuickControlChanged(checked ? "Automatic Lock enabled" : "Automatic Lock disabled")
  }

  const handleAutoLockDelayChange = (value: number[]) => {
    const nextDelay = value[0]
    setAutoLockDelay(nextDelay)
  }

  const handleAutoLockDelayCommit = (value: number[]) => {
    const nextDelay = value[0]
    logQuickControlChanged(`Automatic Lock delay changed to ${nextDelay} seconds`)
  }

  const handleToggleAutoNightLock = (checked: boolean) => {
    setAutoNightLockEnabled(checked)
    logQuickControlChanged(checked ? "Automatic Night Lock enabled" : "Automatic Night Lock disabled")
  }

  const handleNightLockTimeChange = (hour: string, minute: string, period: "AM" | "PM") => {
    setNightLockHour(hour)
    setNightLockMinute(minute)
    setNightLockPeriod(period)
    logQuickControlChanged(`Automatic Night Lock time changed to ${hour}:${minute} ${period}`)
  }

  const handleAddController = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return

    const success = editingControllerId
      ? updateController(editingControllerId, serialNumber, controllerIp)
      : addController(serialNumber, controllerIp)

    if (!success) {
      setValidationError("Invalid serial number or duplicate found")
      return
    }

    setSerialNumber("")
    setControllerIp("")
    setShowControllerDialog(false)
    setEditingControllerId(null)
    setValidationError("")
  }

  const handleRestartController = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) return
    setShowRestartConfirmDialog(true)
  }

  const editingUserCurrentAccess =
    editingUserId
      ? (appUsers.find((u) => u.id === editingUserId)?.access as "admin" | "full" | "open-close" | undefined)
      : undefined
  const canShowFullInEdit = canCreateFullAccessAccount() || editingUserCurrentAccess === "full"

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="bg-black border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("dashboard")} className="text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
          </div>

          <VisibilityThemeSelector
            themes={SETTINGS_VISIBILITY_THEMES}
            value={visibilityTheme}
            onChange={handleVisibilityThemeChange}
            ariaLabel="Settings visibility theme"
            themeClasses={SETTINGS_VISIBILITY_THEME_CLASSES}
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 pb-6">
        {/* Controller Section */}
        {canManageControllers && (
          <Card className={`${settingsTheme.card} border-border`}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Controller</h2>
                {controller && (
                  <Button
                    onClick={() => handleRestartController()}
                    variant="ghost"
                    size="sm"
                    disabled={!isAdmin || controller.isRestarting}
                  >
                    Restart
                  </Button>
                )}
              </div>

              {controller && (
                <div className={`rounded-lg ${settingsTheme.tile} p-3 space-y-2`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${settingsTheme.mutedText}`}>Serial number</p>
                    <div className="flex items-center gap-1">
                      {controller.isRestarting ? (
                        <>
                          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                          <span className="text-xs text-yellow-500">Restarting</span>
                        </>
                      ) : (
                        <>
                          <div
                            className={`h-2 w-2 rounded-full ${controller.status === "online" ? "bg-green-500" : "bg-red-500"}`}
                          />
                          <span className={`text-xs ${settingsTheme.mutedText} capitalize`}>{controller.status}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{controller.serialNumber}</p>
                    <Button
                      onClick={handleOpenControllerDialog}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-primary"
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                  </div>

                  {controller.ip && (
                    <div className="mt-3 pt-3 border-t border-border space-y-1">
                      <p className={`text-xs ${settingsTheme.mutedText}`}>IP Address</p>
                      <p className="text-sm font-medium text-foreground">{controller.ip}</p>
                    </div>
                  )}
                </div>
              )}

              {!controller && (
                <Button
                  onClick={handleAddControllerClick}
                  variant="default"
                  className="w-full"
                  disabled={!canManageControllers}
                >
                  Add Controller
                </Button>
              )}

              <Dialog open={showControllerDialog} onOpenChange={setShowControllerDialog}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{editingControllerId ? "Edit Controller" : "Add Controller"}</DialogTitle>
                    <DialogDescription>Set the controller serial number and optional IP address.</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="serial" className="text-sm font-medium">
                        Serial Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="serial"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        placeholder="Enter controller serial number"
                        className="bg-background border-border"
                      />
                      <p className={`text-xs ${settingsTheme.mutedText}`}>≥8 alphanumeric characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ip" className="text-sm font-medium">
                        Controller IP <span className={`${settingsTheme.mutedText} text-xs`}>(Optional)</span>
                      </Label>
                      <Input
                        id="ip"
                        value={controllerIp}
                        onChange={(e) => setControllerIp(e.target.value)}
                        placeholder="Optional – e.g. 192.168.1.50"
                        className="bg-background border-border"
                      />
                    </div>

                    {validationError && (
                      <div className="rounded-lg bg-destructive/10 p-3">
                        <p className="text-sm text-destructive">{validationError}</p>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="flex-row gap-2">
                    <Button onClick={handleCancelControllerDialog} variant="outline" className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddController}
                      disabled={serialNumber.trim().length < 8 || !canManageControllers}
                      className="flex-1"
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Quick Controls Section */}
        <Card className={`${settingsTheme.card} border-border`}>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Quick Controls</h2>
              {currentUserAccess === "admin" && (
                <Button
                  onClick={handleToggleQuickControlsLock}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-primary hover:text-primary/80 px-2"
                >
                  {quickControlsLocked ? "Press to Unlock" : "Press to Lock"}
                </Button>
              )}
            </div>

            {areQuickControlsDisabled && (
              <p className={`text-xs ${settingsTheme.mutedText}`}>Quick controls are locked by the administrator.</p>
            )}

            {/* Automatic Lock */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between rounded-lg ${settingsTheme.tile} p-3`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${autoLockEnabled ? "bg-accent/20" : "bg-muted"}`}>
                    <LockIcon className={`h-5 w-5 ${autoLockEnabled ? "text-accent" : settingsTheme.mutedText}`} />
                  </div>
                  <Label htmlFor="auto-lock" className="text-sm font-medium text-foreground pl-3">
                    Automatic Lock
                  </Label>
                </div>
                <Switch
                  id="auto-lock"
                  checked={autoLockEnabled}
                  onCheckedChange={handleToggleAutoLock}
                  disabled={areQuickControlsDisabled}
                  className="data-[state=unchecked]:bg-gray-700 dark:data-[state=unchecked]:bg-gray-700 data-[state=unchecked]:border-gray-400"
                />
              </div>

              {autoLockEnabled && (
                <div className={`space-y-2 rounded-lg ${settingsTheme.tile} p-3`}>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Lock Delay</Label>
                    <span className="text-sm font-semibold text-primary">{autoLockDelay}s</span>
                  </div>
                  <Slider
                    value={[autoLockDelay]}
                    onValueChange={handleAutoLockDelayChange}
                    onValueCommit={handleAutoLockDelayCommit}
                    min={5}
                    max={120}
                    step={5}
                    disabled={areQuickControlsDisabled}
                    className={`${settingsTheme.sliderTrack} *:[[role=slider]]:bg-primary *:[[role=slider]]:border-primary`}
                  />
                </div>
              )}
            </div>

            {/* Automatic Night Lock */}
            <div className="space-y-3">
              <div className={`flex items-center justify-between rounded-lg ${settingsTheme.tile} p-3`}>
                <div className="flex items-center gap-6">
                  <div className={`p-2 rounded-lg ${autoNightLockEnabled ? "bg-primary/20" : "bg-muted"}`}>
                    <LockIcon className={`h-5 w-5 ${autoNightLockEnabled ? "text-accent" : settingsTheme.mutedText}`} />
                  </div>
                  <Label htmlFor="night-lock" className="text-sm font-medium text-foreground">
                    Automatic Night Lock
                  </Label>
                </div>
                <Switch
                  id="night-lock"
                  checked={autoNightLockEnabled}
                  onCheckedChange={handleToggleAutoNightLock}
                  disabled={areQuickControlsDisabled}
                  className="data-[state=unchecked]:bg-gray-700 dark:data-[state=unchecked]:bg-gray-700 data-[state=unchecked]:border-gray-400"
                />
              </div>

              {autoNightLockEnabled && (
                <div className={`space-y-3 rounded-lg ${settingsTheme.tile} p-3`}>
                  <Label className="text-sm font-medium text-foreground text-center block">Lock Time</Label>
                  <div className="flex justify-center">
                    <CircularTimePicker
                      hour={nightLockHour}
                      minute={nightLockMinute}
                      period={nightLockPeriod}
                      onTimeChange={handleNightLockTimeChange}
                      label="Lock at"
                      disabled={areQuickControlsDisabled}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* iButton Access */}
        {canAddIButtons && (
          <Card className={`${settingsTheme.card} border-border`}>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">iButton Access</h2>

              {isListeningMode && (
                <div className="space-y-4 rounded-lg border border-primary bg-primary/10 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">Controller is in listening mode. Touch an iButton to register it.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="chip-id" className="text-sm text-foreground">
                        Chip ID
                      </Label>
                      <Input id="chip-id" value={newIButtonChipId} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ibutton-name" className="text-sm text-foreground">
                        Name
                      </Label>
                      <Input
                        id="ibutton-name"
                        value={newIButtonName}
                        onChange={(e) => handleIButtonNameChange(e.target.value)}
                        placeholder="e.g. John's key"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button onClick={saveNewIButton} className="flex-1">
                        Save iButton
                      </Button>
                      <Button onClick={cancelIButtonRegistration} variant="outline" className="flex-1 bg-transparent">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {visibleIButtonUsers.map((user) => (
                  <div key={user.id} className="py-2 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{getEntityName("ibuttons", user.id, user.name)}</p>
                        <p className={`text-sm ${settingsTheme.mutedText}`}>{user.chipId}</p>
                      </div>

                      {canRenameIButtons && canEditItem(user.createdBy, user.id) && (
                        <Button
                          onClick={() => {
                            setEditingUserId(user.id)
                            setEditingName(getEntityName("ibuttons", user.id, user.name))
                            setShowEditIButtonDialog(true)
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary"
                        >
                          <SquarePen className="h-4 w-4" />
                        </Button>
                      )}

                      {user.id !== "1" && canEditItem(user.createdBy, user.id) && (
                        <Button
                          onClick={() => setDeleteIButtonId(user.id)}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!isListeningMode && (
                <>
                  <Button
                    onClick={handleAddIButtonUser}
                    className="w-full relative flex items-center gap-2"
                    disabled={!canAddIButtons}
                  >
                    {!canAddIButtons && <LockIcon className="h-4 w-4" />}
                    Add iButton User
                  </Button>

                  {isFreeAdmin && iButtonUsers.length >= 1 && (
                    <p className={`text-sm ${settingsTheme.mutedText}`}>Get trial or premium to add more iButtons.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* App Users */}
        {(canAddAppUsers || canRenameAppUsers) && (
          <Card className={`${settingsTheme.card} border-border`}>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">App Users</h2>

              <div className="space-y-2">
                {visibleAppUsers.map((user) => (
                  <div key={user.id} className="py-2 border-b last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{getAppUserDisplayName(user)}</p>
                        <p className={`text-sm ${settingsTheme.mutedText}`}>
                          {user.email} • {user.access === "admin" ? "Admin" : user.access === "full" ? "Full Access" : "Open/Close Only"}
                          {user.status === "invited"
                            ? ` • Invited by ${user.createdByRole === "full" ? "Full Access" : "Admin"} on ${formatCreatedAt(user.createdAt)}`
                            : " • Active"}
                        </p>
                      </div>

                      {user.id !== "1" && canRenameAppUsers && canEditItem(user.createdBy, user.id) && (
                        <>
                          <Button
                            onClick={() => {
                              setEditingUserId(user.id)
                              setEditingName(getAppUserDisplayName(user))
                              setEditingUserAccess(user.access === "open-close" ? "open-close" : "full")
                              setShowEditAppUserDialog(true)
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary"
                          >
                            <SquarePen className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAppUserId(user.id)}
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleOpenInviteDialog}
                className="w-full relative flex items-center gap-2"
                disabled={!canAddMoreAppUsers}
              >
                {!canAddMoreAppUsers && <LockIcon className="h-4 w-4" />}
                Add User
              </Button>

              {isFreeAdmin && (
                <p className={`text-sm ${settingsTheme.mutedText}`}>Get trial or premium to add app users.</p>
              )}
            </CardContent>
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
        inactiveTextClassName={settingsTheme.bottomNavInactiveText}
      />

      {/* dialogs */}
      <AlertDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trial or Premium Required</AlertDialogTitle>
            <AlertDialogDescription>Trial or Premium required to add more users or iButtons.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onNavigate("subscription")}>Get Trial / Premium</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEditIButtonDialog} onOpenChange={setShowEditIButtonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit iButton Name</AlertDialogTitle>
            <AlertDialogDescription>Enter a new name for this iButton.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={editingName || ""} onChange={(e) => setEditingName(e.target.value)} placeholder="iButton name" className="my-4" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveIButtonName}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEditAppUserDialog} onOpenChange={setShowEditAppUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit App User</AlertDialogTitle>
            <AlertDialogDescription>Update the user name and access level.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 my-4">
            <Input value={editingName || ""} onChange={(e) => setEditingName(e.target.value)} placeholder="User name" />
            {editingUserId && appUsers.find((u) => u.id === editingUserId)?.email && (
              <Input value={appUsers.find((u) => u.id === editingUserId)?.email || ""} disabled className="opacity-50 cursor-not-allowed" />
            )}

            <Select value={editingUserAccess} onValueChange={(val) => setEditingUserAccess(val === "open-close" ? "open-close" : "full")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {canShowFullInEdit && <SelectItem value="full">Full Access</SelectItem>}
                <SelectItem value="open-close">Open/Close Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const editedAppUser = editingUserId ? appUsers.find((u) => u.id === editingUserId) : undefined
                const previousName = editedAppUser && editingUserId ? getEntityName("appusers", editingUserId, editedAppUser.name) : ""
                const nextName = editingName?.trim() || editedAppUser?.name || "Unnamed user"

                handleSaveAppUserName()
                if (editingUserId) updateAppUserAccess(editingUserId, editingUserAccess)

                if (editedAppUser) {
                  logSettingsActivity(
                    "App user edited",
                    "app-user-edited",
                    `App user name changed from "${previousName || "Unnamed user"}" to "${nextName}" (${editedAppUser.email}, ${getAccessLabel(editingUserAccess)})`,
                  )
                }

                setShowEditAppUserDialog(false)
              }}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showInviteAppUserDialog} onOpenChange={setShowInviteAppUserDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Invite New User</DialogTitle>
            <DialogDescription>Enter user details and choose access level.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Name</label>
              <Input value={inviteUserName} onChange={(e) => setInviteUserName(e.target.value)} placeholder="Enter user name" />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input type="email" value={inviteUserEmail} onChange={(e) => setInviteUserEmail(e.target.value)} placeholder="user@example.com" />
            </div>

            {currentUserAccess !== "full" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Access Level</Label>

                <Select
                  value={inviteUserAccess}
                  onValueChange={(value) => setInviteUserAccess(value === "full" ? "full" : "open-close")}
                >
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-card border-border">
                    {isAdmin && canCreateFullAccessAccount() && (
                      <SelectItem value="full" className="text-foreground">
                        Full Access
                      </SelectItem>
                    )}
                    <SelectItem value="open-close" className="text-foreground">
                      Open/Close Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogCancel>Cancel</DialogCancel>
            <DialogAction disabled={!canSendInvitation || !canAddMoreAppUsers} onClick={handleSendInvitation}>
              Send Invitation
            </DialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteIButtonId !== null} onOpenChange={() => setDeleteIButtonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete iButton</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the iButton {iButtonToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteIButtonId && handleDeleteIButton(deleteIButtonId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteAppUserId !== null} onOpenChange={() => setDeleteAppUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete App User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the app user {appUserToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAppUserId && handleDeleteAppUser(deleteAppUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRestartConfirmDialog} onOpenChange={setShowRestartConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart Controller</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restart the controller? This will temporarily disconnect all devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestart}>Restart</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
