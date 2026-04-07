import { hc } from 'hono/client'
import type { AppType } from '../../src-worker'

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8787')

export const api = hc<AppType>(baseUrl) as ReturnType<typeof hc<any>>

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
