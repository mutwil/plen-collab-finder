import { loadResearchers } from '@/lib/researchers'
import MatchForm from '@/components/MatchForm'

export const metadata = {
  title: 'AI Match — DK Collab Finder',
  description: 'Describe your project and get AI-ranked collaborator suggestions.',
}

export default function MatchPage() {
  const researchers = loadResearchers()
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">AI Collaborator Match</h1>
      <p className="text-[var(--text-muted)] mb-8">
        Describe your project in a sentence or a paragraph. Claude will rank Danish researchers by topical fit and
        explain why each one might be a good match.
      </p>
      <MatchForm allResearchers={researchers} />
    </div>
  )
}
