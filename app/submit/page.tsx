import SubmitForm from '@/components/SubmitForm'

export const metadata = {
  title: 'Add yourself — DK Collab Finder',
  description: 'Submit your research profile to the Danish collaboration directory.',
}

export default function SubmitPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-2">Add yourself to the directory</h1>
      <p className="text-[var(--text-muted)] mb-6">
        If you're a Danish-based researcher and want to be discoverable, submit your profile here.
        Submissions are auto-moderated and queued for publishing after a brief human review.
      </p>
      <SubmitForm />
    </div>
  )
}
