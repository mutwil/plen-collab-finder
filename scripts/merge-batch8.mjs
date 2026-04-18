// Batch 8: DTU Food heads of research groups
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

const DTU_FOOD = [
  { name: 'Frank Møller Aarestrup', title: 'Professor', email: 'fmaa@food.dtu.dk' },
  { name: 'Katrine Lindholm Bøgh', title: 'Professor', email: 'kalb@food.dtu.dk' },
  { name: 'Lisbeth Truelstrup Hansen', title: 'Professor', email: 'litr@food.dtu.dk' },
  { name: 'René S. Hendriksen', title: 'Professor', email: 'rshe@food.dtu.dk' },
  { name: 'Charlotte Jacobsen', title: 'Professor', email: 'chja@food.dtu.dk' },
  { name: 'Peter Ruhdal Jensen', title: 'Professor', email: 'perj@food.dtu.dk' },
  { name: 'Scott Thomas McClure', title: 'Associate Professor', email: 'scomc@food.dtu.dk' },
  { name: 'Mohammadamin Mohammadifar', title: 'Associate Professor', email: 'moamo@food.dtu.dk' },
  { name: 'Martin Steen Mortensen', title: 'Senior Researcher', email: 'masmo@food.dtu.dk' },
  { name: 'Gitte Ravn-Haren', title: 'Senior Researcher', email: 'girh@food.dtu.dk' },
  { name: 'Marianne Sandberg', title: 'Senior Researcher', email: 'marsan@food.dtu.dk' },
  { name: 'Jens Jørgen Sloth', title: 'Professor', email: 'jjsl@food.dtu.dk' },
  { name: 'Terje Svingen', title: 'Professor', email: 'tesv@food.dtu.dk' },
]

const LANDING = 'https://www.food.dtu.dk/english/about-us/heads-of-research-groups'

const newRecords = DTU_FOOD.map((r) => ({
  id: slugify(r.name),
  name: r.name,
  title: r.title,
  department: 'DTU Food',
  institution: 'Technical University of Denmark',
  url: LANDING,
}))

const existingByName = new Map()
for (const r of existing) if (r.name) existingByName.set(r.name.toLowerCase().trim(), r)

let added = 0, enriched = 0
for (const r of newRecords) {
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
    existing.push(r); existingByName.set(key, r); added++
  }
}

for (const r of existing) if (!r.id) r.id = slugify(r.name)
writeFileSync(DATA_PATH, JSON.stringify(existing, null, 2))
console.log(`Total: ${existing.length} · +${added} new · ${enriched} enriched`)
