// Per-site custom Playwright handlers for Danish universities that resist
// generic scraping (ITU, AAU, RUC, SDU, DTU Biosustain/Bioengineering, etc.).
// Each handler knows the target site's specific HTML structure.

import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const DRY = process.argv.includes('--dry')
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null

const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|ph\.?d\.?|postdoc|student|external|administr/i
const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|group\sleader|principal\sinvestigator|section\shead|head\sof\ssection|head\sof\sdepartment|head\sof\scentre|centre\sdirector|center\sdirector)/i

const TITLE_MAP = {
  'lektor': 'Associate Professor',
  'adjunkt': 'Assistant Professor',
  'tenure track adjunkt': 'Tenure Track Assistant Professor',
  'seniorforsker': 'Senior Researcher',
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

// ─── Custom handlers per site ────────────────────────────────────

const sources = [
  {
    id: 'itu',
    institution: 'IT University of Copenhagen',
    department: 'ITU',
    url: 'https://pure.itu.dk/en/persons/',
    scrape: async (page) => {
      const results = []
      const seen = new Set()
      // Pure portal typically paginates; crawl pages
      for (let p = 0; p < 10; p++) {
        const pageUrl = `https://pure.itu.dk/en/persons/?page=${p}`
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
        await page.waitForTimeout(1000)
        const found = await page.evaluate(() => {
          const out = []
          document.querySelectorAll('.rendering_person, .rendering_short, .grid-result-item, h3.title').forEach((el) => {
            const link = el.querySelector('a[href*="/persons/"]') || el.closest('a[href*="/persons/"]')
            const name = (link?.innerText || el.querySelector('.name, h3')?.innerText || el.innerText)?.split('\n')[0]?.trim()
            const title = el.querySelector('.job-title, .title, .role, .staff-title')?.innerText?.trim()
              || el.parentElement?.querySelector('.job-title, .role')?.innerText?.trim()
            const url = link?.href
            if (name && title) out.push({ name, title, url })
          })
          return out
        })
        if (found.length === 0) break
        let newOnes = 0
        for (const f of found) {
          const k = f.name.toLowerCase().trim()
          if (seen.has(k)) continue
          seen.add(k)
          results.push(f)
          newOnes++
        }
        if (newOnes === 0) break
      }
      return results
    },
  },
  {
    id: 'aau-cs',
    institution: 'Aalborg University',
    department: 'AAU Computer Science',
    url: 'https://www.cs.aau.dk/research/staff',
    scrape: async (page) => {
      await page.goto('https://www.cs.aau.dk/research/staff', { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {})
      await page.waitForTimeout(2000)
      return await page.evaluate(() => {
        const out = []
        const titles = /Professor|Associate Professor|Assistant Professor|Lektor|Adjunkt|Postdoc|Senior Researcher|Tenure Track/i
        document.querySelectorAll('li, tr, article, .person, .staff-item').forEach((row) => {
          const text = row.innerText || ''
          const link = row.querySelector('a')
          const name = row.querySelector('h2, h3, .name, strong')?.innerText?.trim() || link?.innerText?.trim()
          const m = text.match(/(Professor(?:\s(?:MSO|WSR|med\ssærlige))?|Associate Professor(?:\s-?\s?Tenure[\w\s]*)?|Assistant Professor(?:\s-?\s?Tenure[\w\s]*)?|Tenure Track[\w\s]*|Senior Researcher|Head of Department|Head of Section)/i)
          if (name && m && name.length > 2 && name.length < 120) {
            out.push({ name, title: m[1].trim(), url: link?.href })
          }
        })
        const seen = new Set()
        return out.filter((r) => { const k = r.name.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
      })
    },
  },
  {
    id: 'ruc',
    institution: 'Roskilde University',
    department: 'RUC',
    url: 'https://forskning.ruc.dk/en/persons/',
    scrape: async (page) => {
      const results = []
      const seen = new Set()
      for (let p = 0; p < 15; p++) {
        const url = `https://forskning.ruc.dk/en/persons/?page=${p}`
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
        await page.waitForTimeout(1200)
        const found = await page.evaluate(() => {
          const out = []
          document.querySelectorAll('.rendering_person_short, .rendering_person, li.grid-result-item').forEach((el) => {
            const link = el.querySelector('a[href*="/persons/"]')
            const name = link?.innerText?.trim() || el.querySelector('h3, .name')?.innerText?.trim()
            const title = el.querySelector('.job-title, .staff-title, .role')?.innerText?.trim()
            const url = link?.href
            if (name && title) out.push({ name, title, url })
          })
          return out
        })
        if (found.length === 0) break
        let newOnes = 0
        for (const f of found) {
          const k = f.name.toLowerCase().trim()
          if (seen.has(k)) continue
          seen.add(k); results.push(f); newOnes++
        }
        if (newOnes === 0) break
      }
      return results
    },
  },
  {
    id: 'sdu-pure',
    institution: 'University of Southern Denmark',
    department: 'SDU',
    url: 'https://portal.findresearcher.sdu.dk/en/persons/',
    scrape: async (page) => {
      const results = []
      const seen = new Set()
      for (let p = 0; p < 25; p++) {
        const url = `https://portal.findresearcher.sdu.dk/en/persons/?page=${p}`
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
        await page.waitForTimeout(1500)
        const found = await page.evaluate(() => {
          const out = []
          document.querySelectorAll('.rendering_person_short, .rendering_person, li.list-result-item, li.grid-result-item').forEach((el) => {
            const link = el.querySelector('a[href*="/persons/"]')
            const name = link?.innerText?.trim() || el.querySelector('h3, .name')?.innerText?.trim()
            const title = el.querySelector('.job-title, .staff-title, .role, span.title')?.innerText?.trim()
            const url = link?.href
            if (name && title && name.length < 120) out.push({ name, title, url })
          })
          return out
        })
        if (found.length === 0) break
        let newOnes = 0
        for (const f of found) {
          const k = f.name.toLowerCase().trim()
          if (seen.has(k)) continue
          seen.add(k); results.push(f); newOnes++
        }
        if (newOnes === 0) break
      }
      return results
    },
  },
  {
    id: 'aau-pure',
    institution: 'Aalborg University',
    department: 'AAU',
    url: 'https://vbn.aau.dk/en/persons/',
    scrape: async (page) => {
      const results = []
      const seen = new Set()
      for (let p = 0; p < 25; p++) {
        const url = `https://vbn.aau.dk/en/persons/?page=${p}`
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {})
        await page.waitForTimeout(1500)
        const found = await page.evaluate(() => {
          const out = []
          document.querySelectorAll('.rendering_person_short, .rendering_person, li.list-result-item, li.grid-result-item').forEach((el) => {
            const link = el.querySelector('a[href*="/persons/"]')
            const name = link?.innerText?.trim() || el.querySelector('h3, .name')?.innerText?.trim()
            const title = el.querySelector('.job-title, .staff-title, .role, span.title')?.innerText?.trim()
            const url = link?.href
            if (name && title && name.length < 120) out.push({ name, title, url })
          })
          return out
        })
        if (found.length === 0) break
        let newOnes = 0
        for (const f of found) {
          const k = f.name.toLowerCase().trim()
          if (seen.has(k)) continue
          seen.add(k); results.push(f); newOnes++
        }
        if (newOnes === 0) break
      }
      return results
    },
  },
]

async function run() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 1800 },
  })

  const all = []
  for (const src of sources) {
    if (ONLY && ONLY !== src.id) continue
    const page = await ctx.newPage()
    console.log(`\n▶ ${src.institution} / ${src.department}`)
    try {
      const found = await src.scrape(page)
      console.log(`  Found ${found.length} candidates`)
      let kept = 0
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
        kept++
      }
      console.log(`  Kept ${kept}`)
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
    } finally {
      await page.close()
    }
  }
  await browser.close()
  return all
}

const scraped = await run()
console.log(`\nTotal: ${scraped.length}`)

if (DRY) {
  console.log(JSON.stringify(scraped.slice(0, 10), null, 2))
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
    enriched++
  } else {
    existing.push(r); existingByName.set(key, r); added++
  }
}
for (const r of existing) if (!r.id) r.id = slugify(r.name)
writeFileSync(DATA_PATH, JSON.stringify(existing, null, 2))
console.log(`\nTotal: ${existing.length} · +${added} new · ${enriched} enriched`)
