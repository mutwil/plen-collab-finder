import type { Metadata } from 'next'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Danish Research Collaboration Finder',
    template: '%s',
  },
  description: 'Discover research collaborators across Danish academic institutions with AI-powered topic matching.',
  openGraph: {
    title: 'Danish Research Collaboration Finder',
    description: 'Discover research collaborators across Danish academic institutions with AI-powered topic matching.',
    type: 'website',
    url: 'https://plen-collab-finder.vercel.app',
    siteName: 'DK Collab Finder',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'DK Collab Finder' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Danish Research Collaboration Finder',
    description: 'AI-powered collaborator matching across Danish academic institutions.',
    images: ['/og.png'],
  },
}

// Early-apply theme before first paint to prevent flash
const themeScript = `
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 no-underline text-[var(--text)] hover:opacity-80">
              <span className="text-xl font-semibold tracking-tight">DK Collab Finder</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">Browse</Link>
              <Link href="/match" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">AI Match</Link>
              <Link href="/graph" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">Network</Link>
              <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">About</Link>
              <a
                href="https://discord.gg/cBDk7t6kwD"
                target="_blank"
                rel="noopener noreferrer"
                title="Join the Discord — feedback & hangout"
                className="text-[#5865F2] hover:opacity-80 no-underline text-[13px]"
              >
                Discord
              </a>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="flex-1 pb-12">{children}</main>
        <footer
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-sm py-2 px-4 text-center text-[11px] text-[var(--text-subtle)]"
        >
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>A directory of Danish research faculty · built by</span>
            <a
              href="https://publish.obsidian.md/mutwillab/Homepage/News"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--accent)] font-medium underline-offset-2 hover:underline"
            >
              Mutwil Lab ↗
            </a>
            <span className="text-[var(--text-subtle)]">·</span>
            <a
              href="https://discord.gg/cBDk7t6kwD"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#5865F2] hover:opacity-80 font-medium"
              title="Join the Discord — feedback & hangout"
            >
              <svg width="12" height="12" viewBox="0 0 71 55" fill="currentColor" aria-hidden>
                <path d="M60.1 4.9A58.5 58.5 0 0 0 45.4.5a.2.2 0 0 0-.2.1 40 40 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0 37.6 37.6 0 0 0-1.8-3.7.2.2 0 0 0-.2-.1A58.4 58.4 0 0 0 10.5 4.9.2.2 0 0 0 10.4 5 59.9 59.9 0 0 0 .1 45.6a.2.2 0 0 0 .1.2 58.7 58.7 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 41.9 41.9 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.6 38.6 0 0 1-5.5-2.6.2.2 0 0 1 0-.3 29.5 29.5 0 0 0 1.1-.9.2.2 0 0 1 .2 0 41.8 41.8 0 0 0 35.6 0 .2.2 0 0 1 .2 0 27.4 27.4 0 0 0 1.1.9.2.2 0 0 1 0 .3 36.2 36.2 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.5 58.5 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2A59.5 59.5 0 0 0 60.2 5a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.1 0-4 2.8-7.1 6.4-7.1 3.6 0 6.5 3.2 6.4 7.1 0 4-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1 0-4 2.8-7.1 6.4-7.1 3.6 0 6.5 3.2 6.4 7.1 0 4-2.8 7.1-6.4 7.1Z" />
              </svg>
              Join the Discord
            </a>
            <span className="text-[var(--text-subtle)] hidden sm:inline">· drop by with feedback or just hang out</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
