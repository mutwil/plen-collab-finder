// Batch 2 scraped data merged into researchers.json
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

function normalize(n) { if (n.includes(',')) { const [l,f]=n.split(',').map(s=>s.trim()); return `${f} ${l}` } return n.trim() }
function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }

const DRUG_DATA = [
  ["Dan Stærk","Professor","/?pure=en/persons/321761"],
  ["Anders Bach","Professor","/?pure=en/persons/193681"],
  ["Anders A. Jensen","Professor","/?pure=en/persons/321896"],
  ["Anne-Marie Heegaard","Professor","/?pure=en/persons/170012"],
  ["Bente Frølund","Professor","/?pure=en/persons/321799"],
  ["Christian Adam Olsen","Professor","/?pure=en/persons/321648"],
  ["David E. Gloriam","Professor","/?pure=en/persons/352279"],
  ["Flemming Steen Jørgensen","Professor","/?pure=en/persons/16003"],
  ["Jesper Langgaard Kristensen","Professor","/?pure=en/persons/319358"],
  ["Jette Sandholm Jensen Kastrup","Professor","/?pure=en/persons/157928"],
  ["Kristian Strømgaard","Professor","/?pure=en/persons/321875"],
  ["Lasse Kristoffer Bak","Professor","/?pure=en/persons/319883"],
  ["Lennart Bunch","Professor","/?pure=en/persons/230458"],
  ["Matthias Manfred Herth","Professor","/?pure=en/persons/403658"],
  ["Miriam Kolko","Professor","/?pure=en/persons/81581"],
  ["Morten Lindow","Professor","/?pure=en/persons/64602"],
  ["Morten Andersen","Professor","/?pure=en/persons/145405"],
  ["Nicholas M I Taylor","Professor","/?pure=en/persons/605665"],
  ["Petrine Wellendorph","Professor","/?pure=en/persons/319020"],
  ["Rasmus Prætorius Clausen","Professor","/?pure=en/persons/321762"],
  ["Stefan Vogel","Professor","/?pure=en/persons/322978"],
  ["Stephan Pless","Professor","/?pure=en/persons/472470"],
  ["Trond Ulven","Professor","/?pure=en/persons/343509"],
  ["Albert Jelke Kooistra","Associate Professor","/?pure=en/persons/612712"],
  ["Alexander Sebastian Hauser","Associate Professor","/?pure=en/persons/489126"],
  ["Anders Skov Kristensen","Associate Professor","/?pure=en/persons/321697"],
  ["Annette Eva Langkilde","Associate Professor","/?pure=en/persons/159519"],
  ["Anne Byriel Walls","Associate Professor","/?pure=en/persons/320253"],
  ["Azadeh Shahsavar","Associate Professor","/?pure=en/persons/400520"],
  ["Céline Galvagnion-Büll","Associate Professor","/?pure=en/persons/644238"],
  ["Elisabeth Rexen Ulven","Associate Professor","/?pure=en/persons/540552"],
  ["Henrik Franzyk","Associate Professor","/?pure=en/persons/321773"],
  ["Jesper M. Mathiesen","Associate Professor","/?pure=en/persons/72863"],
  ["Joseph Matthew Rogers","Associate Professor","/?pure=en/persons/683103"],
  ["Karla Andrea Frydenvang","Associate Professor","/?pure=en/persons/60647"],
  ["Kristi Anne Kohlmeier","Associate Professor","/?pure=en/persons/352872"],
  ["Majid Sheykhzade","Associate Professor","/?pure=en/persons/321672"],
  ["Maurizio Sessa","Associate Professor","/?pure=en/persons/623477"],
  ["Morten Baltzer Houlind","Associate Professor","/?pure=en/persons/321335"],
  ["Niels Skotte","Associate Professor","/?pure=en/persons/179472"],
  ["Osman Asghar Mirza","Associate Professor","/?pure=en/persons/70309"],
  ["Patrick Mac Donald Fisher","Associate Professor","/?pure=en/persons/443333"],
  ["Paul Robert Hansen","Associate Professor","/?pure=en/persons/116652"],
  ["Tri Hien Viet Huynh","Associate Professor","/?pure=en/persons/365909"],
  ["Trine Meldgaard Lund","Associate Professor","/?pure=en/persons/118265"],
  ["Tuula Anneli Kallunki","Associate Professor","/?pure=en/persons/382358"],
  ["Uffe Kristiansen","Associate Professor","/?pure=en/persons/295593"],
  ["Charlotte Vermehren","Associate Professor","/?pure=en/persons/129863"],
  ["Christian Kofoed","Assistant Professor","/?pure=en/persons/371936"],
  ["Christian Bernard Matthijs Poulie","Assistant Professor","/?pure=en/persons/438255"],
  ["Erika Bianca Torres Villanueva","Assistant Professor","/?pure=en/persons/545588"],
  ["Francesco Bavo","Assistant Professor","/?pure=en/persons/583069"],
  ["Haidai Hu","Assistant Professor","/?pure=en/persons/681605"],
  ["Janina Soermann","Assistant Professor","/?pure=en/persons/792336"],
  ["Jane Knöchel","Tenure Track Assistant Professor","/?pure=en/persons/923029"],
  ["Jonas Sigurd Mortensen","Assistant Professor","/?pure=en/persons/373463"],
  ["Markus Staudt","Assistant Professor","/?pure=en/persons/503305"],
  ["Trinh Trung Duong Nguyen","Assistant Professor","/?pure=en/persons/729949"],
]

const SDU_POP_DATA = [
  ["Samuel Cushman","Professor","https://portal.findresearcher.sdu.dk/en/persons/cushman/"],
  ["Johan Dahlgren","Associate Professor","https://portal.findresearcher.sdu.dk/da/persons/johan-dahlgren"],
  ["Owen R. Jones","Associate Professor","https://portal.findresearcher.sdu.dk/da/persons/owen-r-jones"],
  ["Morgane Tidière","Assistant Professor","https://portal.findresearcher.sdu.dk/da/persons/morgane-tidi%C3%A8re"],
]

const blocks = [
  { institution: 'University of Copenhagen', department: 'Drug Design & Pharmacology', baseHost: 'https://drug.ku.dk', data: DRUG_DATA },
  { institution: 'University of Southern Denmark', department: 'SDU Population Biology', baseHost: null, data: SDU_POP_DATA },
]

const newRecords = []
for (const b of blocks) {
  for (const [rawName, title, rawUrl] of b.data) {
    const name = normalize(rawName)
    let url
    if (!rawUrl) url = undefined
    else if (rawUrl.startsWith('http')) url = rawUrl
    else if (rawUrl.startsWith('/')) url = b.baseHost + rawUrl
    else url = rawUrl
    newRecords.push({ id: slugify(name), name, title, department: b.department, institution: b.institution, url })
  }
}

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
    existing.push(r)
    existingByName.set(key, r)
    added++
  }
}

for (const r of existing) if (!r.id) r.id = slugify(r.name)

writeFileSync(DATA_PATH, JSON.stringify(existing, null, 2))
console.log(`Total: ${existing.length} · +${added} new · ${enriched} enriched`)

const byInst = {}
for (const r of existing) byInst[r.institution || 'Other'] = (byInst[r.institution || 'Other'] || 0) + 1
for (const [k,v] of Object.entries(byInst).sort((a,b)=>b[1]-a[1])) console.log(`  ${k}: ${v}`)
