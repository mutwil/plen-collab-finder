import Link from 'next/link'
import type { Researcher } from '@/lib/researchers'
import { getTitleColor } from '@/lib/researchers'

export default function ResearcherCard({ researcher, matchReason }: { researcher: Researcher; matchReason?: string }) {
  const { id, name, title, department, institution, topics, summary } = researcher
  const titleColor = getTitleColor(title)

  return (
    <Link
      href={`/researcher/${id}`}
      className="block bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4 hover:shadow-md hover:border-[var(--text-muted)] transition no-underline text-[var(--text)]"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold leading-tight mb-1">{name}</h3>
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
              <span className="text-[var(--text-muted)] font-mono">{department}</span>
            )}
            {institution && department !== institution && (
              <span className="text-[var(--text-subtle)]">· {institution}</span>
            )}
          </div>
        </div>
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
          {topics.slice(0, 5).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]"
            >
              {t}
            </span>
          ))}
          {topics.length > 5 && (
            <span className="text-[10px] text-[var(--text-subtle)]">+{topics.length - 5}</span>
          )}
        </div>
      )}
    </Link>
  )
}
