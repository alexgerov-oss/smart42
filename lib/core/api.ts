// lib/core/api.ts
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "string") return err
  return "Unknown error"
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    // If you have NEXT_PUBLIC_API_URL use it, else default to same-origin.
    this.baseUrl = baseUrl ?? (process.env.NEXT_PUBLIC_API_URL || "")
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
    const url = this.baseUrl ? `${this.baseUrl}${path}` : path

    try {
      const res = await fetch(url, {
        method: options.method ?? "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
        },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
      })

      // Try read JSON; if not JSON, fallback to text
      const contentType = res.headers.get("content-type") || ""
      const isJson = contentType.includes("application/json")

      const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)

      if (!res.ok) {
        const message =
          (payload && typeof payload === "object" && "error" in payload && typeof (payload as any).error === "string"
            ? (payload as any).error
            : typeof payload === "string" && payload
              ? payload
              : `Request failed (${res.status})`) || `Request failed (${res.status})`

        return { ok: false, error: message }
      }

      return { ok: true, data: payload as T }
    } catch (e) {
      return { ok: false, error: safeErrorMessage(e) }
    }
  }
}

// Single shared instance
export const api = new ApiClient()

// ---- Convenience functions (you'll add more as we discover endpoints) ----

// Example placeholders you can wire later:
export const Api = {
  // health check example
  health: () => api.request<{ status: "ok" }>("/api/health"),

  // door actions - placeholders (we will match to your backend routes)
  lockDoor: (doorId: string) => api.request<{ success: true }>("/api/doors/lock", { method: "POST", body: { doorId } }),
  unlockDoor: (doorId: string) =>
    api.request<{ success: true }>("/api/doors/unlock", { method: "POST", body: { doorId } }),
} as const
