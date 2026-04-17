import Link from 'next/link'
import type { Researcher } from '@/lib/researchers'
import { getTitleColor } from '@/lib/researchers'

export default function ResearcherCard({
  researcher,
  matchReason,
  matchedTopics,
  score,
  topicHref,
}: {
  researcher: Researcher
  matchReason?: string
  matchedTopics?: string[]
  score?: number
  topicHref?: (topic: string) => string
}) {
  const { id, name, title, department, institution, topics, summary } = researcher
  const titleColor = getTitleColor(title)
  const matchedSet = new Set((matchedTopics || []).map((t) => t.toLowerCase()))
  const makeHref = topicHref || ((t: string) => `/?topic=${encodeURIComponent(t)}`)

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 hover:shadow-md hover:border-[var(--text-muted)] transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <Link href={`/researcher/${id}`} className="no-underline text-[var(--text)] hover:underline">
            <h3 className="text-lg font-semibold leading-tight mb-1">{name}</h3>
          </Link>
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {title && (
              <span
                className="px-1.5 py-0.5 rounded font-medium"
                style={{ color: titleColor, background: titleColor + '22' }}
              >
                {title}
              </span>
            )}
            {department && (
              <Link
                href={`/department/${encodeURIComponent(department)}`}
                className="text-[var(--text-muted)] font-mono hover:text-[var(--accent)] no-underline"
              >
                {department}
              </Link>
            )}
            {institution && department !== institution && (
              <span className="text-[var(--text-subtle)]">· {institution}</span>
            )}
          </div>
        </div>
        {typeof score === 'number' && (
          <span
            className="px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 font-mono"
            style={{
              color: score >= 0.75 ? '#16a34a' : score >= 0.55 ? '#ca8a04' : '#94a3b8',
              background: (score >= 0.75 ? '#16a34a' : score >= 0.55 ? '#ca8a04' : '#94a3b8') + '22',
            }}
            title="AI-assigned fit score"
          >
            {Math.round(score * 100)}%
          </span>
        )}
      </div>

      {matchReason && (
        <p className="text-sm text-[var(--text)] mb-2 italic border-l-2 border-[var(--accent)] pl-3">
          {matchReason}
        </p>
      )}

      {summary && !matchReason && (
        <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">{summary}</p>
      )}

      {topics && topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.slice(0, 6).map((t) => {
            const isMatched = matchedSet.has(t.toLowerCase())
            return (
              <Link
                key={t}
                href={makeHref(t)}
                className={`text-[10px] px-1.5 py-0.5 rounded border no-underline transition-colors ${
                  isMatched
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/40 font-semibold'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {t}
              </Link>
            )
          })}
          {topics.length > 6 && (
            <span className="text-[10px] text-[var(--text-subtle)]">+{topics.length - 6}</span>
          )}
        </div>
      )}
    </div>
  )
}
