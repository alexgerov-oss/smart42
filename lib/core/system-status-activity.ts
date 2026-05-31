import type { NewActivityLogEntry } from "@/lib/core/activity-log"

export type SystemStatusMetric =
  | "wifi"
  | "battery"
  | "cpu-temp"
  | "cpu-load"
  | "latency"
  | "power-drops"

export type SystemStatusSnapshot = Partial<Record<SystemStatusMetric, number>>

type ThresholdRule = {
  metric: SystemStatusMetric
  isBad: (value: number) => boolean
  getAction: (value: number) => string
  getDescription: (value: number) => string
}

const THRESHOLD_RULES: ThresholdRule[] = [
  {
    metric: "wifi",
    isBad: (value) => value < -80,
    getAction: () => "WiFi signal weak",
    getDescription: (value) => `WiFi signal dropped below -80 dBm • Current value: ${value} dBm`,
  },
  {
    metric: "battery",
    isBad: (value) => value < 20,
    getAction: () => "Battery low",
    getDescription: (value) => `Battery dropped below 20% • Current value: ${value}%`,
  },
  {
    metric: "cpu-temp",
    isBad: (value) => value > 75,
    getAction: () => "CPU temperature high",
    getDescription: (value) => `CPU temperature exceeded 75°C • Current value: ${value}°C`,
  },
  {
    metric: "cpu-load",
    isBad: (value) => value > 90,
    getAction: () => "CPU load high",
    getDescription: (value) => `CPU load exceeded 90% • Current value: ${value}%`,
  },
  {
    metric: "latency",
    isBad: (value) => value > 500,
    getAction: () => "Latency high",
    getDescription: (value) => `Latency exceeded 500 ms • Current value: ${value} ms`,
  },
  {
    metric: "power-drops",
    isBad: (value) => value > 0,
    getAction: () => "Power drop detected",
    getDescription: (value) => `Power drop detected • Count: ${value}`,
  },
]

export function createSystemStatusThresholdActivityEntries(args: {
  previous: SystemStatusSnapshot
  current: SystemStatusSnapshot
  doorName?: string
}): NewActivityLogEntry[] {
  const entries: NewActivityLogEntry[] = []

  for (const rule of THRESHOLD_RULES) {
    const currentValue = args.current[rule.metric]
    if (typeof currentValue !== "number") continue

    const previousValue = args.previous[rule.metric]
    const wasBad = typeof previousValue === "number" ? rule.isBad(previousValue) : false
    const isBad = rule.isBad(currentValue)

    // Log only when crossing from OK/unknown into bad state.
    // This prevents repeated Activity spam while the value remains bad.
    if (!wasBad && isBad) {
      entries.push({
        doorName: args.doorName,
        action: rule.getAction(currentValue),
        method: "System",
        user: "System",
        role: null,
        description: rule.getDescription(currentValue),
        eventType: rule.metric,
      })
    }
  }

  return entries
}
