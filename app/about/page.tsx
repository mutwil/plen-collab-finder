export const metadata = {
  title: 'About — PLEN Collab Finder',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-5">About</h1>

      <section className="space-y-4 text-[var(--text)] leading-relaxed">
        <p>
          <strong>PLEN Collab Finder</strong> is a directory of researchers at Danish plant-science-adjacent
          departments, built to help anyone at PLEN (Department of Plant and Environmental Sciences, University of
          Copenhagen) identify potential collaborators.
        </p>

        <p>
          It covers PLEN, BIO, FOOD, SUND, DTU Biosustain, DTU Bioengineering, AU MBG, and other departments that
          frequently overlap with plant science, molecular biology, genomics, and computational biology.
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
