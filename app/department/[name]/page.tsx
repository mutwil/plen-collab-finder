import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResearchers } from '@/lib/researchers'
import ResearcherCard from '@/components/ResearcherCard'

export async function generateStaticParams() {
  const depts = new Set<string>()
  for (const r of loadResearchers()) {
    if (r.department) depts.add(r.department)
  }
  return Array.from(depts).map((name) => ({ name }))
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  return {
    title: `${decoded} — DK Collab Finder`,
    description: `Faculty at ${decoded} indexed in the Danish Research Collaboration Finder.`,
  }
}

export default async function DepartmentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  const researchers = loadResearchers().filter((r) => r.department === decoded)
  if (researchers.length === 0) notFound()

  const institution = researchers[0].institution
  const sorted = [...researchers].sort((a, b) => {
    const la = a.name.trim().split(/\s+/).pop() || a.name
    const lb = b.name.trim().split(/\s+/).pop() || b.name
    return la.localeCompare(lb)
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline">← Back to browse</Link>
      <h1 className="text-3xl font-bold tracking-tight mt-4 mb-1">{decoded}</h1>
      {institution && (
        <p className="text-[var(--text-muted)] mb-8">{institution}</p>
      )}
      <p className="text-xs text-[var(--text-muted)] mb-6 font-mono">
        {sorted.length} {sorted.length === 1 ? 'person' : 'people'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((r) => (
          <ResearcherCard key={r.id} researcher={r} />
        ))}
      </div>
    </div>
  )
}
