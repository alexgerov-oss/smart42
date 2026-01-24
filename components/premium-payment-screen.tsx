"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Screen } from "@/app/page"

interface PremiumPaymentScreenProps {
  onNavigate: (screen: Screen) => void
  onActivateFreeTrial: () => void
  onProceedToPayment: () => void
  isOnTrial: boolean
}

export default function PremiumPaymentScreen({
  onNavigate,
  onActivateFreeTrial,
  onProceedToPayment,
  isOnTrial,
}: PremiumPaymentScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("subscription")}
            className="text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Premium Access</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        <p className="text-center text-muted-foreground">Unlock full functionality and advanced automation</p>

        {!isOnTrial && (
          <>
            <Card className="bg-card border-border p-6 space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Free Trial – 30 Days</h3>
                <p className="text-sm text-muted-foreground">
                  Try all premium features free for 30 days.
                  <br />
                  No payment required during the trial.
                </p>
              </div>

              <Button
                onClick={onActivateFreeTrial}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
              >
                Start Free Trial
              </Button>

              <p className="text-xs text-center text-muted-foreground">Available once per account</p>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-sm text-muted-foreground">or</span>
              </div>
            </div>
          </>
        )}

        <Card className="bg-card border-border p-6 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Premium – Monthly Plan</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-foreground">2.99 €</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          <Button
            onClick={onProceedToPayment}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 h-12 text-base font-semibold"
          >
            Proceed to Payment
          </Button>
        </Card>

        <p className="text-xs text-center text-muted-foreground px-4">
          You will be redirected to a secure payment page.
          <br />
          Payment is handled by a certified provider.
        </p>
      </div>
    </div>
  )
}
