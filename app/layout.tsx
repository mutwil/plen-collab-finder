import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Danish Research Collaboration Finder',
  description: 'Discover research collaborators across Danish academic institutions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 no-underline text-[var(--text)] hover:opacity-80">
              <span className="text-xl font-semibold tracking-tight">DK Collab Finder</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">Browse</Link>
              <Link href="/match" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">AI Match</Link>
              <Link href="/submit" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">Add me</Link>
              <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">About</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] mt-12 py-6 text-center text-xs text-[var(--text-subtle)]">
          A directory of Danish research faculty
        </footer>
      </body>
    </html>
  )
}
