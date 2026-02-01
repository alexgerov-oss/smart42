"use client"

import { useState } from "react"

export function useSystemStatusState(initial = true) {
  const [isSystemStatusExpanded, setIsSystemStatusExpanded] = useState<boolean>(initial)
  return { isSystemStatusExpanded, setIsSystemStatusExpanded }
}
