"use client"

import { useState } from "react"

export function useSessionState() {
  const [sessionPassword, setSessionPassword] = useState<string>("")
  return { sessionPassword, setSessionPassword }
}
