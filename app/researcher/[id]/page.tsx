import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResearchers, getById, getTitleColor } from '@/lib/researchers'

export function generateStaticParams() {
  return loadResearchers().map((r) => ({ id: r.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const r = getById(id)
  if (!r) return {}
  return {
    title: `${r.name} — PLEN Collab Finder`,
    description: r.summary || `${r.title ?? ''} at ${r.department ?? r.institution ?? ''}`.trim(),
  }
}

export default async function ResearcherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const r = getById(id)
  if (!r) notFound()

  const titleColor = getTitleColor(r.title)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline">← Back to browse</Link>

      <div className="mt-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{r.name}</h1>
            <div className="flex flex-wrap gap-2 items-center text-sm">
              {r.title && (
                <span
                  className="px-2 py-0.5 rounded font-medium"
                  style={{ color: titleColor, background: titleColor + '22' }}
                >
                  {r.title}
                </span>
              )}
              {r.department && <span className="font-mono text-[var(--text-muted)]">{r.department}</span>}
              {r.institution && <span className="text-[var(--text-subtle)]">· {r.institution}</span>}
            </div>
          </div>
        </div>

        {r.url && (
          <a
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline mb-6"
          >
            Visit profile
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}

        {r.labGroup && (
          <section className="mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Lab / Group</h2>
            <p>{r.labGroup}</p>
          </section>
        )}

        {r.summary && (
          <section className="mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Summary</h2>
            <p className="leading-relaxed">{r.summary}</p>
          </section>
        )}

        {r.recentWork && (
          <section className="mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Recent work</h2>
            <p className="leading-relaxed">{r.recentWork}</p>
          </section>
        )}

        {r.topics && r.topics.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Topics</h2>
            <div className="flex flex-wrap gap-1.5">
              {r.topics.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {r.collaborationAngles && r.collaborationAngles.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">Potential collaboration angles</h2>
            <ul className="list-disc pl-5 space-y-1">
              {r.collaborationAngles.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
