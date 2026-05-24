"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserIcon, Mail, LockIcon, Zap, Send } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Screen } from "@/app/page"
import { useAppContext } from "@/lib/app-context"
import { Permissions, type PermissionContext } from "@/lib/permissions"
import { AppBottomNav } from "@/components/app-bottom-nav"
import { useToast } from "@/hooks/use-toast"

type AccessLevel = "admin" | "full" | "open-close" | "none" | string

interface ProfileScreenProps {
  onNavigate: (screen: Screen) => void
  premiumExpiry: string
  isOnTrial: boolean
  remainingTrialDays: number | null
  currentScreen: Screen
  hasPlan: boolean
}

export default function ProfileScreen({
  onNavigate,
  premiumExpiry,
  isOnTrial,
  remainingTrialDays,
  currentScreen,
  hasPlan,
}: ProfileScreenProps) {
  const {
    userName,
    setUserName,
    userEmail,
    setUserEmail,
    currentUserAccess,
    setCurrentUserAccess,
    appUsers,
    sessionPassword,
    setSessionPassword,
  } = useAppContext()

  const access = currentUserAccess as AccessLevel
  const { toast } = useToast()

  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  const [tempName, setTempName] = useState("")
  const [tempEmail1, setTempEmail1] = useState("")
  const [tempEmail2, setTempEmail2] = useState("")
  const [emailChangePassword, setEmailChangePassword] = useState("")
  const [emailChangePasswordError, setEmailChangePasswordError] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [tempPassword1, setTempPassword1] = useState("")
  const [tempPassword2, setTempPassword2] = useState("")

  const [supportCategory, setSupportCategory] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [supportSubmitted, setSupportSubmitted] = useState(false)

  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const displayName = userName
  const displayEmail = userEmail

  const isTrialExpired = remainingTrialDays !== null && remainingTrialDays === 0

  const permissionContext: PermissionContext = {
    currentUserAccess,
    hasPlan,
  }
  

  const canAccessActivity = Permissions.canAccessActivity(permissionContext)
  const canAccessScenes = Permissions.canAccessScenes(permissionContext)
  const canAccessSettings = Permissions.canAccessSettings(permissionContext)

  const validateEmailFormat = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleAccessChange = (value: "admin" | "full" | "open-close") => {
    if (value === "full") {
      const fullAccessUserExists = appUsers.some((user) => user.access === "full")

      if (!hasPlan) {
        toast({
          title: "Full Access locked",
          description: "Get trial or premium to use Full Access.",
          variant: "destructive",
        })
        return
      }

      if (!fullAccessUserExists) {
        toast({
          title: "Full Access unavailable",
          description: "Admin must add a Full Access user first.",
          variant: "destructive",
        })
        return
      }
    }

    setCurrentUserAccess(value)
  }

  const handleSaveName = () => {
    if (tempName.trim()) setUserName(tempName)
    setIsEditingName(false)
    setTempName("")
  }

  const handleSaveEmail = () => {
    if (!validateEmailFormat(tempEmail1)) {
      setEmailError("Invalid email format")
      return
    }
    if (tempEmail1 !== tempEmail2) {
      setEmailError("Emails do not match")
      return
    }
    if (!emailChangePassword.trim()) {
      setEmailChangePasswordError("Current password is required.")
      return
    }
    if (emailChangePassword !== sessionPassword) {
      setEmailChangePasswordError("Incorrect password")
      return
    }

    if (tempEmail1.trim()) setUserEmail(tempEmail1)

    setIsEditingEmail(false)
    setTempEmail1("")
    setTempEmail2("")
    setEmailChangePassword("")
    setEmailChangePasswordError("")
    setEmailError("")
  }

  const handleSavePassword = () => {
    if (!currentPassword) {
      setPasswordError("Current password is required")
      return
    }
    if (currentPassword !== sessionPassword) {
      setPasswordError("Incorrect current password")
      return
    }
    if (tempPassword1 !== tempPassword2) {
      setPasswordError("Passwords do not match")
      return
    }
    if (tempPassword1.trim()) setSessionPassword(tempPassword1)

    setIsEditingPassword(false)
    setCurrentPassword("")
    setTempPassword1("")
    setTempPassword2("")
    setPasswordError("")
  }

  const handleSubmitSupport = () => {
    if (!supportCategory || supportMessage.length < 100) return

    // TODO: send support ticket to backend
    setSupportSubmitted(true)

    setSupportCategory("")
    setSupportMessage("")

    setTimeout(() => setSupportSubmitted(false), 5000)
  }

  const characterCount = supportMessage.length
  const remainingChars = Math.max(0, 100 - characterCount)
  const isMessageValid = characterCount >= 100

  const canAccessSupport = access === "admin"

  // ✅ render functions (NOT components) to satisfy react-hooks/static-components
  const renderContactCard = () => (
    <Card className="bg-card border-border p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Name</Label>
            {!isEditingName && (
              <Button
                onClick={() => {
                  setTempName(displayName)
                  setIsEditingName(true)
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-auto py-1 px-2"
              >
                Edit
              </Button>
            )}
          </div>

          {isEditingName ? (
            <div className="space-y-2">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter name"
                className="w-full"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={() => setIsEditingName(false)} variant="outline" size="sm" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveName} size="sm" className="flex-1">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-background p-3">
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">{displayName}</p>
              </div>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Email</Label>
            {!isEditingEmail && (
              <Button
                onClick={() => {
                  setTempEmail1("")
                  setTempEmail2("")
                  setEmailChangePassword("")
                  setEmailChangePasswordError("")
                  setEmailError("")
                  setIsEditingEmail(true)
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-auto py-1 px-2"
              >
                Edit
              </Button>
            )}
          </div>

          {isEditingEmail ? (
            <div className="space-y-2">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">New Email</Label>
                  <Input
                    type="email"
                    value={tempEmail1}
                    onChange={(e) => {
                      setTempEmail1(e.target.value)
                      if (emailError) setEmailError("")
                    }}
                    placeholder="Enter new email"
                    className="w-full"
                    autoFocus
                  />
                  {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Confirm New Email</Label>
                  <Input
                    type="text"
                    inputMode="email"
                    value={tempEmail2}
                    onChange={(e) => setTempEmail2(e.target.value)}
                    placeholder="Confirm new email"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Current Password</Label>
                  <Input
                    type="password"
                    value={emailChangePassword}
                    onChange={(e) => {
                      setEmailChangePassword(e.target.value)
                      if (emailChangePasswordError) setEmailChangePasswordError("")
                    }}
                    placeholder="Enter current password"
                    className="w-full"
                  />
                  {emailChangePasswordError && <p className="text-xs text-destructive">{emailChangePasswordError}</p>}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => {
                    setIsEditingEmail(false)
                    setTempEmail1("")
                    setTempEmail2("")
                    setEmailChangePassword("")
                    setEmailChangePasswordError("")
                    setEmailError("")
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEmail} size="sm" className="flex-1">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-background p-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground break-all">{displayEmail}</p>
              </div>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Password</Label>
            {!isEditingPassword && (
              <Button
                onClick={() => {
                  setCurrentPassword("")
                  setTempPassword1("")
                  setTempPassword2("")
                  setPasswordError("")
                  setIsEditingPassword(true)
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-auto py-1 px-2"
              >
                Edit
              </Button>
            )}
          </div>

          {isEditingPassword ? (
            <div className="space-y-2">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Current Password</Label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">New Password</Label>
                  <Input
                    type="password"
                    value={tempPassword1}
                    onChange={(e) => {
                      setTempPassword1(e.target.value)
                      if (passwordError) setPasswordError("")
                    }}
                    placeholder="New password"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={tempPassword2}
                    onChange={(e) => setTempPassword2(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full"
                  />
                  {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => {
                    setIsEditingPassword(false)
                    setCurrentPassword("")
                    setTempPassword1("")
                    setTempPassword2("")
                    setPasswordError("")
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSavePassword} size="sm" className="flex-1">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-background p-3">
              <div className="flex items-center gap-3">
                <LockIcon className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )

  const renderAccessTestingCard = () => (
    <Card className="bg-card border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Access Level (Testing)</h3>
      <p className="text-xs text-muted-foreground">Switch between access levels to test UI behavior</p>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Current Access</Label>
        <Select value={currentUserAccess} onValueChange={handleAccessChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="full">Full access</SelectItem>
            <SelectItem value="open-close">Open / Close only</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  )

  const renderLogoutCard = () => (
    <Card className="bg-card border-border p-4 space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Account Actions</h3>
      <Button
        onClick={() => onNavigate("login")}
        variant="outline"
        className="w-full justify-start text-destructive border-border hover:text-destructive bg-transparent"
      >
        Logout
      </Button>
    </Card>
  )

  const renderHeaderProfileCard = () => (
    <Card className="bg-card border-border p-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
          <UserIcon className="h-12 w-12 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">{displayName}</h2>

          {access === "admin" ? (
            hasPlan ? (
              <div className="space-y-1">
                {isOnTrial && remainingTrialDays !== null ? (
                  <>
                    <p className="text-sm font-semibold text-yellow-500">Trial version</p>
                    <p className="text-xs text-gray-400">{remainingTrialDays} days left</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-yellow-500">Member</p>
                    <p className="text-xs text-muted-foreground">Valid until: {premiumExpiry}</p>
                  </>
                )}
                <div className="mt-3 rounded-lg bg-background border border-border p-3 text-left">
                  <p className="text-xs text-blue-500 leading-relaxed">
                    Admin role: full control over controller, users, iButtons, scenes and system settings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Free user</p>
                <div className="mt-2 rounded-lg bg-background border border-border p-3 text-left">
                  <p className="text-xs text-blue-500 leading-relaxed">
                    Admin role: full control over controller, users, iButtons, scenes and system settings.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => onNavigate("subscription")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Get Premium
                  </Button>
                </div>
              </div>
            )
          ) : hasPlan ? (
            <div className="space-y-1">
              {isOnTrial && remainingTrialDays !== null ? (
                <>
                  <p className="text-sm font-semibold text-yellow-500">Trial version</p>
                  <p className="text-xs text-gray-400">{remainingTrialDays} days left</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-yellow-500">Member</p>
                  <p className="text-xs text-muted-foreground">Valid until: {premiumExpiry}</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Free user</p>
              <div className="flex justify-center">
                <Button
                  onClick={() => onNavigate("subscription")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Get Premium
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("dashboard")} className="text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </div>
      </div>

      <div className="flex-1 p-4">
        {access === "admin" ? (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex-1">
                Profile
              </TabsTrigger>
              {canAccessSupport && (
                <TabsTrigger value="support" className="flex-1">
                  Support
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              {renderHeaderProfileCard()}
              {renderContactCard()}
              {renderAccessTestingCard()}
              {renderLogoutCard()}
            </TabsContent>

            {canAccessSupport && (
              <TabsContent value="support" className="space-y-4">
                <Card className="bg-card border-border p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Contact Support</h3>

                  {supportSubmitted ? (
                    <div className="text-center py-8 space-y-2">
                      <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                          <Send className="h-8 w-8 text-accent" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground px-4">
                        Your ticket has been received. We will contact you by email as soon as possible.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Issue Category</Label>
                        <Select value={supportCategory} onValueChange={(value) => setSupportCategory(value)}>
                          <SelectTrigger className="w-full [&>span]:data-placeholder:text-white">
                            <SelectValue placeholder="Select an issue category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="app">Problem with app</SelectItem>
                            <SelectItem value="ibutton">Problem with iButton</SelectItem>
                            <SelectItem value="controller">Problem with controller</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Message</Label>
                        <Textarea
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Describe your issue in detail..."
                          rows={6}
                          className="bg-background border-border resize-none"
                          autoComplete="off"
                        />
                        <p className="text-sm text-blue-500">{remainingChars} characters remaining</p>
                      </div>

                      <Button onClick={handleSubmitSupport} disabled={!supportCategory || !isMessageValid} className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Submit Ticket
                      </Button>
                    </div>
                  )}
                </Card>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <div className="space-y-4">
            {renderHeaderProfileCard()}
            {renderContactCard()}
            {renderAccessTestingCard()}
            {renderLogoutCard()}
          </div>
        )}
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
