// lib/id.ts
let fallbackCounter = 0

function bytesToHex(bytes: Uint8Array): string {
  let out = ""
  for (const b of bytes) out += b.toString(16).padStart(2, "0")
  return out
}

export function newId(prefix = ""): string {
  // Prefer crypto-based ids (no Date.now / Math.random)
  const c = globalThis.crypto as (Crypto & { randomUUID?: () => string }) | undefined

  if (typeof c?.randomUUID === "function") {
    const id = c.randomUUID()
    return prefix ? `${prefix}_${id}` : id
  }

  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    const id = bytesToHex(bytes)
    return prefix ? `${prefix}_${id}` : id
  }

  // Ultra-rare fallback (should almost never happen)
  fallbackCounter += 1
  const id = `id_${fallbackCounter}`
  return prefix ? `${prefix}_${id}` : id
}
