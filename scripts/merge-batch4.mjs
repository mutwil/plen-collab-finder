// Batch 4: KU Math + NBI
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|ph\.?d|postdoc|student|teaching/i
const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|head\sof\sdepartment|head\sof\scentre)/i

function normalize(n) { if (n.includes(',')) { const [l,f]=n.split(',').map(s=>s.trim()); return `${f} ${l}` } return n.trim() }
function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }
function keep(t) { if (!t) return false; if (EXCLUDE.test(t)) return false; return INCLUDE.test(t) }

const KU_MATH = [
  ["Bladt, Martin Rainer","Associate Professor - Promotion Programme","?pure=en/persons/525144"],
  ["Bladt, Mogens","Professor","?pure=en/persons/223867"],
  ["Boomsma, Trine Krogh","Professor","?pure=en/persons/338446"],
  ["Burklund, Robert Wayne","Associate Professor","?pure=en/persons/759603"],
  ["Christandl, Matthias","Professor","?pure=en/persons/475476"],
  ["Clemmensen, Line Katrine Harder","Professor","?pure=en/persons/574615"],
  ["Collamore, Jeffrey F.","Professor","?pure=en/persons/255622"],
  ["Ditlevsen, Susanne","Professor","?pure=en/persons/99891"],
  ["Eilers, Søren","Professor","?pure=en/persons/79756"],
  ["Esnault, Hélène","Professor","?pure=en/persons/624916"],
  ["Feliu, Elisenda","Professor","?pure=en/persons/421663"],
  ["Fournais, Søren","Professor","?pure=en/persons/200128"],
  ["Grodal, Jesper","Professor","?pure=en/persons/175233"],
  ["Hansen, Ernst","Associate Professor","?pure=en/persons/110906"],
  ["Hansen, Niels Richard","Professor","?pure=en/persons/19211"],
  ["Hesselholt, Lars","Professor","?pure=en/persons/318798"],
  ["Hiabu, Munir Eberhardt","Associate Professor","?pure=en/persons/730783"],
  ["Holm, Henrik Granau","Professor","?pure=en/persons/74270"],
  ["Iwasa, Ryomei","Associate Professor","?pure=en/persons/624301"],
  ["Kiming, Ian","Professor","?pure=en/persons/108579"],
  ["Kjeldsen, Tinne Hoff","Professor","?pure=en/persons/829"],
  ["Kock, Joachim","Associate Professor","?pure=en/persons/729509"],
  ["Lützen, Jesper","Assistant Professor","?pure=en/persons/45480"],
  ["Mancinska, Laura","Associate Professor - Promotion Programme","?pure=en/persons/604782"],
  ["Markussen, Bo","Professor","?pure=en/persons/23943"],
  ["Matz, Jasmin","Associate Professor","?pure=en/persons/654341"],
  ["Miller, Marek Leonard","Assistant Professor","?pure=en/persons/778825"],
  ["Møller, Niels Martin","Associate Professor - Promotion Programme","?pure=en/persons/546766"],
  ["Musat, Magdalena Elena","Professor","?pure=en/persons/322102"],
  ["Nordentoft, Asbjørn Christian","Assistant Professor - Tenure Track","?pure=en/persons/433488"],
  ["Osajda, Damian Longin","Professor","?pure=en/persons/763933"],
  ["Pantuso, Giovanni","Associate Professor","?pure=en/persons/537813"],
  ["Pazuki, Fabien","Professor","?pure=en/persons/443741"],
  ["Pedersen, Henrik Laurberg","Professor","?pure=en/persons/132271"],
  ["Pedersen, Thomas Vils","Associate Professor","?pure=en/persons/88884"],
  ["Pedersen, Jesper Lund","Associate Professor","?pure=en/persons/256513"],
  ["Poulsen, Rolf","Professor","?pure=en/persons/197796"],
  ["Reinecke, Emanuel","Assistant Professor - Tenure Track","?pure=en/persons/916906"],
  ["Risager, Morten S.","Professor","?pure=en/persons/318794"],
  ["Rørdam, Mikael","Professor","?pure=en/persons/35395"],
  ["Schlichtkrull, Henrik","Professor","?pure=en/persons/149827"],
  ["Skovmand, David Glavind","Associate Professor","?pure=en/persons/499763"],
  ["Solovej, Jan Philip","Professor","?pure=en/persons/78264"],
  ["Spaas, Pieter Patrick B","Assistant Professor","?pure=en/persons/759818"],
  ["Steffensen, Mogens","Head of Department","?pure=en/persons/172387"],
  ["Stilck França, Daniel","Associate Professor","?pure=en/persons/624303"],
  ["Sørensen, Helle","Professor","?pure=en/persons/141330"],
  ["Törnquist, Asger Dag","Associate Professor - Promotion Programme","?pure=en/persons/139827"],
  ["Wahl, Nathalie","Professor","?pure=en/persons/301863"],
  ["Weichwald, Sebastian","Associate Professor","?pure=en/persons/653750"],
  ["Werner, Albert H.","Associate Professor - Promotion Programme","?pure=en/persons/559298"],
  ["Wiesel, Johannes","Associate Professor","?pure=en/persons/836832"],
  ["Wiuf, Carsten","Professor","?pure=en/persons/156899"],
  ["Yang, Jun","Assistant Professor - Tenure Track","?pure=en/persons/779292"],
  ["Lundborg, Anton Rask","Assistant Professor - Tenure Track","?pure=en/persons/493262"],
]

const NBI = [
  ["Ahlers, Markus Tobias","Associate Professor","?pure=en/persons/582260"],
  ["Andersen, Anja C.","Professor","?pure=en/persons/143217"],
  ["Andersen, Brian Møller","Professor","?pure=en/persons/68013"],
  ["Baklanov, Alexander","Professor","?pure=en/persons/499662"],
  ["Bearden, Ian","Professor","?pure=en/persons/123633"],
  ["Bekkevold, Ivanka M Orozova","Associate Professor","?pure=en/persons/387645"],
  ["Bendix, Pól Martin","Associate Professor","?pure=en/persons/183591"],
  ["Bjerrum-Bohr, Emil","Associate Professor","?pure=en/persons/25000"],
  ["Blunier, Thomas","Professor","?pure=en/persons/337115"],
  ["Brammer, Gabriel","Associate Professor","?pure=en/persons/625553"],
  ["Brito Brasil, Tulio","Assistant Professor","?pure=en/persons/621865"],
  ["Bustamante, Mauricio","Associate Professor","?pure=en/persons/592901"],
  ["Béguin, Jean-Baptiste Sylvain","Assistant Professor","?pure=en/persons/417503"],
  ["Camplani, Alessandra","Assistant Professor","?pure=en/persons/610346"],
  ["Cardoso, Vitor","Professor","?pure=en/persons/706818"],
  ["Chael, Andrew Alan","Assistant Professor","?pure=en/persons/929034"],
  ["Chen, Gang","Associate Professor","?pure=en/persons/765112"],
  ["Christensen, Lise Bech","Associate Professor","?pure=en/persons/73383"],
  ["Christensen, Jens Hesselbjerg","Professor","?pure=en/persons/74079"],
  ["Christensen, Morten Holm","Assistant Professor","?pure=en/persons/347033"],
  ["Cook, Eliza","Assistant Professor","?pure=en/persons/505651"],
  ["Dahl-Jensen, Dorthe","Professor","?pure=en/persons/45103"],
  ["Dam, Mogens","Professor","?pure=en/persons/149900"],
  ["Damgaard, Poul Henrik","Professor","?pure=en/persons/1841"],
  ["Ditlevsen, Peter","Professor","?pure=en/persons/6225"],
  ["Doostmohammadi, Amin","Associate Professor - Promotion Programme","?pure=en/persons/654165"],
  ["Ezquiaga, Jose Maria","Associate Professor","?pure=en/persons/446155"],
  ["Flensberg, Karsten","Professor","?pure=en/persons/185400"],
  ["Fynbo, Johan Peter Uldall","Professor","?pure=en/persons/212297"],
  ["Gkinis, Vasileios","Associate Professor","?pure=en/persons/339558"],
  ["Grinsted, Aslak","Associate Professor","?pure=en/persons/132787"],
  ["Hansen, Steen Harle","Professor","?pure=en/persons/94130"],
  ["Hansen, Jørgen Beck","Associate Professor","?pure=en/persons/175635"],
  ["Harmark, Troels","Associate Professor","?pure=en/persons/19668"],
  ["Haugbølle, Troels","Associate Professor","?pure=en/persons/12830"],
  ["Hedegård, Per","Professor","?pure=en/persons/135905"],
  ["Heimburg, Thomas Rainer","Professor","?pure=en/persons/269442"],
  ["Heinesen, Asta","Assistant Professor","?pure=en/persons/373505"],
  ["Heintz, Kasper Elm","Assistant Professor","?pure=en/persons/410542"],
  ["Hjorth, Jens","Professor","?pure=en/persons/183352"],
  ["Hvidberg, Christine Schøtt","Professor","?pure=en/persons/164702"],
  ["Jensen, Mogens Høgh","Professor","?pure=en/persons/7147"],
  ["Jochum, Markus","Professor","?pure=en/persons/437464"],
  ["Jørgensen, Jes Kristian","Professor","?pure=en/persons/126575"],
  ["Jørgensen, Uffe Gråe","Associate Professor","?pure=en/persons/47783"],
  ["Kaas, Eigil","Professor","?pure=en/persons/13737"],
  ["Kakiichi, Koki","Assistant Professor","?pure=en/persons/787693"],
  ["Kan, Yinhui","Assistant Professor","?pure=en/persons/924556"],
  ["Kaneko, Kunihiko","Professor","?pure=en/persons/440257"],
  ["Kjaergaard, Morten","Associate Professor - Promotion Programme","?pure=en/persons/290081"],
  ["Kjær, Helle Astrid","Associate Professor","?pure=en/persons/278283"],
  ["Kristjansen, Charlotte Fløe","Professor","?pure=en/persons/149926"],
  ["Koskinen, D. Jason","Associate Professor","?pure=en/persons/456322"],
  ["Larsen, Andreas Haahr","Assistant Professor","?pure=en/persons/396198"],
  ["Lawrie, William Iain Leonard","Assistant Professor","?pure=en/persons/742111"],
  ["Lefmann, Kim","Professor","?pure=en/persons/30116"],
  ["Liu, Shikai","Assistant Professor","?pure=en/persons/710746"],
  ["Lodahl, Peter","Professor","?pure=en/persons/50596"],
  ["Lohmann, Johannes Jakob","Assistant Professor","?pure=en/persons/540714"],
  ["Luna Godoy, Andres","Assistant Professor","?pure=en/persons/733497"],
  ["Madsen, Morten Bo","Associate Professor","?pure=en/persons/168986"],
  ["Marcus, Charles M.","Professor","?pure=en/persons/379494"],
  ["Mason, Charlotte","Associate Professor - Promotion Programme","?pure=en/persons/724948"],
  ["Mc Partland, Conor John Ryan","Assistant Professor","?pure=en/persons/744976"],
  ["Midolo, Leonardo","Associate Professor - Promotion Programme","?pure=en/persons/460432"],
  ["Minafra, Nicola","Assistant Professor","?pure=en/persons/933925"],
  ["Mitarai, Namiko","Associate Professor","?pure=en/persons/367278"],
]

const TITLE_MAP = {
  'lektor': 'Associate Professor',
  'lektor - forfremmelsesprogrammet': 'Associate Professor',
  'associate professor - promotion programme': 'Associate Professor',
  'adjunkt': 'Assistant Professor',
  'tenure track adjunkt': 'Tenure Track Assistant Professor',
  'assistant professor - tenure track': 'Tenure Track Assistant Professor',
  'seniorforsker': 'Senior Researcher',
  'head of department': 'Head of Department',
}
function translateTitle(t) { const lc = (t||'').toLowerCase().trim(); return TITLE_MAP[lc] || t }

const blocks = [
  { institution: 'University of Copenhagen', department: 'KU Math', baseHost: 'https://www.math.ku.dk', data: KU_MATH },
  { institution: 'University of Copenhagen', department: 'NBI', baseHost: 'https://nbi.ku.dk', data: NBI },
]

const newRecords = []
for (const b of blocks) {
  for (const [rawName, rawTitle, rawUrl] of b.data) {
    const title = translateTitle(rawTitle)
    if (!keep(title)) continue
    const name = normalize(rawName)
    let url
    if (rawUrl && rawUrl.startsWith('?')) url = b.baseHost + '/english/staff/' + rawUrl
    else if (rawUrl && rawUrl.startsWith('http')) url = rawUrl
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
