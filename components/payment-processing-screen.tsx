"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import type { Screen } from "@/app/page"

interface PaymentProcessingScreenProps {
  onNavigate: (screen: Screen) => void
  onConfirmPayment: () => void
}

export default function PaymentProcessingScreen({ onNavigate, onConfirmPayment }: PaymentProcessingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-card border-b border-border p-4">
        <h1 className="text-xl font-bold text-foreground text-center">Payment</h1>
      </div>

      <div className="flex-1 p-4 flex items-center justify-center">
        <Card className="bg-card border-border p-8 max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Check className="h-12 w-12 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground">Secure Payment</h2>

            <p className="text-muted-foreground">
              You will be redirected to our secure payment provider to complete your Premium subscription.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-semibold text-foreground">Premium Monthly</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">2.99 € /month</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onConfirmPayment}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
            >
              Continue to Payment Provider
            </Button>

            <Button onClick={() => onNavigate("premium-payment")} variant="outline" className="w-full h-10">
              Go Back
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Payment is securely processed by our certified payment partner. Your data is protected with
            industry-standard encryption.
          </p>
        </Card>
      </div>
    </div>
  )
}
