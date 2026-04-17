import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { loadResearchers } from '@/lib/researchers'
import { buildResearcherDigest, buildMatchPrompt, parseMatchResponse } from '@/lib/match'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'ANTHROPIC_API_KEY not configured on server' }, { status: 500 })
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
  const digest = buildResearcherDigest(researchers)
  const prompt = buildMatchPrompt(query, digest)

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
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
