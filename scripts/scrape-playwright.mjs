// Playwright-based scraper for JS-rendered staff directories.
// Usage: node scripts/scrape-playwright.mjs [--dry]
// Merges results into data/researchers.json in-place unless --dry.

import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const DRY = process.argv.includes('--dry')

const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|group\sleader|principal\sinvestigator|chief\stechnology|section\shead)/i
const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|head\sof\scentre|administrative|ph\.?d|postdoc|student/i

const TITLE_MAP = {
  'lektor': 'Associate Professor',
  'adjunkt': 'Assistant Professor',
  'tenure track adjunkt': 'Tenure Track Assistant Professor',
  'seniorforsker': 'Senior Researcher',
  'centerleder': 'Center Director',
}

function translateTitle(t) {
  if (!t) return t
  const lc = t.toLowerCase().trim()
  return TITLE_MAP[lc] || t
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function keep(title) {
  if (!title) return false
  if (EXCLUDE.test(title)) return false
  return INCLUDE.test(title)
}

// ─── Sources ─────────────────────────────────────────────────────
// Each source defines a URL to visit and a browser-side extractor
// that returns [{name, title, url}] for that page. The extractor
// runs inside the page context (via page.evaluate).

const sources = [
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Bioengineering',
    url: 'https://www.bioengineering.dtu.dk/about/staff',
    waitFor: 'table, .person, .dtu-person-item, a[href*="/person/"]',
    extract: () => {
      const results = []
      // Most DTU sites use person rows with name + title cells
      document.querySelectorAll('tr, .person, li, article').forEach((row) => {
        const link = row.querySelector('a[href*="/person/"], a[href*="mailto:"]')
        const name = row.querySelector('.name, h2, h3, .person-name, strong, a[href*="/person/"]')?.innerText?.trim()
          || link?.innerText?.trim()
        // Title: look for a cell or sibling that names the academic rank
        const text = row.innerText || ''
        const titleMatch = text.match(/(Professor(?:\s(?:WSR|MSO|Emeritus|Emerita|with special responsibilities))?|Associate Professor(?:\s-?\s?Tenure[\w\s]*|,\s*Promotion Programme)?|Assistant Professor(?:\s-?\s?Tenure[\w\s]*)?|Tenure Track[\w\s]*|Senior Researcher|Head of Section|Section Head|Group Leader|Principal Investigator|Head of Department)/i)
        const title = titleMatch?.[1]?.trim()
        const href = link?.href
        if (name && title && name.length > 2 && name.length < 120) {
          results.push({ name, title, url: href })
        }
      })
      // Dedupe by name
      const seen = new Set()
      return results.filter((r) => {
        const k = r.name.toLowerCase().trim()
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
    },
  },
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Biosustain',
    url: 'https://www.biosustain.dtu.dk/about/people',
    waitFor: 'a[href*="/person/"], .person, table, .biosustain-employee',
    extract: () => {
      const results = []
      document.querySelectorAll('tr, .person, .employee, li, article, .card').forEach((row) => {
        const link = row.querySelector('a[href*="/person/"], a[href*="/employees/"]')
        const name = row.querySelector('.name, h2, h3, strong, a')?.innerText?.trim()
          || link?.innerText?.trim()
        const text = row.innerText || ''
        const titleMatch = text.match(/(Professor(?:\s(?:WSR|MSO|Emeritus|Emerita))?|Associate Professor(?:\s-?\s?Tenure[\w\s]*)?|Assistant Professor(?:\s-?\s?Tenure[\w\s]*)?|Tenure Track[\w\s]*|Senior Researcher|Senior Scientist|Scientific Director|CTO|CSO|Group Leader|Head of Section|Principal Investigator|Head of Department|Section Head)/i)
        const title = titleMatch?.[1]?.trim()
        const href = link?.href
        if (name && title && name.length > 2 && name.length < 120) {
          results.push({ name, title, url: href })
        }
      })
      const seen = new Set()
      return results.filter((r) => {
        const k = r.name.toLowerCase().trim()
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
    },
  },
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Aqua',
    url: 'https://www.aqua.dtu.dk/om-dtu-aqua/kontakt/medarbejdere',
    waitFor: 'a[href*="/person/"], table, .employee-list',
    extract: () => {
      const results = []
      document.querySelectorAll('tr, .person, .employee, li').forEach((row) => {
        const link = row.querySelector('a[href*="/person/"], a[href*="/medarbejder"]')
        const name = row.querySelector('.name, h2, h3, strong, a')?.innerText?.trim()
          || link?.innerText?.trim()
        const text = row.innerText || ''
        const titleMatch = text.match(/(Professor(?:\s(?:WSR|MSO|Emeritus|Emerita))?|Associate Professor(?:\s-?\s?Tenure[\w\s]*)?|Assistant Professor(?:\s-?\s?Tenure[\w\s]*)?|Tenure Track[\w\s]*|Senior Researcher|Senior Scientist|Seniorforsker|Lektor|Adjunkt|Group Leader|Section Head|Head of Section)/i)
        const title = titleMatch?.[1]?.trim()
        const href = link?.href
        if (name && title && name.length > 2 && name.length < 120) {
          results.push({ name, title, url: href })
        }
      })
      const seen = new Set()
      return results.filter((r) => {
        const k = r.name.toLowerCase().trim()
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
    },
  },
]

// ─── Scrape ──────────────────────────────────────────────────────

async function scrapeAll() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
  })

  const all = []
  for (const src of sources) {
    const page = await ctx.newPage()
    console.log(`\n▶ ${src.institution} / ${src.department}`)
    console.log(`  URL: ${src.url}`)
    try {
      await page.goto(src.url, { waitUntil: 'networkidle', timeout: 45000 })
      try {
        await page.waitForSelector(src.waitFor, { timeout: 15000 })
      } catch {
        console.log(`  (waitFor selector "${src.waitFor}" not found; proceeding anyway)`)
      }
      // Extra: scroll to force lazy-loaded rows
      await page.evaluate(async () => {
        for (let y = 0; y <= document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((r) => setTimeout(r, 100))
        }
      })
      await page.waitForTimeout(1500)

      const found = await page.evaluate(src.extract)
      console.log(`  Found ${found.length} candidates`)

      for (const f of found) {
        const title = translateTitle(f.title)
        if (!keep(title)) continue
        all.push({
          id: slugify(f.name),
          name: f.name.trim(),
          title,
          department: src.department,
          institution: src.institution,
          url: f.url,
        })
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
    } finally {
      await page.close()
    }
  }

  await browser.close()
  return all
}

// ─── Merge ───────────────────────────────────────────────────────

const scraped = await scrapeAll()
console.log(`\n${scraped.length} kept after filtering`)

if (DRY) {
  console.log('--dry flag set, writing to stdout only')
  console.log(JSON.stringify(scraped, null, 2))
  process.exit(0)
}

const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
const existingByName = new Map()
for (const r of existing) if (r.name) existingByName.set(r.name.toLowerCase().trim(), r)

let added = 0, enriched = 0
for (const r of scraped) {
  const key = r.name.toLowerCase().trim()
  if (existingByName.has(key)) {
    const ex = existingByName.get(key)
    if (!ex.url && r.url) ex.url = r.url
    if (!ex.title && r.title) ex.title = r.title
    if (!ex.department && r.department) ex.department = r.department
    if (!ex.institution && r.institution) ex.institution = r.institution
    if (!ex.id) ex.id = r.id
    enriched++
  } else {
    existing.push(r)
    existingByName.set(key, r)
    added++
  }
}

for (const r of existing) if (!r.id) r.id = slugify(r.name)

writeFileSync(DATA_PATH, JSON.stringify(existing, null, 2))
console.log(`\nWrote ${existing.length} total · +${added} new · ${enriched} enriched`)

const byInst = {}
for (const r of existing) {
  const k = r.institution || 'Other'
  byInst[k] = (byInst[k] || 0) + 1
}
console.log('By institution:')
for (const [k, v] of Object.entries(byInst).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`)
}
