import { hc } from 'hono/client'
import type { AppType } from '../../src-worker'

function resolveBaseUrl() {
  const fallback =
    typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8787'

  const raw = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!raw) return fallback

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  // If protocol is omitted, infer it to avoid path-relative URL bugs.
  if (/^(localhost|127\.0\.0\.1|\[::1\]|\d+\.\d+\.\d+\.\d+)(:\d+)?(\/.*)?$/i.test(raw)) {
    return `http://${raw}`
  }

  return `https://${raw}`
}

const baseUrl = resolveBaseUrl()

function getAuthHeaders(): Record<string, string> {
  try {
    const saved = localStorage.getItem('auth_user')
    if (!saved) return {}
    const user = JSON.parse(saved) as { id?: string }
    if (user?.id) return { 'X-User-Id': user.id }
  } catch {
    // ignore parse errors
  }
  return {}
}

export const api = hc<AppType>(baseUrl, {
  fetch: (input: RequestInfo | URL, options: RequestInit = {}) => {
    const headers = new Headers(options.headers)
    const authHeaders = getAuthHeaders()
    for (const [key, value] of Object.entries(authHeaders)) {
      headers.set(key, value)
    }
    return fetch(input, { ...options, headers })
  },
}) as ReturnType<typeof hc<any>>

export async function unwrapJson<T>(response: Response): Promise<T> {
  const rawBody = await response.text()
  const contentType = response.headers.get('content-type') || ''

  const payload =
    rawBody && contentType.includes('application/json')
      ? (JSON.parse(rawBody) as unknown)
      : null

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : rawBody || `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return (payload ?? {}) as T
}
