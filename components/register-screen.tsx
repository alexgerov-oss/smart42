"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

interface RegisterScreenProps {
  onNavigate: (screen: "login") => void
}

export default function RegisterScreen({ onNavigate }: RegisterScreenProps) {
  const [fullname, setFullname] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onNavigate("login")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, onNavigate])

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!fullname || !email || !password || !confirm) {
      setError("Please fill out all fields.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    // TODO: Add your registration logic here
    setSuccess(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-2 ring-primary/50">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Join SmartDoor Control</p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-foreground">
                Full Name
              </Label>
              <Input
                id="fullname"
                type="text"
                placeholder="John Doe"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={success}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={success}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={success}
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={success}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 border border-destructive/50 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 border border-green-500/50 rounded-lg bg-green-500/10 text-center space-y-1">
                <p className="text-white text-sm font-medium">Account created successfully.</p>
                <p className="text-white/70 text-xs">
                  Please check your email and confirm your address before logging in.
                </p>
              </div>
            )}
          </div>

          {!success && (
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
            >
              Create Account
            </Button>
          )}

          {/* Go to Login */}
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate("login")}
              className="text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
