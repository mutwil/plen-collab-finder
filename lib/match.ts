import type { Researcher } from './researchers'

export interface MatchResult {
  id: string
  reason: string
}

/**
 * Build a compact table of researchers to send to the LLM for matching.
 * Omits noisy fields to keep token usage low.
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

Respond with ONLY valid JSON in this exact shape, no prose, no markdown fences:
{
  "matches": [
    { "id": "<researcher.id>", "reason": "<one sentence, max 30 words, explaining WHY this person fits>" }
  ]
}`
}

export function parseMatchResponse(text: string, validIds: Set<string>): MatchResult[] {
  // Strip markdown fences if the model added them
  const cleaned = text.trim().replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  let parsed: { matches?: MatchResult[] }
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // Try to extract the first {...} block
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
    .map((m) => ({ id: m.id, reason: String(m.reason || '').slice(0, 300) }))
    .slice(0, 10)
}
