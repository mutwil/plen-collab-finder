'use client'

import { useState } from 'react'
import type { Researcher } from '@/lib/researchers'
import ResearcherCard from './ResearcherCard'

interface MatchItem {
  id: string
  reason: string
  score?: number
  matchedTopics?: string[]
}

interface ResultRow {
  researcher: Researcher
  reason: string
  score?: number
  matchedTopics?: string[]
}

export default function MatchForm({ allResearchers }: { allResearchers: Researcher[] }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ResultRow[] | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [proposal, setProposal] = useState<string | null>(null)
  const [proposalLoading, setProposalLoading] = useState(false)

  const byId = new Map(allResearchers.map((r) => [r.id, r]))

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else if (n.size < 8) n.add(id)
      return n
    })
  }

  const submit = async () => {
    const q = query.trim()
    if (!q || loading) return
    setLoading(true); setError(null); setResults(null); setProposal(null); setSelected(new Set())
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setError(data.error || `HTTP ${res.status}`)
        return
      }
      const matches: MatchItem[] = data.matches || []
      const enriched = matches
        .map((m) => {
          const r = byId.get(m.id)
          return r ? { researcher: r, reason: m.reason, score: m.score, matchedTopics: m.matchedTopics } : null
        })
        .filter(Boolean) as ResultRow[]
      setResults(enriched)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const generateProposal = async () => {
    if (proposalLoading || selected.size === 0) return
    setProposalLoading(true)
    setProposal(null)
    try {
      const res = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), ids: Array.from(selected) }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setProposal(data.text)
      } else {
        setProposal(null)
        setError(data.error || `HTTP ${res.status}`)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setProposalLoading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Describe your project or research question</label>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. I'm looking for a collaborator with expertise in single-cell transcriptomics and machine learning, ideally someone who has worked with non-model organisms..."
        rows={5}
        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent)] resize-y"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={submit}
          disabled={loading || !query.trim()}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
        >
          {loading ? 'Matching...' : 'Find collaborators'}
        </button>
        <span className="text-xs text-[var(--text-muted)]">
          Uses Claude Haiku to rank {allResearchers.length} researchers by fit.
        </span>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-100 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {results && results.length === 0 && !loading && (
        <p className="mt-6 text-[var(--text-muted)]">No strong matches found — try rephrasing your description.</p>
      )}

      {results && results.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top {results.length} matches</h2>
            <span className="text-xs text-[var(--text-muted)]">
              Click ⬚ on a card to select collaborators for a proposal snippet
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map(({ researcher, reason, score, matchedTopics }) => (
              <div key={researcher.id} className="relative">
                <button
                  onClick={() => toggle(researcher.id)}
                  className={`absolute top-2 right-2 z-10 w-5 h-5 rounded border-2 cursor-pointer text-[10px] leading-none font-bold flex items-center justify-center ${
                    selected.has(researcher.id)
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                      : 'bg-[var(--bg-card)] border-[var(--border)] text-transparent hover:border-[var(--accent)]'
                  }`}
                  aria-label={selected.has(researcher.id) ? 'Deselect' : 'Select for proposal'}
                >
                  ✓
                </button>
                <ResearcherCard
                  researcher={researcher}
                  matchReason={reason}
                  matchedTopics={matchedTopics}
                  score={score}
                />
              </div>
            ))}
          </div>

          {selected.size > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  {selected.size} selected · generate a proposal paragraph mentioning them?
                </p>
                <button
                  onClick={generateProposal}
                  disabled={proposalLoading}
                  className="bg-[var(--accent)] text-white px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50 cursor-pointer border-none"
                >
                  {proposalLoading ? 'Writing…' : 'Generate proposal snippet'}
                </button>
              </div>
              {proposal && (
                <div className="mt-3 p-4 rounded bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{proposal}</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(proposal)}
                    className="mt-3 text-xs text-[var(--accent)] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
