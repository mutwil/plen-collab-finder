import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { loadResearchers } from '@/lib/researchers'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 })
  }

  const ip = getClientIp(req)
  const rl = rateLimit(`proposal:1h:${ip}`, { max: 20, windowMs: 3_600_000 })
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 })
  }

  let body: { query?: string; ids?: string[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const query = String(body.query || '').trim()
  const ids = Array.isArray(body.ids) ? body.ids.map(String).slice(0, 8) : []
  if (!query) return NextResponse.json({ ok: false, error: 'Missing query' }, { status: 400 })
  if (ids.length === 0) return NextResponse.json({ ok: false, error: 'No researchers selected' }, { status: 400 })

  const all = loadResearchers()
  const picked = ids.map((id) => all.find((r) => r.id === id)).filter(Boolean)
  if (picked.length === 0) return NextResponse.json({ ok: false, error: 'None of the IDs were valid' }, { status: 400 })

  const digest = picked.map((r) => ({
    name: r!.name,
    title: r!.title,
    dept: r!.department,
    inst: r!.institution,
    topics: r!.topics,
    summary: r!.summary,
  }))

  const prompt = `You are helping a researcher write a short rationale for a collaborative research project or grant application.

Project idea:
"""
${query}
"""

Proposed collaborators:
${JSON.stringify(digest, null, 2)}

TASK: Write a single paragraph (150-220 words) that:
- Explains the project's scientific vision briefly
- Identifies the specific, complementary expertise each named collaborator brings
- Makes clear why these particular people together are well-suited to the project
- Avoids filler and marketing language

Mention each collaborator by last name (e.g. "Andersen's expertise in..."). Do not invent capabilities not evident from their topics/summary. Be direct and concrete.

Respond with ONLY the paragraph, no headers, no markdown.`

  const client = new Anthropic({ apiKey })
  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
    return NextResponse.json({ ok: true, text })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'LLM error' }, { status: 500 })
  }
}
