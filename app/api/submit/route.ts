import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

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

const ALLOWED_URL_HOSTS = /(\.ku\.dk|\.dtu\.dk|\.au\.dk|\.sdu\.dk|\.ruc\.dk|\.aau\.dk|\.cbs\.dk|\.itu\.dk|findresearcher\.sdu\.dk|pure\.au\.dk|pure\.dtu\.dk|plen\.ku\.dk|drug\.ku\.dk|food\.ku\.dk|bio\.ku\.dk|biosustain\.dtu\.dk|bioengineering\.dtu\.dk|qgg\.au\.dk|mbg\.au\.dk|ecos\.au\.dk|curis\.ku\.dk|di\.ku\.dk)$/i

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

  // Rate limit: 3 submissions per IP per hour, 10 per day
  const ip = getClientIp(req)
  const hr = rateLimit(`submit:1h:${ip}`, { max: 3, windowMs: 3_600_000 })
  if (!hr.ok) {
    return NextResponse.json(
      { ok: false, error: `Too many submissions. Try again in ${Math.ceil(hr.retryAfter / 60)} min.` },
      { status: 429 },
    )
  }
  const day = rateLimit(`submit:1d:${ip}`, { max: 10, windowMs: 24 * 3_600_000 })
  if (!day.ok) {
    return NextResponse.json(
      { ok: false, error: 'Daily submission limit reached.' },
      { status: 429 },
    )
  }

  let body: SubmitBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

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

  // LLM moderation
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

Respond with ONLY valid JSON, no prose:
{"verdict": "approve" | "reject" | "needs-review", "reason": "<one sentence>", "flags": ["<any issues found>"]}

- APPROVE: plausible academic profile, URL on academic domain, professional summary, no red flags.
- NEEDS-REVIEW: borderline — vague but not malicious, unusual title, minor awkwardness.
- REJECT: profanity, hate speech, political/ideological statements, harassment, impersonation hints, URL unrelated to academia, spam/marketing, obviously fake name.`

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

  // File as GitHub Issue if configured
  const ghToken = process.env.GITHUB_TOKEN
  const ghRepo = process.env.GITHUB_REPO  // e.g. "mutwil/plen-collab-finder"
  let issueUrl: string | undefined

  if (ghToken && ghRepo) {
    const issueBody = [
      `**Submitted via /submit form** — verdict: \`${moderation.verdict}\``,
      '',
      `**Name:** ${name}`,
      `**Title:** ${title}`,
      `**Institution:** ${institution}`,
      department ? `**Department:** ${department}` : '',
      `**Profile URL:** ${url}`,
      topics.length > 0 ? `**Topics:** ${topics.join(', ')}` : '',
      summary ? `\n**Self-description:**\n${summary}` : '',
      '',
      '---',
      `**Moderation:** ${moderation.reason}`,
      moderation.flags?.length ? `**Flags:** ${moderation.flags.join(', ')}` : '',
      '',
      `_IP: ${ip.slice(0, 20)} · Time: ${new Date().toISOString()}_`,
    ].filter(Boolean).join('\n')

    try {
      const ghRes = await fetch(`https://api.github.com/repos/${ghRepo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ghToken}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'User-Agent': 'plen-collab-finder',
        },
        body: JSON.stringify({
          title: `Submission: ${name} (${moderation.verdict})`,
          body: issueBody,
          labels: ['submission', `verdict:${moderation.verdict}`],
        }),
      })
      if (ghRes.ok) {
        const data = await ghRes.json()
        issueUrl = data.html_url
      } else {
        console.error('GitHub issue create failed:', ghRes.status, await ghRes.text())
      }
    } catch (err) {
      console.error('GitHub issue create error:', err)
    }
  }

  // If no GitHub, log (Vercel filesystem is read-only)
  if (!issueUrl) {
    console.log('SUBMISSION:', JSON.stringify({ moderation, name, institution, url, issueConfigured: !!ghToken }))
  }

  return NextResponse.json({
    ok: true,
    verdict: moderation.verdict,
    message: moderation.verdict === 'approve'
      ? 'Thanks! Your submission passed auto-moderation and is queued for review.'
      : 'Thanks! Your submission was received and will be reviewed.',
    issueUrl,
  })
}
