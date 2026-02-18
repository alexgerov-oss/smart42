// lib/plan.ts

export type PlanState = {
  hasPlan: boolean
  isTrialExpired: boolean
  isTrialActive: boolean
}

export function computePlanState(args: {
  isOnTrial?: boolean
  remainingTrialDays?: number | null
  adminHasActiveSubscription?: boolean
}): PlanState {
  const isOnTrial = Boolean(args.isOnTrial)
  const adminHasActiveSubscription = Boolean(args.adminHasActiveSubscription)

  const isTrialExpired =
    args.remainingTrialDays !== null &&
    args.remainingTrialDays !== undefined &&
    args.remainingTrialDays <= 0

  const isTrialActive = isOnTrial && !isTrialExpired

  // ✅ единствена истина: plan = subscription OR active trial
  const hasPlan = adminHasActiveSubscription || isTrialActive

  return { hasPlan, isTrialExpired, isTrialActive }
}
