# PLEN Collaboration Finder

A public web app that helps researchers at PLEN (Department of Plant and Environmental Sciences, University of Copenhagen) identify potential collaborators across Danish academic institutions.

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS 4
- Anthropic Claude Haiku for AI-powered matching

## Development

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Loading the real researcher snapshot

The repo ships with 3 sample PLEN researchers. To load your full snapshot:

1. Open your internal dashboard (the Command Center) in the browser.
2. Open DevTools → Console, paste:
   ```js
   copy(JSON.stringify(JSON.parse(localStorage.getItem('command-center-ui')).state.researchersDenmark, null, 2))
   ```
3. The clipboard now holds the full JSON array. Paste it into `data/researchers.json`, replacing the file's contents.
4. Restart the dev server.

## Deploy

```bash
npm install -g vercel
vercel
```

Set `ANTHROPIC_API_KEY` in the Vercel project's Environment Variables.

## Routes

- `/` — Landing, browse + filter all researchers
- `/match` — Describe a project, get AI-ranked collaborator suggestions
- `/researcher/[id]` — Full profile
- `/about` — What this is, how to contribute corrections
