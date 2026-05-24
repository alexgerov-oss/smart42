"use client"

import { useState } from "react"
import LoginScreen from "@/components/login-screen"
import RegisterScreen from "@/components/register-screen"
import DashboardScreen from "@/components/dashboard-screen"
import ActivityLogScreen from "@/components/activity-log-screen"
import SettingsScreen from "@/components/settings-screen"
import ProfileScreen from "@/components/profile-screen"
import SubscriptionScreen from "@/components/subscription-screen"
import PremiumPaymentScreen from "@/components/premium-payment-screen"
import PaymentProcessingScreen from "@/components/payment-processing-screen"
import ChartScreen from "@/components/chart-screen"
import ScenesScreen from "@/components/scenes-screen"
import { useAppContext } from "@/lib/app-context"

export type Screen =
  | "login"
  | "register"
  | "dashboard"
  | "activity-log"
  | "settings"
  | "profile"
  | "subscription"
  | "premium-payment"
  | "payment"
  | "chart"
  | "scenes"

function scrollTop() {
  // ✅ "auto" е валиден за TS (за разлика от "instant")
  window.scrollTo({ top: 0, behavior: "auto" })
}

export default function Home() {
  const { currentUserAccess } = useAppContext()

  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [adminPurchasedPremium, setAdminPurchasedPremium] = useState(false)
  const [premiumExpiry, setPremiumExpiry] = useState<string>("")
  const [trialStartDate, setTrialStartDate] = useState<string>("")
  const [chartMetric, setChartMetric] = useState<string>("")
  const [doorName, setDoorName] = useState("Main Door")

  const getRemainingTrialDays = (): number | null => {
    if (!trialStartDate) return null
    const now = new Date()
    const startDate = new Date(trialStartDate)
    const expiryDate = new Date(startDate)
    expiryDate.setDate(expiryDate.getDate() + 30)
    const remainingMs = expiryDate.getTime() - now.getTime()
    return Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)))
  }

  // ✅ смятаме веднъж на render (една истина)
  const remainingTrialDays = getRemainingTrialDays()
  const isTrialExpired = remainingTrialDays !== null && remainingTrialDays === 0
  const isOnTrial = Boolean(trialStartDate) && !isTrialExpired && !adminPurchasedPremium

  // ✅ единствената истина за plan
  const hasPlan = adminPurchasedPremium || isOnTrial

  const handleLogin = () => {
    setCurrentScreen("dashboard")
    scrollTop()
  }

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen)
    scrollTop()
  }

  const handleShowChart = (metric: string) => {
    setChartMetric(metric)
    setCurrentScreen("chart")
    scrollTop()
  }

  const handleActivateFreeTrial = () => {
    const now = new Date()
    setTrialStartDate(now.toISOString())

    const expiryDate = new Date(now)
    expiryDate.setDate(expiryDate.getDate() + 30)
    setPremiumExpiry(expiryDate.toLocaleDateString())

    setCurrentScreen("dashboard")
    scrollTop()
  }

  const handleUpgradeToPremium = () => {
    setAdminPurchasedPremium(true)
    setTrialStartDate("") // Clear trial when upgrading to full premium

    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    setPremiumExpiry(expiryDate.toLocaleDateString())

    setCurrentScreen("dashboard")
    scrollTop()
  }

  return (
    <div className="dark min-h-screen bg-background">
      {currentScreen === "login" && <LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />}
      {currentScreen === "register" && <RegisterScreen onNavigate={handleNavigate} />}

      {currentScreen === "dashboard" && (
        <DashboardScreen
          onNavigate={handleNavigate}
          hasPlan={hasPlan}
          premiumExpiry={premiumExpiry}
          isOnTrial={isOnTrial}
          remainingTrialDays={remainingTrialDays}
          onShowChart={handleShowChart}
          doorName={doorName}
          setDoorName={setDoorName}
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === "activity-log" && (
        <ActivityLogScreen
          onNavigate={handleNavigate}
          hasPlan={hasPlan}
          doorName={doorName}
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === "settings" && (
        <SettingsScreen
          onNavigate={handleNavigate}
          hasPlan={hasPlan}
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === "profile" && (
        <ProfileScreen
          onNavigate={handleNavigate}
          premiumExpiry={premiumExpiry}
          isOnTrial={isOnTrial}
          remainingTrialDays={remainingTrialDays}
          currentScreen={currentScreen}
          hasPlan={hasPlan}
        />
      )}

      {currentScreen === "subscription" && (
        <SubscriptionScreen
          onNavigate={handleNavigate}
          onUpgrade={() => handleNavigate("premium-payment")}
          onActivateFreeTrial={handleActivateFreeTrial}
          isOnTrial={isOnTrial}
        />
      )}

      {currentScreen === "premium-payment" && (
        <PremiumPaymentScreen
          onNavigate={handleNavigate}
          onActivateFreeTrial={handleActivateFreeTrial}
          onProceedToPayment={() => handleNavigate("payment")}
          isOnTrial={isOnTrial}
        />
      )}

      {currentScreen === "payment" && (
        <PaymentProcessingScreen onNavigate={handleNavigate} onConfirmPayment={handleUpgradeToPremium} />
      )}

      {currentScreen === "chart" && (
        <ChartScreen
          metric={chartMetric}
          onBack={() => handleNavigate("dashboard")}
          onNavigate={handleNavigate}
          hasPlan={hasPlan}
          currentScreen={currentScreen}
        />
      )}

      {currentUserAccess !== "open-close" && currentScreen === "scenes" && (
        <ScenesScreen
          doorName={doorName}
          onNavigate={handleNavigate}
          hasPlan={hasPlan}
          currentScreen={currentScreen}
        />
      )}
    </div>
  )
}
