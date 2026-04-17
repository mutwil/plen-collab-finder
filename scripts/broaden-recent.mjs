// Broaden topics for researchers enriched in the last hour (new batch).
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

const CUTOFF_MIN = 60
const CONCURRENCY = 10

const client = new Anthropic()
const researchers = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const cutoff = Date.now() - CUTOFF_MIN * 60_000
const targets = researchers.filter((r) => r.topics && r.topics.length > 0 && r.researchedAt && r.researchedAt > cutoff)
console.log(`Broadening ${targets.length} recently-enriched researchers`)

const cleanCites = (s) => String(s || '').replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '').replace(/\s+/g, ' ').trim()

async function broaden(r) {
  try {
    const prompt = `You are expanding research profile keywords for a collaboration directory. Users search with broad queries like "I need a bioinformatician" — but current keywords are too narrow (domain-specific only), so those queries miss good matches.

Researcher: ${r.name}
Title: ${r.title} · ${r.department || ''} @ ${r.institution}
Current topics: ${r.topics.join(' · ')}
${r.summary ? `Summary: ${r.summary}` : ''}

TASK: Return 8-12 topic keywords. The list MUST be a mix of:
  (a) 3-5 BROAD-FIELD / METHOD terms — the umbrella disciplines and techniques this researcher uses. Examples: "bioinformatics", "machine learning", "structural biology", "microbiology", "evolutionary genomics", "protein engineering", "synthetic biology", "cell biology", "genomics", "biochemistry", "immunology", "electron microscopy", "mass spectrometry", "X-ray crystallography", "NMR spectroscopy", "computational modeling", "statistical genetics", "ecology", "plant biology", "cancer biology", "neuroscience", "mathematics", "statistics", "physics", "astrophysics", "condensed matter", "climate science", "quantum physics", "geophysics"
  (b) 4-7 SPECIFIC terms — keep the informative organism/system/question-level terms.

Crucial: A user searching for a general field MUST find this person if they actually use those fields/methods. Do not omit the broad terms.

Rules:
- 1-4 words per keyword, lowercase unless proper noun. No sentences.
- NO vague words: "research", "biology" (alone), "science", "life sciences", "studies".
- Only add fields/methods the researcher ACTUALLY uses.
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
      ? parsed.topics.map((t) => cleanCites(t)).filter((t) => t && t.length < 60).slice(0, 12)
      : []
    if (topics.length < 4) throw new Error('too few')
    r.topics = topics
    return { ok: true, name: r.name }
  } catch (err) {
    return { ok: false, name: r.name, error: String(err.message || err).slice(0, 100) }
  }
}

let done = 0, ok = 0, fail = 0
const save = () => writeFileSync(DATA_PATH, JSON.stringify(researchers, null, 2))
async function worker(queue) {
  while (queue.length > 0) {
    const r = queue.shift()
    if (!r) break
    const res = await broaden(r)
    done++
    if (res.ok) ok++
    else { fail++; console.log(`[${done}/${targets.length}] ✗ ${res.name}: ${res.error}`) }
    if (done % 25 === 0) save()
  }
}
const queue = [...targets]
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)))
save()
console.log(`Done. ${ok} broadened, ${fail} failed.`)
