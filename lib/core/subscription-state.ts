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

const ADMIN_ROLE: AccessRole = "admin"

// NOTE:
// subscription/trial са “на системата” (admin-owned). Няма нужда от currentUserAccess тук.
export function useSubscriptionState() {
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

  // Derived
  const trialDaysLeftValue = useMemo(() => trialDaysLeft(trial), [trial])

  const hasPlan = useMemo(() => {
    const hasTrial = trialDaysLeftValue > 0
    const hasPremium = adminHasPremium(ADMIN_ROLE, premium)
    return FORCE_SUBSCRIPTION || hasTrial || hasPremium
  }, [trialDaysLeftValue, premium])

  return {
    trial,
    setTrial,
    premium,
    setPremium,
    trialDaysLeft: trialDaysLeftValue,

    // ✅ new unified name
    hasPlan,

    // ✅ kept temporarily so older wiring doesn't break
    adminHasActiveSubscription: hasPlan,
  }
}
