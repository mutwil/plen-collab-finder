// Batch 9: DTU Bioengineering (via orbit.dtu.dk, user-fetched past Cloudflare)
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

const EXCLUDE = /emerit|emerita|guest|visiting|ph\.?d|postdoc|student|external/i
const INCLUDE = /(professor|associate\sprofessor|assistant\sprofessor|tenure|senior\sresearcher|head\sof\sdepartment|head\sof\ssection|group\sleader)/i

function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }
function keep(t) { if (!t) return false; if (EXCLUDE.test(t)) return false; return INCLUDE.test(t) }

const DATA = [
  ["Jane Wittrup Agger","Associate Professor","https://orbit.dtu.dk/en/persons/jane-wittrup-agger/"],
  ["Kristian Barrett","Assistant Professor","https://orbit.dtu.dk/en/persons/kristian-barrett/"],
  ["Lars Behrendt","Associate Professor","https://orbit.dtu.dk/en/persons/lars-behrendt/"],
  ["Melisa Benard Valle","Assistant Professor","https://orbit.dtu.dk/en/persons/melisa-benard-valle/"],
  ["Mikkel Bentzon-Tilia","Associate Professor","https://orbit.dtu.dk/en/persons/mikkel-bentzon-tilia/"],
  ["Hans Christopher Bernstein","Professor","https://orbit.dtu.dk/en/persons/hans-christopher-bernstein/"],
  ["Kai Blin","Senior Researcher","https://orbit.dtu.dk/en/persons/kai-blin/"],
  ["Susanne Brix","Professor","https://orbit.dtu.dk/en/persons/susanne-brix/"],
  ["Alexander Kai Buell","Professor","https://orbit.dtu.dk/en/persons/alexander-kai-buell/"],
  ["Pep Charusanti","Senior Researcher","https://orbit.dtu.dk/en/persons/pep-charusanti/"],
  ["Bjarke Bak Christensen","Head of Department","https://orbit.dtu.dk/en/persons/bjarke-bak-christensen/"],
  ["Pablo Cruz-Morales","Senior Researcher","https://orbit.dtu.dk/en/persons/pablo-cruz-morales/"],
  ["Rune Busk Damgaard","Associate Professor","https://orbit.dtu.dk/en/persons/rune-busk-damgaard/"],
  ["Arnaud Dechesne","Senior Researcher","https://orbit.dtu.dk/en/persons/arnaud-dechesne/"],
  ["Maria Dimaki","Senior Researcher","https://orbit.dtu.dk/en/persons/maria-dimaki/"],
  ["Ling Ding","Associate Professor","https://orbit.dtu.dk/en/persons/ling-ding/"],
  ["Jenny Emnéus","Professor","https://orbit.dtu.dk/en/persons/jenny-emn%C3%A9us/"],
  ["Chiara Francavilla","Associate Professor","https://orbit.dtu.dk/en/persons/chiara-francavilla/"],
  ["Rasmus John Normand Frandsen","Professor","https://orbit.dtu.dk/en/persons/rasmus-john-normand-frandsen/"],
  ["Jens Christian Frisvad","Professor","https://orbit.dtu.dk/en/persons/jens-christian-frisvad/"],
  ["Steffen Goletz","Professor","https://orbit.dtu.dk/en/persons/steffen-goletz/"],
  ["Lone Gram","Professor","https://orbit.dtu.dk/en/persons/lone-gram/"],
  ["Maher Abou Hachem","Professor","https://orbit.dtu.dk/en/persons/maher-abou-hachem/"],
  ["Peter M. H. Heegaard","Professor","https://orbit.dtu.dk/en/persons/peter-m-h-heegaard/"],
  ["Hooman Hefzi","Associate Professor","https://orbit.dtu.dk/en/persons/hooman-hefzi/"],
  ["Arto Rainer Heiskanen","Senior Researcher","https://orbit.dtu.dk/en/persons/arto-rainer-heiskanen/"],
  ["Bernard Paul Henrissat","Professor","https://orbit.dtu.dk/en/persons/bernard-paul-henrissat/"],
  ["Jesper Holck","Senior Researcher","https://orbit.dtu.dk/en/persons/jesper-holck/"],
  ["Jakob Blæsbjerg Hoof","Associate Professor","https://orbit.dtu.dk/en/persons/jakob-bl%C3%A6sbjerg-hoof/"],
  ["Scott Alexander Jarmusch","Assistant Professor","https://orbit.dtu.dk/en/persons/scott-alexander-jarmusch/"],
  ["Liselotte Jauffred","Associate Professor","https://orbit.dtu.dk/en/persons/liselotte-jauffred/"],
  ["Lars Jelsbak","Professor","https://orbit.dtu.dk/en/persons/lars-jelsbak/"],
  ["Timothy Patrick Jenkins","Associate Professor","https://orbit.dtu.dk/en/persons/timothy-patrick-jenkins/"],
  ["Emil Damgaard Jensen","Senior Researcher","https://orbit.dtu.dk/en/persons/emil-damgaard-jensen/"],
  ["Konstantinos Kalogeropoulos","Assistant Professor","https://orbit.dtu.dk/en/persons/konstantinos-kalogeropoulos/"],
  ["Susanne Søndergaard Kappel","Associate Professor","https://orbit.dtu.dk/en/persons/susanne-s%C3%B8ndergaard-kappel/"],
  ["Mogens Kilstrup","Associate Professor","https://orbit.dtu.dk/en/persons/mogens-kilstrup/"],
  ["Pia Klausen","Associate Professor","https://orbit.dtu.dk/en/persons/pia-klausen/"],
  ["Thomas Ostenfeld Larsen","Professor","https://orbit.dtu.dk/en/persons/thomas-ostenfeld-larsen/"],
  ["Andreas Hougaard Laustsen-Kiel","Professor","https://orbit.dtu.dk/en/persons/andreas-hougaard-laustsen-kiel/"],
  ["Nathan Enoch Lewis","Professor","https://orbit.dtu.dk/en/persons/nathan-enoch-lewis/"],
  ["Anne Ljungars","Senior Researcher","https://orbit.dtu.dk/en/persons/anne-ljungars/"],
  ["Jan Martinussen","Associate Professor","https://orbit.dtu.dk/en/persons/jan-martinussen/"],
  ["Jennifer bellanca Hughes Martiny","Professor","https://orbit.dtu.dk/en/persons/jennifer-bellanca-hughes-martiny/"],
  ["Anne S. Meyer","Professor","https://orbit.dtu.dk/en/persons/anne-s-meyer/"],
  ["Uffe Hasbro Mortensen","Professor","https://orbit.dtu.dk/en/persons/uffe-hasbro-mortensen/"],
  ["Jens Preben Morth","Professor","https://orbit.dtu.dk/en/persons/jens-preben-morth/"],
  ["Solange I. Mussatto","Professor","https://orbit.dtu.dk/en/persons/solange-i-mussatto/"],
  ["Marie Sofie Møller","Associate Professor","https://orbit.dtu.dk/en/persons/marie-sofie-m%C3%B8ller/"],
  ["Katrine Nedergaard","Head of Department","https://orbit.dtu.dk/en/persons/katrine-nedergaard/"],
  ["Joseph Nesme","Senior Researcher","https://orbit.dtu.dk/en/persons/joseph-nesme/"],
  ["Casper-Emil Tingskov Pedersen","Senior Researcher","https://orbit.dtu.dk/en/persons/casper-emil-tingskov-pedersen/"],
  ["Lasse Ebdrup Pedersen","Senior Researcher","https://orbit.dtu.dk/en/persons/lasse-ebdrup-pedersen/"],
  ["Søren Dalsgård Petersen","Associate Professor","https://orbit.dtu.dk/en/persons/s%C3%B8ren-dalsg%C3%A5rd-petersen/"],
  ["Valdemaras Petrosius","Assistant Professor","https://orbit.dtu.dk/en/persons/valdemaras-petrosius/"],
  ["Soumik Ray","Assistant Professor","https://orbit.dtu.dk/en/persons/soumik-ray/"],
  ["Lisa Maria Riedmayr","Assistant Professor","https://orbit.dtu.dk/en/persons/lisa-maria-riedmayr/"],
  ["Esperanza Rivera de Torre","Associate Professor","https://orbit.dtu.dk/en/persons/esperanza-rivera-de-torre/"],
  ["José Luis Martinez Ruiz","Associate Professor","https://orbit.dtu.dk/en/persons/jos%C3%A9-luis-martinez-ruiz/"],
  ["Erwin Schoof","Professor","https://orbit.dtu.dk/en/persons/erwin-schoof/"],
  ["Kerstin Skovgaard","Senior Researcher","https://orbit.dtu.dk/en/persons/kerstin-skovgaard/"],
  ["Claus Sternberg","Senior Researcher","https://orbit.dtu.dk/en/persons/claus-sternberg/"],
  ["Mikael Lenz Strube","Associate Professor","https://orbit.dtu.dk/en/persons/mikael-lenz-strube/"],
  ["Winnie Edith Svendsen","Professor","https://orbit.dtu.dk/en/persons/winnie-edith-svendsen/"],
  ["Tanvi Taparia","Assistant Professor","https://orbit.dtu.dk/en/persons/tanvi-taparia/"],
  ["Anna Hammerich Thysen","Assistant Professor","https://orbit.dtu.dk/en/persons/anna-hammerich-thysen/"],
  ["Tilmann Weber","Professor","https://orbit.dtu.dk/en/persons/tilmann-weber/"],
  ["Peter Westh","Professor","https://orbit.dtu.dk/en/persons/peter-westh/"],
  ["Birgitte Zeuner","Associate Professor","https://orbit.dtu.dk/en/persons/birgitte-zeuner/"],
  ["Shengda Zhang","Associate Professor","https://orbit.dtu.dk/en/persons/shengda-zhang/"],
]

const newRecords = []
for (const [name, title, url] of DATA) {
  if (!keep(title)) continue
  newRecords.push({ id: slugify(name), name: name.trim(), title, department: 'DTU Bioengineering', institution: 'Technical University of Denmark', url })
}

const existingByName = new Map()
for (const r of existing) if (r.name) existingByName.set(r.name.toLowerCase().trim(), r)

let added = 0, enriched = 0
for (const r of newRecords) {
  const key = r.name.toLowerCase().trim()
  if (existingByName.has(key)) {
    const ex = existingByName.get(key)
    if (!ex.url?.startsWith('https://orbit.dtu.dk') && r.url) ex.url = r.url  // prefer real profile URL
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
