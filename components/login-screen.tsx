"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock } from "lucide-react"
import { useAppContext } from "@/lib/app-context"

interface LoginScreenProps {
  onLogin: () => void
  onNavigate: (screen: "register") => void
}

export default function LoginScreen({ onLogin, onNavigate }: LoginScreenProps) {
  const { sessionPassword, setSessionPassword } = useAppContext()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loginError, setLoginError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionPassword) {
      // First login - accept any password and store it
      setSessionPassword(password)
      onLogin()
    } else {
      // Subsequent login - validate against stored password
      if (password === sessionPassword) {
        onLogin()
      } else {
        setLoginError("Incorrect password")
      }
    }
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSendResetEmail = () => {
    setShowConfirmation(true)
    setTimeout(() => {
      setShowConfirmation(false)
      setShowForgotPassword(false)
      setResetEmail("")
    }, 3000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-2 ring-primary/50">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SmartDoor</h1>
          <p className="text-sm text-muted-foreground">Control System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (loginError) setLoginError("")
                }}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                required
              />
              {loginError && <p className="text-xs text-destructive">{loginError}</p>}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
          >
            Login
          </Button>

          <div className="space-y-3 text-center text-sm">
            {!showForgotPassword && !showConfirmation && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
            )}

            {showForgotPassword && !showConfirmation && (
              <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-foreground text-left block">
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={!isValidEmail(resetEmail)}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmail("")
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {showConfirmation && (
              <div className="p-3 border border-primary/50 rounded-lg bg-primary/10 text-primary">
                Please check your email.
              </div>
            )}

            <div className="text-muted-foreground">
              {"Don't have an account? "}
              <button
                type="button"
                onClick={() => onNavigate("register")}
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Register
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
