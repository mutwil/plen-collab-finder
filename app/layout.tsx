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
              <Link href="/about" className="text-[var(--text-muted)] hover:text-[var(--text)] no-underline">About</Link>
              <ThemeToggle />
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
