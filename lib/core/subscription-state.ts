"use client"

import { useEffect, useMemo, useState } from "react"
import type { AccessRole } from "@/lib/core/types"

import type { TrialState } from "@/lib/core/trial"
import type { PremiumState } from "@/lib/core/premium"
import { loadTrial, saveTrial, trialDaysLeft, adminHasActiveTrial } from "@/lib/core/trial"
import { loadPremium, savePremium, adminHasPremium } from "@/lib/core/premium"

export function useSubscriptionState({ currentUserAccess }: { currentUserAccess: AccessRole }) {
  // Trial
  const [trial, setTrial] = useState<TrialState>(() => loadTrial())
  useEffect(() => {
    saveTrial(trial)
  }, [trial])

  // Premium
  const [premium, setPremium] = useState<PremiumState>(() => loadPremium())
  useEffect(() => {
    savePremium(premium)
  }, [premium])

  // Computed (същото като в app-context)
  const trialDaysLeftValue = useMemo(() => trialDaysLeft(trial), [trial])

  const adminHasActiveSubscription = useMemo(() => {
    return adminHasActiveTrial(currentUserAccess, trial) || adminHasPremium(currentUserAccess, premium)
  }, [currentUserAccess, trial, premium])

  return {
    trial,
    setTrial,
    premium,
    setPremium,
    trialDaysLeft: trialDaysLeftValue,
    adminHasActiveSubscription,
  }
}
