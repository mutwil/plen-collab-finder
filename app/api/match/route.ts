import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { loadResearchers } from '@/lib/researchers'
import {
  buildResearcherDigest,
  buildCompactDigest,
  buildMatchPrompt,
  parseMatchResponse,
  prefilterCandidates,
} from '@/lib/match'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rough token-budget guardrails. Claude Haiku 4.5 has a 200K input limit.
// Stay well under to leave room for the prompt wrapper and the query.
const SAFE_PROMPT_CHARS = 600_000 // ~150K tokens at 4 chars/token
const CANDIDATE_LIMIT = 250

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'ANTHROPIC_API_KEY not configured on server' }, { status: 500 })
  }

  // Rate limit
  const ip = getClientIp(req)
  const minute = rateLimit(`match:1m:${ip}`, { max: 10, windowMs: 60_000 })
  if (!minute.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many requests. Try again in ${minute.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(minute.retryAfter) } },
    )
  }
  const hour = rateLimit(`match:1h:${ip}`, { max: 50, windowMs: 3_600_000 })
  if (!hour.ok) {
    return NextResponse.json(
      { ok: false, error: `Hourly limit reached. Try again in ${Math.ceil(hour.retryAfter / 60)} min.` },
      { status: 429, headers: { 'Retry-After': String(hour.retryAfter) } },
    )
  }

  let body: { query?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const query = String(body.query || '').trim()
  if (!query) {
    return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 })
  }
  if (query.length > 2000) {
    return NextResponse.json({ ok: false, error: 'Query too long (max 2000 chars)' }, { status: 400 })
  }

  const researchers = loadResearchers()

  // Keyword pre-filter so we don't blow the token budget with the full ~1,300+ entries.
  const shortlist = prefilterCandidates(query, researchers, CANDIDATE_LIMIT)

  // Build the digest, falling back to the compact version if the full one is too big.
  let digest: Array<Record<string, unknown>> = buildResearcherDigest(shortlist)
  let prompt = buildMatchPrompt(query, digest)
  if (prompt.length > SAFE_PROMPT_CHARS) {
    digest = buildCompactDigest(shortlist)
    prompt = buildMatchPrompt(query, digest)
  }
  // Still too big → trim the shortlist further.
  if (prompt.length > SAFE_PROMPT_CHARS) {
    const trimmed = shortlist.slice(0, 150)
    digest = buildCompactDigest(trimmed)
    prompt = buildMatchPrompt(query, digest)
  }

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    const validIds = new Set(researchers.map((r) => r.id))
    const matches = parseMatchResponse(text, validIds)

    return NextResponse.json({ ok: true, matches })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LLM request failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
