import Link from 'next/link'

export const metadata = {
  title: 'Add yourself — DK Collab Finder',
  description: 'Self-signup is temporarily disabled.',
}

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-bold tracking-tight mb-3">Self-signup is temporarily disabled</h1>
      <p className="text-[var(--text-muted)] mb-6">
        To request a profile correction or addition, email{' '}
        <a href="mailto:mutwil@plen.ku.dk" className="text-[var(--accent)] hover:underline">mutwil@plen.ku.dk</a>.
      </p>
      <Link href="/" className="text-[var(--accent)] hover:underline no-underline">← Back to browse</Link>
    </div>
  )
}
