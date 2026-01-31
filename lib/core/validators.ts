// lib/core/validators.ts

export function validateControllerSerialNumber(serial: string): boolean {
    const trimmed = serial.trim()
    if (trimmed.length < 8) return false
    if (!/^[A-Za-z0-9-]+$/.test(trimmed)) return false
    return true
  }
  