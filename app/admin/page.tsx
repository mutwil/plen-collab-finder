import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — DK Collab Finder' }

interface Issue {
  number: number
  title: string
  body: string | null
  html_url: string
  state: string
  created_at: string
  labels: { name: string }[]
}

async function fetchIssues(): Promise<{ ok: true; issues: Issue[] } | { ok: false; error: string }> {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  if (!token || !repo) {
    return { ok: false, error: 'GITHUB_TOKEN or GITHUB_REPO env var not set' }
  }
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&labels=submission&per_page=30`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'plen-collab-finder',
      },
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false, error: `GitHub API ${res.status}: ${await res.text()}` }
    const issues = (await res.json()) as Issue[]
    return { ok: true, issues }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const adminToken = process.env.ADMIN_TOKEN

  if (!adminToken) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <p className="text-[var(--text-muted)]">
          Set <code>ADMIN_TOKEN</code> in your Vercel env vars to enable this page.
        </p>
      </div>
    )
  }

  if (token !== adminToken) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <p className="text-[var(--text-muted)]">Append <code>?token=…</code> to the URL to access.</p>
      </div>
    )
  }

  const result = await fetchIssues()

  if (!result.ok) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Admin</h1>
        <p className="text-red-600">{result.error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pending submissions</h1>
        <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] no-underline">← Back</Link>
      </div>

      {result.issues.length === 0 && (
        <p className="text-[var(--text-muted)]">No open submissions.</p>
      )}

      <div className="space-y-4">
        {result.issues.map((issue) => {
          const verdictLabel = issue.labels.find((l) => l.name.startsWith('verdict:'))?.name.replace('verdict:', '')
          const color = verdictLabel === 'approve' ? '#16a34a' : verdictLabel === 'needs-review' ? '#ca8a04' : '#ef4444'
          return (
            <div key={issue.number} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">
                  <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="no-underline text-[var(--text)] hover:text-[var(--accent)]">
                    #{issue.number} · {issue.title}
                  </a>
                </h2>
                {verdictLabel && (
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                    style={{ color, background: color + '22' }}
                  >
                    {verdictLabel}
                  </span>
                )}
              </div>
              <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap font-mono leading-relaxed">{issue.body || '(no body)'}</pre>
              <p className="text-[10px] text-[var(--text-subtle)] mt-2 font-mono">
                {new Date(issue.created_at).toLocaleString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
