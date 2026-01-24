/**
 * Get WiFi signal color based on dBm thresholds
 * Uses CSS custom properties for consistent theming
 */
export function getWifiColor(signal: number): string {
  if (signal >= -50) return "var(--color-wifi-excellent)" // Excellent: Blue
  if (signal >= -80) return "var(--color-wifi-strong)" // Strong: Green
  if (signal >= -100) return "var(--color-wifi-medium)" // Medium: Yellow
  return "var(--color-wifi-weak)" // Weak: Red
}

/**
 * Get WiFi signal Tailwind class based on dBm thresholds
 */
export function getWifiClass(signal: number): string {
  if (signal >= -50) return "[color:var(--color-wifi-excellent)]"
  if (signal >= -80) return "[color:var(--color-wifi-strong)]"
  if (signal >= -100) return "[color:var(--color-wifi-medium)]"
  return "[color:var(--color-wifi-weak)]"
}

/**
 * Get door status color
 */
export function getDoorStatusColor(status: "lock" | "unlock" | "open" | "closed"): string {
  const colorMap = {
    lock: "var(--color-status-lock)",
    unlock: "var(--color-status-unlock)",
    open: "var(--color-status-open)",
    closed: "var(--color-status-closed)",
  }
  return colorMap[status]
}

/**
 * Get door status Tailwind class
 */
export function getDoorStatusClass(status: "lock" | "unlock" | "open" | "closed"): string {
  const classMap = {
    lock: "[color:var(--color-status-lock)]",
    unlock: "[color:var(--color-status-unlock)]",
    open: "[color:var(--color-status-open)]",
    closed: "[color:var(--color-status-closed)]",
  }
  return classMap[status]
}

/**
 * Sanity check: Validate color tokens are defined
 */
export function validateColorTokens(): void {
  if (typeof window === "undefined") return

  const root = getComputedStyle(document.documentElement)
  const lockColor = root.getPropertyValue("--color-status-lock").trim()
  const unlockColor = root.getPropertyValue("--color-status-unlock").trim()

  if (!lockColor || !unlockColor || lockColor === unlockColor) {
    console.error("[v0] Color token validation failed: lock and unlock colors must be different")
    console.error("[v0] Falling back to safe defaults")
  }
}
