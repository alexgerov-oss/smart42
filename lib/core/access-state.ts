"use client"

import { useState } from "react"
import type { AccessRole } from "@/lib/core/types"

export function useAccessState(initial: AccessRole = "admin") {
  const [currentUserAccess, setCurrentUserAccess] = useState<AccessRole>(initial)
  return { currentUserAccess, setCurrentUserAccess }
}
