import type { Researcher } from './researchers'

export interface MatchResult {
  id: string
  reason: string
  score?: number
  matchedTopics?: string[]
}

/**
 * Full researcher digest for the LLM ranker. Summary is truncated to
 * 350 chars so large directories still fit inside the 200K prompt budget.
 */
export function buildResearcherDigest(researchers: Researcher[]) {
  return researchers.map((r) => ({
    id: r.id,
    name: r.name,
    dept: r.department,
    inst: r.institution,
    title: r.title,
    topics: r.topics,
    lab: r.labGroup,
    summary: r.summary ? r.summary.slice(0, 350) : undefined,
    angles: r.collaborationAngles,
  }))
}

/**
 * Minimal digest — used when the directory is large enough that the full one
 * would blow the token budget. Drops summary + angles, keeps id/name/dept/topics.
 */
export function buildCompactDigest(researchers: Researcher[]) {
  return researchers.map((r) => ({
    id: r.id,
    name: r.name,
    dept: r.department,
    inst: r.institution,
    title: r.title,
    topics: r.topics,
  }))
}

/**
 * Cheap keyword-based pre-filter to shortlist candidates before sending to
 * the LLM. Tokenises the query, matches against name/topics/summary/angles/
 * dept/lab, scores by occurrence, returns the top N.
 *
 * Always returns AT LEAST `minCount` results — if scoring returns fewer than
 * that, pads with the rest in original order so the LLM sees a non-trivial set.
 */
export function prefilterCandidates(
  query: string,
  researchers: Researcher[],
  limit = 250,
  minCount = 80,
): Researcher[] {
  const STOP = new Set([
    'a','an','and','are','as','at','be','but','by','for','from','has','have','i',
    'in','is','it','its','of','on','or','that','the','to','was','were','will','with',
    'need','want','someone','working','works','who','would','like','looking','about',
    'research','find','expert','expertise','collaborator','collaborators','my','me',
  ])
  const tokens = query.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []
  const uniq = Array.from(new Set(tokens.filter((t) => !STOP.has(t))))
  if (uniq.length === 0) return researchers.slice(0, limit)

  const scored: Array<{ r: Researcher; score: number }> = []
  for (const r of researchers) {
    const hay = [
      r.name, r.title, r.department, r.institution, r.labGroup,
      r.summary, r.recentWork,
      ...(r.topics || []),
      ...(r.collaborationAngles || []),
    ].filter(Boolean).join(' ').toLowerCase()

    let score = 0
    for (const tok of uniq) {
      // Count occurrences with word-boundary to avoid partial hits
      const re = new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g')
      const matches = hay.match(re)
      if (matches) score += matches.length
    }
    if (score > 0) scored.push({ r, score })
  }

  scored.sort((a, b) => b.score - a.score)
  const shortlist = scored.slice(0, limit).map((x) => x.r)

  // If the keyword filter is too strict, pad with the rest so the LLM still
  // has a diverse pool to rank across.
  if (shortlist.length < minCount) {
    const picked = new Set(shortlist.map((r) => r.id))
    for (const r of researchers) {
      if (shortlist.length >= minCount) break
      if (!picked.has(r.id)) shortlist.push(r)
    }
  }

  return shortlist
}

export function buildMatchPrompt(query: string, digest: Array<Record<string, unknown>>) {
  return `You are helping a researcher in Denmark identify the best potential collaborators from a directory of faculty across Danish research institutions.

The user's project description:
"""
${query}
"""

Here is the directory of available researchers (JSON):
${JSON.stringify(digest)}

TASK:
Select the top 10 most relevant researchers. Rank them by genuine topical overlap with the user's project — not just keyword match. Favor researchers whose published work actually involves the relevant methods, systems, or questions. If fewer than 10 are a reasonable fit, return fewer.

For each match, also:
- List the 2-5 topics from that researcher's own topic list that most strongly match the query (matchedTopics, use the EXACT strings from their topics field, or [] if none match textually)
- Give a relevance score between 0.0 and 1.0 (1.0 = perfect fit, 0.6 = reasonable, 0.4 = marginal)

Respond with ONLY valid JSON in this exact shape, no prose, no markdown fences:
{
  "matches": [
    { "id": "<researcher.id>", "reason": "<one sentence, max 30 words, explaining WHY this person fits>", "score": 0.0, "matchedTopics": ["...", "..."] }
  ]
}`
}

export function parseMatchResponse(text: string, validIds: Set<string>): MatchResult[] {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  let parsed: { matches?: MatchResult[] }
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/)
    if (!m) return []
    try {
      parsed = JSON.parse(m[0])
    } catch {
      return []
    }
  }
  if (!Array.isArray(parsed.matches)) return []
  return parsed.matches
    .filter((m) => m && typeof m.id === 'string' && validIds.has(m.id))
    .map((m) => ({
      id: m.id,
      reason: String(m.reason || '').slice(0, 300),
      score: typeof m.score === 'number' ? Math.max(0, Math.min(1, m.score)) : undefined,
      matchedTopics: Array.isArray(m.matchedTopics)
        ? m.matchedTopics.map(String).filter(Boolean).slice(0, 6)
        : undefined,
    }))
    .slice(0, 10)
}
