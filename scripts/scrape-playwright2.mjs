// Enhanced Playwright scraper that paginates through DTU employee directories
// and handles their typical "load more" / filter UIs.

import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'

const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const DRY = process.argv.includes('--dry')

const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|group\sleader|principal\sinvestigator|section\shead|head\sof\ssection|head\sof\sdepartment)/i
const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|administrative|ph\.?d|postdoc|student|teaching/i

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

// Shared extractor: looks for DTU's standard person rows. They render via JS
// into elements with "/person/" anchors.
const dtuExtractor = () => {
  const results = []
  const seen = new Set()
  // Find every anchor pointing at a /person/ URL
  document.querySelectorAll('a[href*="/person/"]').forEach((link) => {
    // Find the containing "row" element — usually a nearby div/li with name + title
    let container = link.closest('[class*="person"], [class*="employee"], [class*="staff"], [class*="Person"], [class*="Employee"], tr, li, article, .row, .card')
    if (!container) container = link.parentElement?.parentElement
    if (!container) return
    const text = container.innerText || ''
    const titleMatch = text.match(/(Professor(?:\s(?:WSR|MSO|Emeritus|Emerita|with special responsibilities))?|Associate Professor(?:\s[-–]\s?Tenure[\w\s]*)?|Assistant Professor(?:\s[-–]\s?Tenure[\w\s]*)?|Tenure Track[\w\s]*|Senior Researcher|Senior Scientist|Group Leader|Section Head|Head of Section|Principal Investigator|Head of Department)/i)
    const title = titleMatch?.[1]?.trim()
    // Name from link text or heading
    let name = link.innerText?.trim()
    if (!name || name.length < 3) {
      const h = container.querySelector('h1, h2, h3, h4, .name, [class*="name"]')
      name = h?.innerText?.trim()
    }
    if (!name || !title) return
    if (name.length < 3 || name.length > 120) return
    const key = name.toLowerCase().trim()
    if (seen.has(key)) return
    seen.add(key)
    results.push({ name, title, url: link.href })
  })
  return results
}

const sources = [
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Biosustain',
    url: 'https://www.biosustain.dtu.dk/about/people',
    settle: async (page) => {
      // Scroll to load lazy content
      for (let i = 0; i < 20; i++) {
        await page.evaluate(() => window.scrollBy(0, 800))
        await page.waitForTimeout(200)
      }
      // Click "Load more" if present
      for (let i = 0; i < 10; i++) {
        const btn = await page.$('button:has-text("Load more"), button:has-text("Show more"), a:has-text("Load more")')
        if (!btn) break
        await btn.click().catch(() => {})
        await page.waitForTimeout(800)
      }
    },
    extract: dtuExtractor,
  },
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Bioengineering',
    url: 'https://www.bioengineering.dtu.dk/about/staff',
    settle: async (page) => {
      for (let i = 0; i < 20; i++) {
        await page.evaluate(() => window.scrollBy(0, 800))
        await page.waitForTimeout(200)
      }
      // Cycle through any "see more" pagination
      for (let i = 0; i < 20; i++) {
        const btn = await page.$('a:has-text("See more"), button:has-text("See more"), a:has-text("Next"), button:has-text("Next")')
        if (!btn) break
        const isEnabled = await btn.isEnabled().catch(() => false)
        if (!isEnabled) break
        await btn.click().catch(() => {})
        await page.waitForTimeout(800)
      }
    },
    extract: dtuExtractor,
  },
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Aqua',
    url: 'https://www.aqua.dtu.dk/om-dtu-aqua/kontakt/medarbejdere',
    settle: async (page) => {
      for (let i = 0; i < 30; i++) {
        await page.evaluate(() => window.scrollBy(0, 800))
        await page.waitForTimeout(200)
      }
    },
    extract: dtuExtractor,
  },
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Compute',
    url: 'https://www.compute.dtu.dk/english/about-us/staff',
    settle: async (page) => {
      for (let i = 0; i < 30; i++) {
        await page.evaluate(() => window.scrollBy(0, 800))
        await page.waitForTimeout(200)
      }
    },
    extract: dtuExtractor,
  },
  {
    institution: 'Technical University of Denmark',
    department: 'DTU Health Tech',
    url: 'https://www.healthtech.dtu.dk/english/contact/staff',
    settle: async (page) => {
      for (let i = 0; i < 30; i++) {
        await page.evaluate(() => window.scrollBy(0, 800))
        await page.waitForTimeout(200)
      }
    },
    extract: dtuExtractor,
  },
]

async function scrapeAll() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 1800 },
  })

  const all = []
  for (const src of sources) {
    const page = await ctx.newPage()
    console.log(`\n▶ ${src.department}`)
    console.log(`  URL: ${src.url}`)
    try {
      const response = await page.goto(src.url, { waitUntil: 'networkidle', timeout: 60000 })
      if (!response || !response.ok()) {
        console.log(`  HTTP ${response?.status()}`)
        continue
      }
      // Accept cookies if shown
      const cookieBtn = await page.$('button:has-text("Accept"), button:has-text("Allow all"), button:has-text("OK")')
      if (cookieBtn) { await cookieBtn.click().catch(() => {}); await page.waitForTimeout(500) }

      if (src.settle) await src.settle(page)

      const found = await page.evaluate(src.extract)
      console.log(`  Found ${found.length} candidates`)
      let kept = 0
      for (const f of found) {
        const title = translateTitle(f.title)
        if (!keep(title)) continue
        kept++
        all.push({
          id: slugify(f.name),
          name: f.name.trim(),
          title,
          department: src.department,
          institution: src.institution,
          url: f.url,
        })
      }
      console.log(`  Kept ${kept} after title filter`)
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
    } finally {
      await page.close()
    }
  }

  await browser.close()
  return all
}

const scraped = await scrapeAll()
console.log(`\nTotal scraped: ${scraped.length}`)

if (DRY) {
  console.log(JSON.stringify(scraped.slice(0, 5), null, 2))
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
console.log(`\nTotal: ${existing.length} · +${added} new · ${enriched} enriched`)

const byInst = {}
const byDept = {}
for (const r of existing) {
  byInst[r.institution || 'Other'] = (byInst[r.institution || 'Other'] || 0) + 1
  byDept[r.department || '(none)'] = (byDept[r.department || '(none)'] || 0) + 1
}
console.log('\nBy institution:')
for (const [k, v] of Object.entries(byInst).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
console.log('\nBy department:')
for (const [k, v] of Object.entries(byDept).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
