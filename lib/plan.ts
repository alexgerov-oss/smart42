// lib/plan.ts

export type PlanState = {
    hasPlan: boolean
    isTrialExpired: boolean
    isTrialActive: boolean
  }
  
  export function computePlanState(args: {
    isPremium?: boolean
    isOnTrial?: boolean
    remainingTrialDays?: number | null
    adminHasActiveSubscription?: boolean
  }): PlanState {
    const isPremium = Boolean(args.isPremium)
    const isOnTrial = Boolean(args.isOnTrial)
    const adminHasActiveSubscription = Boolean(args.adminHasActiveSubscription)
  
    const isTrialExpired = args.remainingTrialDays !== null && args.remainingTrialDays !== undefined && args.remainingTrialDays <= 0
    const isTrialActive = isOnTrial && !isTrialExpired
  
    const hasPlan = isPremium || adminHasActiveSubscription || isTrialActive
  
    return { hasPlan, isTrialExpired, isTrialActive }
  }
  