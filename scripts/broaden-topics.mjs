// Broaden each researcher's topic keywords so they also match generic method
// queries ("I need a bioinformatician") — not just narrow system-specific ones
// ("plant gene co-expression networks").
//
// Reads researchers.json, sends each record's current topics + summary to Haiku
// with instructions to return 6-10 keywords mixing specific research terms with
// broad method/field terms. Preserves specific terms, adds general ones.

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
if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }

const args = process.argv.slice(2)
const LIMIT = args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1], 10) : Infinity
const CONCURRENCY = 10
const CHECKPOINT_EVERY = 25

const client = new Anthropic()
const researchers = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const targets = researchers.filter((r) => r.topics && r.topics.length > 0).slice(0, LIMIT)

console.log(`Broadening topics for ${targets.length} researchers`)

const cleanCites = (s) => String(s || '').replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '').replace(/\s+/g, ' ').trim()

async function broadenOne(r) {
  try {
    const prompt = `You are expanding research profile keywords for a collaboration directory. Users search with broad queries like "I need a bioinformatician" or "someone who does microscopy" — but current keywords are too narrow (domain-specific only), so those queries miss good matches.

Researcher: ${r.name}
Title: ${r.title} · ${r.department || ''} @ ${r.institution}
Current topics: ${r.topics.join(' · ')}
${r.summary ? `Summary: ${r.summary}` : ''}

TASK: Return 8-12 topic keywords. The list MUST be a mix of:
  (a) 3-5 BROAD-FIELD / METHOD terms — the umbrella disciplines and techniques this researcher uses. Examples: "bioinformatics", "machine learning", "structural biology", "microbiology", "evolutionary genomics", "protein engineering", "synthetic biology", "cell biology", "genomics", "biochemistry", "immunology", "electron microscopy", "mass spectrometry", "X-ray crystallography", "NMR spectroscopy", "computational modeling", "statistical genetics", "ecology", "plant biology", "cancer biology", "neuroscience"
  (b) 4-7 SPECIFIC terms — keep the informative organism/system/question-level terms from the current list. Examples: "legume symbiosis", "glucosinolate biosynthesis", "CRISPR screens", "single-cell transcriptomics"

Crucial: A user searching for a general field ("bioinformatics", "microbiology") MUST find this person if they actually use those fields/methods. Do not omit the broad terms.

Rules:
- 1-4 words per keyword, lowercase unless proper noun. No sentences.
- NO vague words: "research", "biology" (alone), "science", "life sciences", "studies".
- Only add fields/methods the researcher ACTUALLY uses (don't guess).
- Deduplicate.

Respond with ONLY valid JSON:
{"topics": ["...", "..."]}`

    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    let out = resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim()
    out = out.replace(/^```(?:json)?\s*/, '').replace(/\s*```\s*$/, '').trim()
    const objMatch = out.match(/\{[\s\S]*\}/)
    if (objMatch) out = objMatch[0]

    const parsed = JSON.parse(out)
    const topics = Array.isArray(parsed.topics)
      ? parsed.topics.map((t) => cleanCites(t)).filter((t) => t && t.length < 60).slice(0, 10)
      : []

    if (topics.length < 4) throw new Error('too few topics')

    r.topics = topics
    return { ok: true, name: r.name, n: topics.length }
  } catch (err) {
    return { ok: false, name: r.name, error: String(err.message || err).slice(0, 150) }
  }
}

let done = 0, okCount = 0, failCount = 0
const save = () => writeFileSync(DATA_PATH, JSON.stringify(researchers, null, 2))

async function worker(queue) {
  while (queue.length > 0) {
    const r = queue.shift()
    if (!r) break
    const res = await broadenOne(r)
    done++
    if (res.ok) {
      okCount++
      if (done % 20 === 0) console.log(`[${done}/${targets.length}] ${res.name} · ${okCount} ok, ${failCount} failed`)
    } else {
      failCount++
      console.log(`[${done}/${targets.length}] ✗ ${res.name}: ${res.error}`)
    }
    if (done % CHECKPOINT_EVERY === 0) save()
  }
}

const queue = [...targets]
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)))
save()
console.log(`\nDone. ${okCount} broadened, ${failCount} failed.`)
