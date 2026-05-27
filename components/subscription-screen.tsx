"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Zap } from "lucide-react"
import type { Screen } from "@/app/page"
import { AppBottomNav } from "@/components/app-bottom-nav"
import { VisibilityThemeSelector } from "@/components/visibility-theme-selector"

type SubscriptionVisibilityTheme = "dark" | "soft" | "day"

const SUBSCRIPTION_VISIBILITY_THEMES: SubscriptionVisibilityTheme[] = ["dark", "soft", "day"]

const SUBSCRIPTION_VISIBILITY_THEME_CLASSES: Record<
  SubscriptionVisibilityTheme,
  {
    card: string
    header: string
    mutedText: string
    bottomNavInactiveText: string
    swatch: string
  }
> = {
  dark: {
    card: "bg-card",
    header: "bg-card",
    mutedText: "text-muted-foreground",
    bottomNavInactiveText: "text-muted-foreground",
    swatch: "bg-black",
  },
  soft: {
    card: "bg-[#232b3a]",
    header: "bg-[#232b3a]",
    mutedText: "text-gray-300",
    bottomNavInactiveText: "text-gray-300",
    swatch: "bg-[linear-gradient(135deg,#111827_0%,#111827_50%,#ffffff_50%,#ffffff_100%)]",
  },
  day: {
    card: "bg-[#2d374c]",
    header: "bg-[#2d374c]",
    mutedText: "text-gray-200",
    bottomNavInactiveText: "text-gray-100",
    swatch: "bg-white",
  },
}

interface SubscriptionScreenProps {
  onNavigate: (screen: Screen) => void
  onUpgrade: () => void
  onActivateFreeTrial: () => void
  isOnTrial: boolean
}

export default function SubscriptionScreen({
  onNavigate,
  onUpgrade,
  onActivateFreeTrial,
  isOnTrial,
}: SubscriptionScreenProps) {
  const [visibilityTheme, setVisibilityTheme] = useState<SubscriptionVisibilityTheme>(() => {
    if (typeof window === "undefined") return "soft"

    const storedTheme = window.localStorage.getItem("homeVisibilityTheme")
    if (storedTheme === "dark" || storedTheme === "soft" || storedTheme === "day") {
      return storedTheme
    }

    return "soft"
  })

  const handleVisibilityThemeChange = (theme: SubscriptionVisibilityTheme) => {
    setVisibilityTheme(theme)
    window.localStorage.setItem("homeVisibilityTheme", theme)
  }

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "homeVisibilityTheme") return

      const nextTheme = event.newValue
      if (nextTheme === "dark" || nextTheme === "soft" || nextTheme === "day") {
        setVisibilityTheme(nextTheme)
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
    }
  }, [])

  const subscriptionTheme = SUBSCRIPTION_VISIBILITY_THEME_CLASSES[visibilityTheme]

  const benefits = [
    "Unlimited iButton access",
    "Add multiple app users",
    "Full activity log history",
    "Advanced analytics and charts",
    "Priority customer support",
    "Up to 10 scenes per user",
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <div className={`${subscriptionTheme.header} border-b border-border p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("dashboard")}
              className="text-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Activity</h1>
          </div>

          <VisibilityThemeSelector
            themes={SUBSCRIPTION_VISIBILITY_THEMES}
            value={visibilityTheme}
            themeClasses={SUBSCRIPTION_VISIBILITY_THEME_CLASSES}
            onChange={handleVisibilityThemeChange}
            ariaLabel="Activity visibility theme"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
          <Zap className="h-10 w-10 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Upgrade to Premium</h2>
          <p className={subscriptionTheme.mutedText}>Unlock all features and take full control</p>
        </div>

        {!isOnTrial && (
          <Card className={`${subscriptionTheme.card} border-border p-6 w-full max-w-md space-y-4`}>
            <div className="text-center space-y-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl font-bold text-accent">30 days free Trial</span>
              </div>
              <p className={`text-xs ${subscriptionTheme.mutedText}`}>No payment required. Try all premium features.</p>
            </div>

            <Button
              onClick={onActivateFreeTrial}
              variant="outline"
              className="w-full !border !border-accent text-accent hover:bg-accent/10 h-12 text-base font-semibold bg-transparent"
            >
              Start Free Trial
            </Button>
          </Card>
        )}

        <Card className={`${subscriptionTheme.card} border-border p-6 w-full max-w-md space-y-4`}>
          <h3 className="text-lg font-semibold text-foreground">Premium Benefits</h3>
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 mt-0.5">
                  <Check className="h-3 w-3 text-accent" />
                </div>
                <p className="text-sm text-foreground flex-1">{benefit}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-card border-border p-6 w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">2.99 €</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-xs text-muted-foreground">Cancel anytime. No commitments.</p>
          </div>

          <Button
            onClick={() => onNavigate("premium-payment")}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 h-12 text-base font-semibold"
          >
            Get Premium
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By subscribing, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>

      <AppBottomNav
        currentScreen="subscription"
        onNavigate={onNavigate}
        hasPlan={false}
      />
    </div>
  )
}
