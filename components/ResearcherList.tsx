'use client'

import { useMemo, useState } from 'react'
import type { Researcher } from '@/lib/researchers'
import ResearcherCard from './ResearcherCard'
import SearchBar from './SearchBar'

const UNKNOWN = 'Other / unknown'

export default function ResearcherList({ researchers }: { researchers: Researcher[] }) {
  const [query, setQuery] = useState('')
  const [inst, setInst] = useState<string>('all')

  const institutions = useMemo(() => {
    const set = new Set<string>()
    for (const r of researchers) set.add(r.institution || UNKNOWN)
    return Array.from(set).sort()
  }, [researchers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return researchers.filter((r) => {
      if (inst !== 'all' && (r.institution || UNKNOWN) !== inst) return false
      if (!q) return true
      const hay = [
        r.name,
        r.title,
        r.department,
        r.institution,
        r.labGroup,
        r.summary,
        r.recentWork,
        ...(r.topics || []),
        ...(r.collaborationAngles || []),
      ].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [researchers, query, inst])

  // Group filtered researchers by institution
  const grouped = useMemo(() => {
    const map = new Map<string, Researcher[]>()
    for (const r of filtered) {
      const key = r.institution || UNKNOWN
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    // Stable sort: institutions alphabetical, but PLEN/University of Copenhagen first
    const entries = Array.from(map.entries())
    entries.sort(([a], [b]) => {
      const rank = (x: string) =>
        /university of copenhagen/i.test(x) ? 0 :
        /technical university/i.test(x) ? 1 :
        /aarhus/i.test(x) ? 2 :
        x === UNKNOWN ? 99 : 3
      const ra = rank(a), rb = rank(b)
      if (ra !== rb) return ra - rb
      return a.localeCompare(b)
    })
    return entries
  }, [filtered])

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name, topic, lab..." />
        <select
          value={inst}
          onChange={(e) => setInst(e.target.value)}
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)]"
        >
          <option value="all">All institutions</option>
          {institutions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-6 font-mono">
        {filtered.length} of {researchers.length} researchers · {grouped.length} institution{grouped.length !== 1 ? 's' : ''}
      </p>

      {grouped.map(([institution, rs]) => (
        <section key={institution} className="mb-10">
          <div className="flex items-baseline gap-3 mb-3 pb-2 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold">{institution}</h3>
            <span className="text-xs text-[var(--text-muted)] font-mono">{rs.length} {rs.length === 1 ? 'person' : 'people'}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rs.map((r) => (
              <ResearcherCard key={r.id} researcher={r} />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-[var(--text-muted)] py-12">No researchers match your filters.</p>
      )}
    </div>
  )
}
