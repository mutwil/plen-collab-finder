import { NextResponse } from 'next/server'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_INSTITUTIONS = [
  'University of Copenhagen',
  'Technical University of Denmark',
  'Aarhus University',
  'University of Southern Denmark',
  'Roskilde University',
  'Aalborg University',
  'Copenhagen Business School',
  'IT University of Copenhagen',
]

const ALLOWED_URL_HOSTS = /(\.ku\.dk|\.dtu\.dk|\.au\.dk|\.sdu\.dk|\.ruc\.dk|\.aau\.dk|\.cbs\.dk|\.itu\.dk|findresearcher\.sdu\.dk|pure\.au\.dk|pure\.dtu\.dk|plen\.ku\.dk|drug\.ku\.dk|food\.ku\.dk|bio\.ku\.dk|biosustain\.dtu\.dk|bioengineering\.dtu\.dk|qgg\.au\.dk|mbg\.au\.dk|ecos\.au\.dk)$/i

interface SubmitBody {
  name?: string
  title?: string
  department?: string
  institution?: string
  url?: string
  topics?: string[]
  summary?: string
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Server not configured' }, { status: 500 })
  }

  let body: SubmitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  // ─── Basic validation ────────────────────────────────────────
  const name = String(body.name || '').trim()
  const title = String(body.title || '').trim()
  const institution = String(body.institution || '').trim()
  const department = String(body.department || '').trim()
  const url = String(body.url || '').trim()
  const summary = String(body.summary || '').trim()
  const topics = Array.isArray(body.topics) ? body.topics.map(String).filter(Boolean).slice(0, 15) : []

  if (!name || name.length < 2 || name.length > 120) {
    return NextResponse.json({ ok: false, error: 'Name is required (2–120 chars)' }, { status: 400 })
  }
  if (!title || title.length > 100) {
    return NextResponse.json({ ok: false, error: 'Title is required (max 100 chars)' }, { status: 400 })
  }
  if (!institution || !ALLOWED_INSTITUTIONS.includes(institution)) {
    return NextResponse.json({ ok: false, error: 'Institution must be a Danish research institution' }, { status: 400 })
  }
  if (!url) {
    return NextResponse.json({ ok: false, error: 'Profile URL is required' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid URL' }, { status: 400 })
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    return NextResponse.json({ ok: false, error: 'URL must be http(s)' }, { status: 400 })
  }
  if (!ALLOWED_URL_HOSTS.test(parsedUrl.hostname)) {
    return NextResponse.json({
      ok: false,
      error: `Profile URL must be on a Danish academic domain (got ${parsedUrl.hostname})`,
    }, { status: 400 })
  }

  if (summary.length > 1500 || topics.some((t) => t.length > 80)) {
    return NextResponse.json({ ok: false, error: 'Summary or topics too long' }, { status: 400 })
  }

  // ─── LLM moderation + profile URL verification ─────────────────
  const client = new Anthropic({ apiKey })
  const moderationPrompt = `You are moderating a submission to a public directory of Danish academic researchers. Evaluate whether this submission is legitimate and safe to publish.

SUBMISSION:
- Name: ${name}
- Title: ${title}
- Institution: ${institution}
- Department: ${department || '(not provided)'}
- Profile URL: ${url}
- Topics: ${topics.join(', ') || '(not provided)'}
- Self-description: ${summary || '(not provided)'}

Check these concerns and respond with ONLY valid JSON, no prose:
{
  "verdict": "approve" | "reject" | "needs-review",
  "reason": "<one sentence explaining the verdict>",
  "flags": ["<any issues found, e.g. 'profanity', 'political statement', 'impersonation risk', 'vague topics'>"]
}

Criteria:
- APPROVE if: name looks like a real person, title is a legitimate academic rank, URL is a plausible profile page on an academic domain, summary (if present) is professional and topic-focused, no red flags.
- NEEDS-REVIEW if: anything is borderline — vague but not malicious, unusual title, minor awkwardness.
- REJECT if: profanity, hate speech, political or ideological statements unrelated to research, harassment, impersonation hints, URL looks suspicious or unrelated to academia, summary is spam/marketing, name is obviously fake.`

  let moderation: { verdict: string; reason: string; flags: string[] }
  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: moderationPrompt }],
    })
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()
      .replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    moderation = JSON.parse(text)
  } catch (err) {
    console.error('Moderation error:', err)
    return NextResponse.json({ ok: false, error: 'Could not moderate submission, please try again' }, { status: 500 })
  }

  if (moderation.verdict === 'reject') {
    return NextResponse.json({
      ok: false,
      error: `Submission rejected: ${moderation.reason}`,
      flags: moderation.flags,
    }, { status: 400 })
  }

  // ─── Write to submissions/ (pending human review) ────────────
  const submission = {
    submittedAt: new Date().toISOString(),
    moderation,
    researcher: {
      name, title, department, institution, url,
      topics: topics.length > 0 ? topics : undefined,
      summary: summary || undefined,
    },
  }

  const dir = resolve(process.cwd(), 'submissions')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const file = resolve(dir, `${Date.now()}-${slug}.json`)
  try {
    writeFileSync(file, JSON.stringify(submission, null, 2))
  } catch (err) {
    // On read-only filesystems (Vercel), fall back to logging
    console.log('SUBMISSION (could not persist):', JSON.stringify(submission))
  }

  return NextResponse.json({
    ok: true,
    verdict: moderation.verdict,
    message: moderation.verdict === 'approve'
      ? 'Thanks! Your submission passed auto-moderation and is queued for publishing.'
      : 'Thanks! Your submission needs a human review before publishing.',
  })
}
