"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { AccessRole } from "@/lib/core/types"

import type { TrialState } from "@/lib/core/trial"
import type { PremiumState } from "@/lib/core/premium"
import { loadTrial, saveTrial, trialDaysLeft } from "@/lib/core/trial"
import { loadPremium, savePremium, adminHasPremium } from "@/lib/core/premium"

// ✅ DEV override (по желание):
// .env.local -> NEXT_PUBLIC_FORCE_SUBSCRIPTION=1
const FORCE_SUBSCRIPTION = process.env.NEXT_PUBLIC_FORCE_SUBSCRIPTION === "1"

export function useSubscriptionState({ currentUserAccess }: { currentUserAccess: AccessRole }) {
  // Trial
  const [trial, setTrial] = useState<TrialState>(() => loadTrial())
  const didInitTrial = useRef(false)
  useEffect(() => {
    if (!didInitTrial.current) {
      didInitTrial.current = true
      return
    }
    saveTrial(trial)
  }, [trial])

  // Premium
  const [premium, setPremium] = useState<PremiumState>(() => loadPremium())
  const didInitPremium = useRef(false)
  useEffect(() => {
    if (!didInitPremium.current) {
      didInitPremium.current = true
      return
    }
    savePremium(premium)
  }, [premium])

  // Computed
  const trialDaysLeftValue = useMemo(() => trialDaysLeft(trial), [trial])

  // ✅ ВАЖНО: subscription/trial е “на системата”, НЕ зависи от currentUserAccess
  // Затова НЕ използваме currentUserAccess за изчислението.
  const computed = useMemo(() => {
    const hasTrial = trialDaysLeftValue > 0
    // adminHasPremium() вероятно проверява role -> подаваме "admin", за да е стабилно
    const hasPremium = adminHasPremium("admin" as AccessRole, premium)
    return hasTrial || hasPremium
  }, [trialDaysLeftValue, premium])

  const adminHasActiveSubscription = FORCE_SUBSCRIPTION || computed

  // Debug log (можеш да го махнеш по-късно)
  useEffect(() => {
    console.log("[SUBSCRIPTION_STATE v3]", {
      currentUserAccess,
      trialDaysLeft: trialDaysLeftValue,
      computed,
      force: FORCE_SUBSCRIPTION,
      adminHasActiveSubscription,
    })
  }, [currentUserAccess, trialDaysLeftValue, computed, adminHasActiveSubscription])

  return {
    trial,
    setTrial,
    premium,
    setPremium,
    trialDaysLeft: trialDaysLeftValue,
    adminHasActiveSubscription,
  }
}
