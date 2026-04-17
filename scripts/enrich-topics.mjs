// Enrich researchers missing topics using Anthropic web search.
// For each researcher, Claude Haiku searches the web and extracts
// 4-8 topic keywords + a short summary from their real publications/profile.
//
// Usage:
//   node scripts/enrich-topics.mjs              # process all
//   node scripts/enrich-topics.mjs --limit 20   # first N
//   node scripts/enrich-topics.mjs --retry      # also retry previously-failed

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'

const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const ENV_PATH = new URL('../.env.local', import.meta.url)

if (!process.env.ANTHROPIC_API_KEY && existsSync(ENV_PATH)) {
  for (const line of readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set')
  process.exit(1)
}

const args = process.argv.slice(2)
const LIMIT = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity
const RETRY_FAILED = args.includes('--retry')
const CONCURRENCY = 4
const CHECKPOINT_EVERY = 10

const client = new Anthropic()

const researchers = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const targets = researchers.filter((r) => {
  const needs = !r.topics || r.topics.length === 0
  if (!needs) return false
  if (r._enrichFailed && !RETRY_FAILED) return false
  return true
}).slice(0, LIMIT)

console.log(`Enriching ${targets.length} researchers using Claude web search (Haiku 4.5)`)

async function enrichOne(r) {
  try {
    const prompt = `Find research topic keywords for this academic researcher.

Name: ${r.name}
Title: ${r.title}
Department: ${r.department || '(unknown)'} at ${r.institution}
${r.url ? `Profile URL (may help): ${r.url}` : ''}

Search the web (their department page, Google Scholar, ORCID, recent publications) to understand what they actually work on. Do 1-3 searches maximum.

Then extract:
1. 4-8 short research topic keywords (2-4 words each). Focus on specific methods, systems/organisms, and research questions — avoid vague terms like "research" or "biology".
2. A 1-2 sentence summary of what they work on.

Respond with ONLY valid JSON, no prose, no markdown:
{"topics": ["...", "..."], "summary": "..."}

If you cannot find reliable information about this specific person, respond with:
{"topics": [], "summary": ""}`

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
        max_uses: 3,
      }],
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract final text block (after tool use)
    const textBlocks = resp.content.filter((b) => b.type === 'text').map((b) => b.text)
    let out = textBlocks.join('').trim()
    out = out.replace(/^```(?:json)?\s*/, '').replace(/\s*```\s*$/, '').trim()
    const objMatch = out.match(/\{[\s\S]*\}/)
    if (objMatch) out = objMatch[0]

    let parsed
    try {
      parsed = JSON.parse(out)
    } catch (e) {
      throw new Error(`parse: ${e.message}`)
    }

    const topics = Array.isArray(parsed.topics) ? parsed.topics.map(String).filter(Boolean).slice(0, 10) : []
    const summary = String(parsed.summary || '').slice(0, 600).trim()

    if (topics.length === 0 && !summary) {
      throw new Error('no info found')
    }

    r.topics = topics
    if (summary) r.summary = summary
    r.researchedAt = Date.now()
    delete r._enrichFailed
    return { ok: true, name: r.name, topics: topics.length }
  } catch (err) {
    r._enrichFailed = String(err.message || err).slice(0, 200)
    return { ok: false, name: r.name, error: r._enrichFailed }
  }
}

let done = 0, okCount = 0, failCount = 0
const save = () => writeFileSync(DATA_PATH, JSON.stringify(researchers, null, 2))

async function worker(queue) {
  while (queue.length > 0) {
    const r = queue.shift()
    if (!r) break
    const res = await enrichOne(r)
    done++
    if (res.ok) {
      okCount++
      console.log(`[${done}/${targets.length}] ✓ ${res.name} (${res.topics} topics)`)
    } else {
      failCount++
      console.log(`[${done}/${targets.length}] ✗ ${res.name}: ${res.error}`)
    }
    if (done % CHECKPOINT_EVERY === 0) {
      save()
      console.log(`  · checkpoint (${okCount} ok, ${failCount} failed)`)
    }
  }
}

const queue = [...targets]
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)))
save()

console.log(`\nDone. ${okCount} enriched, ${failCount} failed. Total with topics: ${researchers.filter((r) => r.topics?.length > 0).length}/${researchers.length}`)
