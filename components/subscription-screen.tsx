"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, Zap } from "lucide-react"
import type { Screen } from "@/app/page"
import { AppBottomNav } from "@/components/app-bottom-nav"

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
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className="text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Activity</h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
          <Zap className="h-10 w-10 text-primary" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Upgrade to Premium</h2>
          <p className="text-muted-foreground">Unlock all features and take full control</p>
        </div>

        {!isOnTrial && (
          <Card className="bg-card border-border p-6 w-full max-w-md space-y-4">
            <div className="text-center space-y-2">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl font-bold text-accent">30 days free Trial</span>
              </div>
              <p className="text-xs text-muted-foreground">No payment required. Try all premium features.</p>
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

        <Card className="bg-card border-border p-6 w-full max-w-md space-y-4">
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
