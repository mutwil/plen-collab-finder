# PLEN Collab Finder — project context for Claude Code

Public Next.js app that helps researchers in Denmark find collaborators across Danish research institutions. AI-powered topic matching via Claude Haiku.

**Live:** https://plen-collab-finder.vercel.app
**GitHub:** https://github.com/mutwil/plen-collab-finder
**Owner:** Marek Mutwil (mutwil@plen.ku.dk, PLEN · University of Copenhagen)

## Stack

- **Next.js 15** (App Router, TypeScript, React 19)
- **Tailwind CSS 4**
- **Anthropic SDK** — `claude-haiku-4-5-20251001` for match + moderation
- **Cytoscape.js + fcose** for the network graph view
- **Vercel** for hosting (auto-deploys on push to `master`; manual promote with `vercel --prod --yes`)
- **Playwright** (dev-only) for scraping JS-rendered staff pages

## Layout

```
app/
  page.tsx                    # Landing: hero banner + grouped browse
  match/page.tsx              # AI topic matcher (uses /api/match)
  graph/page.tsx              # Network graph view (uses data/graph.json)
  researcher/[id]/page.tsx    # SSG profile page + dynamic OG image
  researcher/[id]/opengraph-image.tsx
  department/[name]/page.tsx  # SSG per-department listing
  about/page.tsx
  submit/page.tsx             # "Temporarily disabled" stub
  admin/page.tsx              # /admin?token=... (reads GitHub Issues)
  api/match/route.ts          # Haiku-ranked matcher (rate-limited, prefiltered)
  api/submit/route.ts         # Returns 503 — self-signup disabled
  api/proposal/route.ts       # Haiku writes 150-word collab pitch
  opengraph-image.tsx         # Site-wide OG image
  icon.tsx                    # Danish-flag favicon
components/
  ResearcherCard.tsx ResearcherList.tsx SearchBar.tsx
  MatchForm.tsx SubmitForm.tsx ThemeToggle.tsx
  VikingBanner.tsx            # SVG hero on landing
  NetworkGraph.tsx            # Cytoscape wrapper
data/
  researchers.json            # ~1,376 researchers (source of truth)
  graph.json                  # Precomputed top-K topic-overlap edges
lib/
  researchers.ts              # loader, sort, similar
  match.ts                    # prefilter + digest builders + prompt
  rate-limit.ts               # in-memory sliding window (per Vercel instance)
scripts/
  merge-batchN.mjs            # One script per scraped institution
  enrich-topics.mjs           # Haiku web search → topics + summary
  broaden-topics.mjs          # Makes narrow topics search-friendly
  broaden-recent.mjs          # Same, but only on recently-enriched entries
  build-graph.mjs             # Precompute top-K edges for graph.json
  scrape-playwright*.mjs      # Headless scrapers for JS-rendered sites
```

## Data pipeline

Adding new researchers follows a fixed loop:

1. **Fetch** — WebFetch if the page is static HTML; Playwright if JS-rendered; sometimes the user runs a Console snippet in their own browser past Cloudflare (see `scripts/scrape-playwright3.mjs` for examples).
2. **Merge** — write a new `scripts/merge-batchN.mjs` with hardcoded rows, run it. It dedupes by lowercased name and enriches existing rows with any new URL/title.
3. **Enrich** — `node scripts/enrich-topics.mjs` — uses Haiku web search to fill topics + summary for entries missing them. Filters the list itself; safe to re-run.
4. **Broaden** — `node scripts/broaden-recent.mjs` — rewrites topics to mix narrow and broad terms so generic searches ("I need a bioinformatician") find them. Only touches entries enriched in the last hour.
5. **Rebuild graph** — `node scripts/build-graph.mjs` — regenerates `data/graph.json` from current researchers. K=10 neighbors, min Jaccard 0.08.
6. **Commit + deploy** — `git add -A && git commit -m ... && git push && vercel --prod --yes`

Scripts load `.env.local` via a small inline loader (no dotenv dep). Pull env vars from Vercel with `vercel env pull .env.local --environment=production`.

## Env vars

- `ANTHROPIC_API_KEY` — required for `/api/match`, `/api/proposal`, enrichment scripts.
- `GITHUB_TOKEN`, `GITHUB_REPO=mutwil/plen-collab-finder`, `ADMIN_TOKEN` — **not currently set in Vercel**. Only needed if you re-enable `/submit` and the admin page.

## Current state & known limitations

- **~1,376 researchers** across UCPH, AU, DTU, SDU, CBS (with many departments each). RUC/AAU/ITU/SDU Pure portals are behind Cloudflare and resist scraping.
- **Self-signup disabled** — `/submit` returns a "temporarily disabled" notice, `/api/submit` returns 503. To re-enable: revert the commit that disabled it and set the three GitHub env vars in Vercel.
- **Match endpoint** has a keyword pre-filter (top 250 candidates) + fallback to compact digest to stay under the 200K token limit.
- **Graph page** uses a similarity cutoff slider (0.08–0.80). Isolated nodes are hidden by default. Tap-highlight only follows edges above the current cutoff.
- **Per-researcher OG images** at `/researcher/[id]/opengraph-image` — unique card per person for social shares.
- **Sticky footer** with always-visible Discord (`discord.gg/cBDk7t6kwD`) and Mutwil Lab links.

## Useful one-liners

- Run a match query: `curl -s -X POST https://plen-collab-finder.vercel.app/api/match -H "Content-Type: application/json" -d '{"query":"plant bioinformatics"}' | python3 -m json.tool`
- Count researchers by institution: `node -e "const d=require('./data/researchers.json');const b={};for(const r of d)b[r.institution||'?']=(b[r.institution||'?']||0)+1;console.log(b)"`
- Find someone by partial name: `node -e "const d=require('./data/researchers.json');console.log(d.filter(r=>/wouter/i.test(r.name)).map(r=>r.name+' · '+r.department))"`

## Style / quirks

- Emojis only if explicitly asked.
- Never re-enable self-signup without explicit user approval.
- The **parent dashboard** (Command Center) lives at `~/projectdashboard` and is a **separate project** — don't touch it from here.
- Terse replies with code links > long explanations.
