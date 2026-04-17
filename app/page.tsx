import Link from 'next/link'
import { Suspense } from 'react'
import { loadResearchers, sortResearchers } from '@/lib/researchers'
import ResearcherList from '@/components/ResearcherList'

export default function HomePage() {
  const researchers = sortResearchers(loadResearchers())

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <section className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Find a research collaborator in Denmark.
        </h1>
        <p className="text-[var(--text-muted)] mb-5 max-w-2xl">
          A curated directory of faculty at Danish research institutions — with
          AI-powered matching on research interests.
        </p>
        <Link
          href="/match"
          className="inline-flex items-center gap-2 bg-[var(--accent)] text-white px-4 py-2 rounded-md text-sm font-medium no-underline hover:opacity-90"
        >
          Describe your project → Get AI matches
        </Link>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Browse all researchers</h2>
        <Suspense fallback={<p className="text-[var(--text-muted)]">Loading…</p>}>
          <ResearcherList researchers={researchers} />
        </Suspense>
      </section>
    </div>
  )
}
