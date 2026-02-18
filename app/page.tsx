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

export default function Home() {
  const { currentUserAccess } = useAppContext()
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [adminPurchasedPremium, setAdminPurchasedPremium] = useState(false)
  const [premiumExpiry, setPremiumExpiry] = useState<string>("")
  const [trialStartDate, setTrialStartDate] = useState<string>("")
  const [chartMetric, setChartMetric] = useState<string>("")
  const [doorName, setDoorName] = useState("Main Door")

  const handleLogin = () => {
    setCurrentScreen("dashboard")
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const handleNavigate = (screen: Screen) => {
    if (currentUserAccess === "full" && !canCreateFullAccessAccount()) {
      return
    }
    setCurrentScreen(screen)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const handleShowChart = (metric: string) => {
    setChartMetric(metric)
    setCurrentScreen("chart")
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const handleActivateFreeTrial = () => {
    const now = new Date()
    setTrialStartDate(now.toISOString())

    const expiryDate = new Date(now)
    expiryDate.setDate(expiryDate.getDate() + 30)
    setPremiumExpiry(expiryDate.toLocaleDateString())

    setCurrentScreen("dashboard")
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const handleUpgradeToPremium = () => {
    setAdminPurchasedPremium(true)
    setTrialStartDate("") // Clear trial when upgrading to full premium

    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    setPremiumExpiry(expiryDate.toLocaleDateString())

    setCurrentScreen("dashboard")
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const getRemainingTrialDays = (): number | null => {
    if (!trialStartDate) return null
    const now = new Date()
    const startDate = new Date(trialStartDate)
    const expiryDate = new Date(startDate)
    expiryDate.setDate(expiryDate.getDate() + 30)
    const remainingMs = expiryDate.getTime() - now.getTime()
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)))
    return remainingDays
  }

  const isTrialExpired = (): boolean => {
    const remainingDays = getRemainingTrialDays()
    return remainingDays !== null && remainingDays === 0
  }

  const canCreateFullAccessAccount = () => {
    // Implement logic to check if the account can be created by Admin
    return true
  }

  return (
    <div className="dark min-h-screen bg-background">
      <PremiumProvider
        adminPurchasedPremium={adminPurchasedPremium}
        premiumExpiry={premiumExpiry}
        trialStartDate={trialStartDate}
        isTrialExpired={isTrialExpired()}
        remainingTrialDays={getRemainingTrialDays()}
        currentScreen={currentScreen}
        chartMetric={chartMetric}
        handleNavigate={handleNavigate}
        handleShowChart={handleShowChart}
        handleUpgradeToPremium={handleUpgradeToPremium}
        handleActivateFreeTrial={handleActivateFreeTrial}
        doorName={doorName}
        setDoorName={setDoorName}
        handleLogin={handleLogin}
        currentUserAccess={currentUserAccess}
      />
    </div>
  )
}

function PremiumProvider({
  adminPurchasedPremium,
  premiumExpiry,
  trialStartDate,
  isTrialExpired,
  remainingTrialDays,
  currentScreen,
  chartMetric,
  handleNavigate,
  handleShowChart,
  handleUpgradeToPremium,
  handleActivateFreeTrial,
  doorName,
  setDoorName,
  handleLogin,
  currentUserAccess,
}: {
  adminPurchasedPremium: boolean
  premiumExpiry: string
  trialStartDate: string
  isTrialExpired: boolean
  remainingTrialDays: number | null
  currentScreen: Screen
  chartMetric: string
  handleNavigate: (screen: Screen) => void
  handleShowChart: (metric: string) => void
  handleUpgradeToPremium: () => void
  handleActivateFreeTrial: () => void
  doorName: string
  setDoorName: (name: string) => void
  handleLogin: () => void
  currentUserAccess: string
}) {
  // ✅ always boolean
  const isOnTrial = Boolean(trialStartDate) && !isTrialExpired && !adminPurchasedPremium
  const adminHasActiveSubscription = adminPurchasedPremium || isOnTrial

  // ✅ REAL plan flag (used by Permissions + AppBottomNav)
  const hasPlan = adminHasActiveSubscription

  // Note: in this app "isPremium" is used as "premium-like access" (open-close/full are treated as allowed).
  const isPremium =
    currentUserAccess === "open-close" ||
    currentUserAccess === "full" ||
    (currentUserAccess === "admin" && adminHasActiveSubscription)

  return (
    <>
      {currentScreen === "login" && <LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />}
      {currentScreen === "register" && <RegisterScreen onNavigate={handleNavigate} />}

      {currentScreen === "dashboard" && (
        <DashboardScreen
          onNavigate={handleNavigate}
          isPremium={isPremium}
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
          isPremium={isPremium}
          doorName={doorName}
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === "settings" && (
        <SettingsScreen
          onNavigate={handleNavigate}
          isPremium={isPremium}
          currentScreen={currentScreen}
          isOnTrial={isOnTrial}
          isTrialExpired={isTrialExpired}
          adminHasActiveSubscription={adminHasActiveSubscription}
        />
      )}

      {currentScreen === "profile" && (
        <ProfileScreen
          onNavigate={handleNavigate}
          isPremium={isPremium}
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
          onBack={() => {
            handleNavigate("dashboard")
            window.scrollTo({ top: 0, behavior: "instant" })
          }}
          onNavigate={handleNavigate}
          isPremium={isPremium}
          hasPlan={hasPlan}
          isOnTrial={isOnTrial}
          remainingTrialDays={remainingTrialDays}
          currentScreen={currentScreen}
        />
      )}

      {currentUserAccess !== "open-close" && currentScreen === "scenes" && (
        <ScenesScreen
          doorName={doorName}
          onNavigate={handleNavigate}
          isPremium={isPremium}
          currentScreen={currentScreen}
        />
      )}
    </>
  )
}
