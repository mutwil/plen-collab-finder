'use client'

import { useState } from 'react'
import type { Researcher } from '@/lib/researchers'
import ResearcherCard from './ResearcherCard'

interface MatchItem {
  id: string
  reason: string
}

export default function MatchForm({ allResearchers }: { allResearchers: Researcher[] }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Array<{ researcher: Researcher; reason: string }> | null>(null)

  const byId = new Map(allResearchers.map((r) => [r.id, r]))

  const submit = async () => {
    const q = query.trim()
    if (!q || loading) return
    setLoading(true)
    setError(null)
    setResults(null)
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
          return r ? { researcher: r, reason: m.reason } : null
        })
        .filter(Boolean) as Array<{ researcher: Researcher; reason: string }>
      setResults(enriched)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Describe your project or research question</label>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. I want to combine machine learning with plant-microbe interaction data to predict nitrogen-fixation efficiency in legume cultivars..."
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
          <h2 className="text-lg font-semibold mb-4">Top {results.length} matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map(({ researcher, reason }) => (
              <ResearcherCard key={researcher.id} researcher={researcher} matchReason={reason} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
