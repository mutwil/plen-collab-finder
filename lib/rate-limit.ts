/**
 * Simple in-memory sliding-window rate limiter. Works per serverless instance
 * — imperfect across a pool of Vercel instances, but enough to deter casual
 * abuse and keep the Anthropic bill bounded.
 */

const windows = new Map<string, number[]>()

interface RateLimitOptions {
  max: number
  windowMs: number
}

export function rateLimit(key: string, { max, windowMs }: RateLimitOptions): { ok: boolean; retryAfter: number } {
  const now = Date.now()
  const arr = windows.get(key) || []
  // Drop entries outside window
  const fresh = arr.filter((t) => now - t < windowMs)
  if (fresh.length >= max) {
    const retryAfter = Math.ceil((windowMs - (now - fresh[0])) / 1000)
    windows.set(key, fresh)
    return { ok: false, retryAfter }
  }
  fresh.push(now)
  windows.set(key, fresh)
  // Cleanup map periodically
  if (windows.size > 10_000) {
    for (const [k, v] of windows) {
      if (v[v.length - 1] && now - v[v.length - 1] > windowMs * 2) windows.delete(k)
    }
  }
  return { ok: true, retryAfter: 0 }
}

export function getClientIp(req: Request): string {
  const h = req.headers
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = h.get('x-real-ip')
  if (real) return real
  return 'unknown'
}
