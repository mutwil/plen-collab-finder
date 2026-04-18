import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Self-signup is temporarily disabled. The full implementation lives in git
// history — revert this commit to re-enable (needs ANTHROPIC_API_KEY, GITHUB_TOKEN,
// GITHUB_REPO, ADMIN_TOKEN env vars for moderation + GitHub Issue filing).
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Self-signup is temporarily disabled. Email mutwil@plen.ku.dk for profile corrections or additions.',
    },
    { status: 503 },
  )
}
