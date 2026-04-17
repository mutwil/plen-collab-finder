import type { Researcher } from './researchers'

export interface MatchResult {
  id: string
  reason: string
  score?: number
  matchedTopics?: string[]
}

export function buildResearcherDigest(researchers: Researcher[]) {
  return researchers.map((r) => ({
    id: r.id,
    name: r.name,
    dept: r.department,
    inst: r.institution,
    title: r.title,
    topics: r.topics,
    lab: r.labGroup,
    summary: r.summary,
    angles: r.collaborationAngles,
  }))
}

export function buildMatchPrompt(query: string, digest: ReturnType<typeof buildResearcherDigest>) {
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
