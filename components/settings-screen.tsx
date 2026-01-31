"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Info,
  LockIcon,
  Home,
  Activity,
  SettingsIcon,
  Layers,
  UserIcon,
  Trash2,
  SquarePen,
} from "lucide-react"
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

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void
  isPremium: boolean
  currentScreen: Screen
  isOnTrial?: boolean
  isTrialExpired?: boolean
  adminHasActiveSubscription?: boolean
}

export default function SettingsScreen({
  onNavigate,
  isPremium,
  currentScreen,
  isOnTrial = false,
  isTrialExpired = false,
  adminHasActiveSubscription = false,
}: SettingsScreenProps) {
  const [showControllerDialog, setShowControllerDialog] = useState(false)
  const [serialNumber, setSerialNumber] = useState("")
  const [controllerIp, setControllerIp] = useState("")
  const [showControllerInfo, setShowControllerInfo] = useState(false)
  const [editingControllerId, setEditingControllerId] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string>("")
  const [showPremiumDialog, setShowPremiumDialog] = useState(false)
  const [showEditIButtonDialog, setShowEditIButtonDialog] = useState(false)
  const [showEditAppUserDialog, setShowEditAppUserDialog] = useState(false)
  const [showInviteAppUserDialog, setShowInviteAppUserDialog] = useState(false)
  const [inviteUserName, setInviteUserName] = useState("")
  const [inviteUserEmail, setInviteUserEmail] = useState("")
  const [inviteUserAccess, setInviteUserAccess] = useState<"full" | "open-close">("full")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string | null>(null)
  const [editingUserAccess, setEditingUserAccess] = useState<"full" | "open-close">("full")
  const [isListeningMode, setIsListeningMode] = useState(false)
  const [newIButtonChipId, setNewIButtonChipId] = useState("A1F3-C92D")
  const [newIButtonName, setNewIButtonName] = useState("")
  const [registeringIButtonId, setRegisteringIButtonId] = useState<string | null>(null)
  const [restartTimeoutId, setRestartTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [restartPendingConfirmation, setRestartPendingConfirmation] = useState(false)
  const [showRestartConfirmDialog, setShowRestartConfirmDialog] = useState(false)
  const [deleteIButtonId, setDeleteIButtonId] = useState<string | null>(null)
  const [deleteAppUserId, setDeleteAppUserId] = useState<string | null>(null)

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
    userName,
    iButtonUsers,
    appUsers,
    updateIButtonUser,
    updateAppUser,
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
    getEntityName,
    setEntityName,
    canCreateFullAccessAccount,
    isFullAccessUserActivated,
    canFullAccessAddUsers,
  } = useAppContext()

  const controller = getActiveController()

  const isAdmin = currentUserAccess === "admin"

  // Permission context with proper trial/premium information
  const permissionContext: PermissionContext = {
    currentUserAccess,
    adminHasActiveSubscription: adminHasActiveSubscription || isPremium,
    isTrialActive: isOnTrial,
    isTrialExpired: isTrialExpired,
  }

  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canManageControllers = Permissions.canManageControllers(permissionContext)
  const canAddAppUsers = Permissions.canAddAppUsers(permissionContext)
  const canAddIButtons = Permissions.canAddIButtons(permissionContext)
  const canRenameIButtons = Permissions.canRenameIButtons(permissionContext)
  const canRenameAppUsers = Permissions.canRenameAppUsers(permissionContext)

  // Use centralized permission check
  // Note: canAddAppUsers already handles the logic

  const isFreeAdmin = currentUserAccess === "admin" && !isPremium
  const canAddIButton = isFreeAdmin ? iButtonUsers.length === 0 : true

  const visibleIButtonUsers =
    currentUserAccess === "admin"
      ? iButtonUsers // Admin sees all
      : iButtonUsers.filter((user) => user.createdBy === currentUserAccess) // Full access sees only their own

  const visibleAppUsers =
    currentUserAccess === "admin"
      ? appUsers // Admin sees all
      : appUsers.filter((user) => user.createdBy === currentUserAccess) // Full access sees only their own

  const canEditItem = (itemCreatedBy: "admin" | "full" | "open-close", itemId?: string) => {
    if (currentUserAccess === "admin") return true

    // Full Access cannot edit/delete their own default user (id: "2")
    if (currentUserAccess === "full" && itemId === "2") return false

    return itemCreatedBy === currentUserAccess
  }

  const getActiveTab = () => {
    if (currentScreen === "dashboard") return "home"
    if (currentScreen === "activity-log") return "activity-log"
    if (currentScreen === "scenes") return "scenes"
    if (currentScreen === "settings") return "settings"
    if (currentScreen === "profile") return "profile"
    return "settings"
  }

  const activeTab = getActiveTab()

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

  const handleSaveController = () => {
    setValidationError("")

    if (!serialNumber.trim()) {
      setValidationError("Serial number is required")
      return
    }

    const success = editingControllerId
      ? updateController(editingControllerId, serialNumber, controllerIp)
      : addController(serialNumber, controllerIp)

    if (!success) {
      setValidationError(
        editingControllerId
          ? "Invalid serial number or serial already exists"
          : "Invalid serial number (8-20 alphanumeric characters) or serial already exists",
      )
      return
    }

    setShowControllerDialog(false)
    setSerialNumber("")
    setControllerIp("")
    setEditingControllerId(null)
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

  useEffect(() => {
    return () => {
      if (restartTimeoutId) {
        clearTimeout(restartTimeoutId)
      }
    }
  }, [restartTimeoutId])

  const handleRestartClick = () => {
    if (!controller) return
    setShowRestartConfirmDialog(true)
  }

  const confirmRestart = () => {
    if (!controller) return
    restartController(controller.id)
    setShowRestartConfirmDialog(false)
  }

  const simulateIButtonRegistration = () => {
    if (controllers.length === 0) {
      toast({
        title: "No controller found",
        description: "Please add a controller first",
        variant: "destructive",
      })
      return
    }

    if (currentUserAccess === "open-close" && iButtonUsers.length >= 1) {
      toast({
        title: "iButton Limit Reached",
        description:
          "Users with Open/Close Only access can add only one iButton. Upgrade to Premium for unlimited access.",
        variant: "default",
      })
      return
    }

    // Create the iButton entry immediately
    const newId = addIButtonUser()
    setRegisteringIButtonId(newId)
    setIsListeningMode(true)
    setNewIButtonChipId("A1F3-C92D")
    setNewIButtonName("")
  }

  const handleIButtonNameChange = (name: string) => {
    setNewIButtonName(name)
    if (registeringIButtonId) {
      updateIButtonUser(registeringIButtonId, name || "Unnamed iButton")
    }
  }

  const saveNewIButton = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }

    if (newIButtonName.trim() || registeringIButtonId) {
      const finalName = newIButtonName.trim() || "Unnamed iButton"
      if (registeringIButtonId) {
        updateIButtonUser(registeringIButtonId, finalName)
      }
    }
    setIsListeningMode(false)
    setNewIButtonName("")
    setRegisteringIButtonId(null)
  }

  const cancelIButtonRegistration = () => {
    if (registeringIButtonId) {
      removeIButtonUser(registeringIButtonId)
    }
    setIsListeningMode(false)
    setNewIButtonName("")
    setRegisteringIButtonId(null)
  }

  const handleOpenInviteDialog = () => {
    setInviteUserName("")
    setInviteUserEmail("")
    setInviteUserAccess(currentUserAccess === "full" ? "open-close" : "full")
    setShowInviteAppUserDialog(true)
  }

  const handleSendInvitation = () => {
    if (!canAddAppUsers) {
      // Default to restrictive - silently abort if permission check fails
      return
    }

    if (!canSendInvitation) return

    const finalAccess = currentUserAccess === "full" ? "open-close" : inviteUserAccess

    if (finalAccess === "full") {
      if (currentUserAccess !== "admin") {
        toast({
          title: "Access Denied",
          description: "Only Admin can create Full Access users.",
          variant: "destructive",
        })
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

    addAppUser(inviteUserName.trim(), inviteUserEmail.trim(), finalAccess)
    setInviteUserName("")
    setInviteUserEmail("")
    setInviteUserAccess("full")
    setShowInviteAppUserDialog(false)
    toast({
      title: "Invitation sent",
      description: "The user will receive an email to join.",
    })
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const canSendInvitation =
    inviteUserName.trim() !== "" && inviteUserEmail.trim() !== "" && isValidEmail(inviteUserEmail.trim())

  const getAppUserDisplayName = (user: {
    id: string
    name: string
    ownerDisplayName?: string
    adminOverrideName?: string
  }) => {
    // Use per-user name override if exists
    return getEntityName("appusers", user.id, user.name)
  }

  const handleDeleteIButton = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    removeIButtonUser(id)
    setDeleteIButtonId(null)
  }

  const handleDeleteAppUser = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    removeAppUser(id)
    setDeleteAppUserId(null)
  }

  const iButtonToDelete = iButtonUsers.find((u) => u.id === deleteIButtonId)
  const appUserToDelete = appUsers.find((u) => u.id === deleteAppUserId)

  const handleToggleQuickControlsLock = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    setQuickControlsLocked(!quickControlsLocked)
  }

  const areQuickControlsDisabled = quickControlsLocked

  const handleSaveIButtonName = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }

    if (editingUserId && editingName) {
      setEntityName("ibuttons", editingUserId, editingName)
      // Remove the global name update - each user sees their own local version
      // updateIButtonUser(editingUserId, editingName) // REMOVED
    }
    setShowEditIButtonDialog(false)
    setEditingUserId(null)
    setEditingName(null)
  }

  const handleSaveAppUserName = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }

    if (editingUserId && editingName) {
      setEntityName("appusers", editingUserId, editingName)
      // REMOVED: updateAppUser(editingUserId, editingName) - this would update the global name
    }
    setShowEditAppUserDialog(false)
    setEditingUserId(null)
    setEditingName(null)
  }

  const handleAddIButtonUser = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }

    if (isFreeAdmin && iButtonUsers.length >= 1) {
      toast({
        title: "Upgrade Required",
        description: "Upgrade to add more iButtons.",
        variant: "destructive",
      })
      return
    }

    const newId = addIButtonUser()
    setRegisteringIButtonId(newId)
    setIsListeningMode(true)
    setNewIButtonChipId("A1F3-C92D")
    setNewIButtonName("")
  }

  const handleToggleAutoLock = (checked: boolean) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    setAutoLockEnabled(checked)
  }

  const handleAutoLockDelayChange = (value: number[]) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    setAutoLockDelay(value[0])
  }

  const handleToggleAutoNightLock = (checked: boolean) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    setAutoNightLockEnabled(checked)
  }

  const handleNightLockTimeChange = (hour: string, minute: string, period: "AM" | "PM") => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    setNightLockHour(hour)
    setNightLockMinute(minute)
    setNightLockPeriod(period)
  }

  const handleAddController = () => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }

    if (editingControllerId) {
      const success = updateController(editingControllerId, serialNumber, controllerIp)
      if (!success) {
        setValidationError("Invalid serial number or duplicate found")
        return
      }
    } else {
      const success = addController(serialNumber, controllerIp)
      if (!success) {
        setValidationError("Invalid serial number or duplicate found")
        return
      }
    }

    setSerialNumber("")
    setControllerIp("")
    setShowControllerDialog(false)
    setEditingControllerId(null)
    setValidationError("")
  }

  const handleRestartController = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    setShowRestartConfirmDialog(true)
  }

  const handleDeleteController = (id: string) => {
    if (currentUserAccess === "full" && !isFullAccessUserActivated()) {
      return
    }
    removeController(id)
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="bg-black border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className="text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="flex-1 space-y-4 p-4 pb-6">
        {/* Controller Section */}
        {canManageControllers && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Controller</h2>
                {controller && (
                  <Button
                    onClick={() => handleRestartController(controller.id)}
                    variant="ghost"
                    size="sm"
                    disabled={!isAdmin || controller.isRestarting}
                  >
                    Restart
                  </Button>
                )}
              </div>

              {!canManageControllers && (
                <div className="flex items-start gap-2 rounded-lg border border-muted bg-muted/50 p-3">
                  <LockIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Controller management is available for Admin only</p>
                </div>
              )}

              {controller && (
                <div className="rounded-lg bg-background p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Serial number</p>
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
                          <span className="text-xs text-muted-foreground capitalize">{controller.status}</span>
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
                      <p className="text-xs text-muted-foreground">IP Address</p>
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
                      <p className="text-xs text-muted-foreground">≥8 alphanumeric characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ip" className="text-sm font-medium">
                        Controller IP <span className="text-muted-foreground text-xs">(Optional)</span>
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
        <Card className="border-border">
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
              <p className="text-xs text-muted-foreground">Quick controls are locked by the administrator.</p>
            )}

            {/* Automatic Lock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${autoLockEnabled ? "bg-accent/20" : "bg-muted"}`}>
                    <LockIcon className={`h-5 w-5 ${autoLockEnabled ? "text-accent" : "text-muted-foreground"}`} />
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
                  className="data-[state=unchecked]:bg-gray-500"
                />
              </div>

              {autoLockEnabled && (
                <div className="space-y-2 rounded-lg bg-background p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Lock Delay</Label>
                    <span className="text-sm font-semibold text-primary">{autoLockDelay}s</span>
                  </div>
                  <Slider
                    value={[autoLockDelay]}
                    onValueChange={handleAutoLockDelayChange}
                    min={5}
                    max={120}
                    step={5}
                    disabled={areQuickControlsDisabled}
                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  />
                </div>
              )}
            </div>

            {/* Automatic Night Lock */}
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-background p-3">
                <div className="flex items-center gap-6">
                  <div className={`p-2 rounded-lg ${autoNightLockEnabled ? "bg-primary/20" : "bg-muted"}`}>
                    <LockIcon
                      className={`h-5 w-5 ${autoNightLockEnabled ? "text-primary" : "text-muted-foreground"}`}
                    />
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
                  className="data-[state=unchecked]:bg-gray-500"
                />
              </div>

              {autoNightLockEnabled && (
                <div className="space-y-3 rounded-lg bg-background p-3">
                  <Label className="text-sm font-medium text-foreground text-center block">Lock Time</Label>

                  <div className="flex justify-center">
                    <CircularTimePicker
                      hour={nightLockHour}
                      minute={nightLockMinute}
                      period={nightLockPeriod}
                      onTimeChange={(h, m, p) => {
                        handleNightLockTimeChange(h, m, p)
                      }}
                      label="Lock at"
                      disabled={areQuickControlsDisabled}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* iButton Access Section */}
        {canAddIButtons && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">iButton Access</h2>

              {isListeningMode && (
                <div className="space-y-4 rounded-lg border border-primary bg-primary/10 p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">
                      Controller is in listening mode. Touch an iButton to register it.
                    </p>
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
                        <p className="text-sm text-muted-foreground">{user.chipId}</p>
                        {isAdmin && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Added by: {user.createdByName} • {new Date(user.createdAt).toLocaleDateString()}{" "}
                            {new Date(user.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
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
                    <p className="text-sm text-muted-foreground">Upgrade to add more iButtons.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* App Users Section */}
        {(canAddAppUsers || canRenameAppUsers) && (
          <Card className="border-border">
            <CardContent className="p-4 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">App Users</h2>

              <div className="space-y-2">
                {visibleAppUsers.map((user) => {
                  const displayName = getAppUserDisplayName(user)
                  return (
                    <div key={user.id} className="py-2 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{getAppUserDisplayName(user)}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email} •{" "}
                            {user.access === "admin"
                              ? "Admin"
                              : user.access === "full"
                                ? "Full Access"
                                : "Open/Close Only"}
                            {user.status === "invited" ? " • Invited" : " • Active"}
                          </p>
                          {isAdmin && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Created by: {user.createdByName} • {new Date(user.createdAt).toLocaleDateString()}{" "}
                              {new Date(user.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                        {user.id !== "1" && canRenameAppUsers && canEditItem(user.createdBy, user.id) && (
                          <>
                            <Button
                              onClick={() => {
                                setEditingUserId(user.id)
                                setEditingName(getAppUserDisplayName(user))
                                setEditingUserAccess(user.access === "admin" ? "full" : user.access)
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
                  )
                })}
              </div>

              <Button
                onClick={handleOpenInviteDialog}
                className="w-full relative flex items-center gap-2"
                disabled={!canAddAppUsers}
              >
                {!canAddAppUsers && <LockIcon className="h-4 w-4" />}
                Add User
              </Button>

              {currentUserAccess === "admin" && !isPremium && (
                <p className="text-sm text-muted-foreground">Upgrade to add app users.</p>
              )}
            </CardContent>
          </Card>
        )}
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
              if (isPremium) {
                onNavigate("activity-log")
              } else {
                onNavigate("subscription")
              }
              window.scrollTo({ top: 0, behavior: "instant" })
            }}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              activeTab === "activity-log" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <Activity className="h-6 w-6" />
              {!isPremium && <LockIcon className="h-3 w-3 absolute -top-1 -right-1 text-primary" />}
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
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === "settings" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <SettingsIcon className="h-6 w-6" />
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
            <UserIcon className="h-6 w-6" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      <AlertDialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Premium Required</AlertDialogTitle>
            <AlertDialogDescription>Premium required to add more users or iButtons.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onNavigate("subscription")}>Get Premium</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showEditIButtonDialog} onOpenChange={setShowEditIButtonDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit iButton Name</AlertDialogTitle>
            <AlertDialogDescription>Enter a new name for this iButton.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={editingName || ""}
            onChange={(e) => setEditingName(e.target.value)}
            placeholder="iButton name"
            className="my-4"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleSaveIButtonName()
              }}
            >
              Save
            </AlertDialogAction>
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
              <Input
                value={appUsers.find((u) => u.id === editingUserId)?.email || ""}
                disabled
                className="opacity-50 cursor-not-allowed"
              />
            )}
            <Select
              value={editingUserAccess}
              onValueChange={(val) => setEditingUserAccess(val as "full" | "open-close")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Access</SelectItem>
                <SelectItem value="open-close">Open/Close Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleSaveAppUserName()
                updateAppUserAccess(editingUserId!, editingUserAccess)
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
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Name</label>
              <Input
                value={inviteUserName}
                onChange={(e) => setInviteUserName(e.target.value)}
                placeholder="Enter user name"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input
                type="email"
                value={inviteUserEmail}
                onChange={(e) => setInviteUserEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            {currentUserAccess !== "full" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Access Level</Label>
                <Select value={inviteUserAccess} onValueChange={(value: any) => setInviteUserAccess(value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="full" className="text-foreground">
                      Full Access
                    </SelectItem>
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
            <DialogAction disabled={!canSendInvitation} onClick={handleSendInvitation}>
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
