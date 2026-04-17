export const metadata = {
  title: 'About — DK Collab Finder',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-5">About</h1>

      <section className="space-y-4 text-[var(--text)] leading-relaxed">
        <p>
          <strong>Danish Research Collaboration Finder</strong> is a directory of faculty at Danish research
          institutions, built to help researchers identify potential collaborators across departments and universities.
        </p>

        <p>
          It covers faculty at the University of Copenhagen (including PLEN, BIO, FOOD, DIKU, Drug Design),
          Aarhus University (MBG, QGG), Technical University of Denmark (Biosustain, Bioengineering, Aqua),
          University of Southern Denmark, and other Danish research institutions.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">How matching works</h2>
        <p>
          Profiles are compiled from public department pages and profile URLs. When you describe your project on the{' '}
          <a href="/match" className="text-[var(--accent)] hover:underline">AI Match</a> page, the
          description is sent together with the full directory to Anthropic Claude, which ranks researchers by topical
          fit and returns a one-sentence rationale for each. Your description is not stored.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Corrections & additions</h2>
        <p>
          Data is a snapshot and may be out of date. If you find errors, missing people, or want your profile removed,
          please email{' '}
          <a href="mailto:mutwil@plen.ku.dk" className="text-[var(--accent)] hover:underline">
            mutwil@plen.ku.dk
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">Privacy</h2>
        <p>
          All profile content here is aggregated from public academic web pages. No user accounts, no tracking, no
          analytics. Your match queries are sent to Anthropic's API only for the purpose of generating ranked matches,
          and are not retained by this site.
        </p>
      </section>
    </div>
  )
}
