// Batch 3: PLEN Danish page (fuller) + DIKU
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|centerleder|institutleder)/i
const EXCLUDE = /emerit|emerita|\bemeritus\b|guest|visiting|affiliate|administrative|ph\.?d|postdoc|student/i

const TITLE_MAP = {
  'lektor': 'Associate Professor',
  'lektor - forfremmelsesprogrammet': 'Associate Professor (promotion track)',
  'adjunkt': 'Assistant Professor',
  'tenure track adjunkt': 'Tenure Track Assistant Professor',
  'seniorforsker': 'Senior Researcher',
  'centerleder': 'Center Director',
  'institutleder': 'Head of Department',
}

function translateTitle(t) {
  if (!t) return t
  const lc = t.toLowerCase().trim()
  return TITLE_MAP[lc] || t
}

function normalize(n) {
  if (n.includes(',')) {
    const [l, f] = n.split(',').map((s) => s.trim())
    return `${f} ${l}`
  }
  return n.trim()
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function keep(title) {
  if (!title) return false
  if (EXCLUDE.test(title)) return false
  return INCLUDE.test(title)
}

const PLEN_FULL = [
  ["Agerbirk, Niels","Lektor","?pure=da/persons/310992"],
  ["Andreasen, Christian","Lektor","?pure=da/persons/8801"],
  ["Andersen-Ranberg, Johan","Lektor","?pure=da/persons/280739"],
  ["Bak, Frederik","Adjunkt","?pure=da/persons/331508"],
  ["Bak, Søren","Professor","?pure=da/persons/173299"],
  ["Bjarnholt, Nanna","Lektor - forfremmelsesprogrammet","?pure=da/persons/32784"],
  ["Bornø, Marie Louise","Tenure Track Adjunkt","?pure=da/persons/347419"],
  ["Brandt, Kristian Koefoed","Lektor","?pure=da/persons/212298"],
  ["Brændholt, Andreas","Adjunkt","?pure=da/persons/333000"],
  ["Bruun, Sander","Professor","?pure=da/persons/12773"],
  ["Burow, Meike","Professor","?pure=da/persons/343155"],
  ["Cárdenas, Pablo D.","Adjunkt","?pure=da/persons/604700"],
  ["Carstens, Alexander Byth","Adjunkt","?pure=da/persons/375071"],
  ["Cedergreen, Nina","Professor","?pure=da/persons/310634"],
  ["Christensen, Jan H.","Professor","?pure=da/persons/310964"],
  ["Christensen, Svend","Professor","?pure=da/persons/345309"],
  ["Collinge, David B.","Professor","?pure=da/persons/11699"],
  ["Correia, Pedro Miguel Pereira","Adjunkt","?pure=da/persons/736853"],
  ["Deb, Sohini","Adjunkt","?pure=da/persons/736602"],
  ["Dresbøll, Dorte Bodin","Lektor","?pure=da/persons/315459"],
  ["Fredensborg, Brian Lund","Lektor","?pure=da/persons/438233"],
  ["Fuglsang, Anja Thoe","Professor","?pure=da/persons/36035"],
  ["Geu-Flores, Fernando","Lektor - forfremmelsesprogrammet","?pure=da/persons/310786"],
  ["Ghaley, Bhim Bahadur","Lektor","?pure=da/persons/228779"],
  ["Günther-Pomorski, Thomas","Professor","?pure=da/persons/354775"],
  ["Halkier, Barbara Ann","Professor","?pure=da/persons/125900"],
  ["Hansen, Lars Hestbjerg","Professor","?pure=da/persons/125054"],
  ["Hansen, Hans Chr. Bruun","Professor","?pure=da/persons/65930"],
  ["Hansen, Veronika","Tenure Track Adjunkt","?pure=da/persons/312500"],
  ["Henriksen, Christian Bugge","Lektor","?pure=da/persons/75052"],
  ["Holm, Peter Engelund","Professor","?pure=da/persons/254574"],
  ["Høyland-Kroghsbo, Nina Molin","Lektor","?pure=da/persons/277125"],
  ["Jacobsen, Stine Kramer","Lektor","?pure=da/persons/313152"],
  ["Jensen, Signe Marie","Lektor","?pure=da/persons/221863"],
  ["Jensen, Per Moestrup","Lektor","?pure=da/persons/116671"],
  ["Jensen, Annette Bruun","Lektor","?pure=da/persons/139273"],
  ["Jensen, Lars Stoumann","Professor","?pure=da/persons/184737"],
  ["Jensen, Birgit","Lektor","?pure=da/persons/310832"],
  ["Jørgensen, Hans Jørgen Lyngs","Lektor","?pure=da/persons/309882"],
  ["Jørgensen, Bodil","Lektor","?pure=da/persons/171865"],
  ["Jørgensen, Kirsten","Lektor","?pure=da/persons/171866"],
  ["Kampranis, Sotirios","Professor","?pure=da/persons/543322"],
  ["Kapel, Christian Moliin Outzen","Professor","?pure=da/persons/94545"],
  ["Krahmer, Johanna","Tenure Track Adjunkt","?pure=da/persons/774597"],
  ["Lange, Conny Bruun Asmussen","Lektor","?pure=da/persons/31138"],
  ["Laursen, Kristian Holst","Lektor - forfremmelsesprogrammet","?pure=da/persons/310789"],
  ["Laursen, Tomas","Lektor","?pure=da/persons/311433"],
  ["Lecocq, Antoine","Lektor","?pure=da/persons/371491"],
  ["Liang, Feiyan","Adjunkt","?pure=da/persons/637803"],
  ["Lilay, Grmay Hailu","Tenure Track Adjunkt","?pure=da/persons/419288"],
  ["Liu, Fulai","Professor","?pure=da/persons/310952"],
  ["Lopez Marques, Rosa Laura","Professor","?pure=da/persons/310783"],
  ["Luo, Guangbin","Adjunkt","?pure=da/persons/690450"],
  ["Lysák, Marin Rose","Adjunkt","?pure=da/persons/380999"],
  ["Lütken, Henrik Vlk","Lektor","?pure=da/persons/310258"],
  ["Magid, Jakob","Lektor","?pure=da/persons/44228"],
  ["Meyling, Nicolai Vitt","Lektor","?pure=da/persons/161335"],
  ["Miettinen, Karel Anton","Adjunkt","?pure=da/persons/612493"],
  ["Møller, Birger Lindberg","Professor","?pure=da/persons/97696"],
  ["Müller-Stöver, Dorette Sophie","Lektor","?pure=da/persons/352558"],
  ["Neve, Paul","Professor","?pure=da/persons/710570"],
  ["Nicolaisen, Mette Haubjerg","Lektor","?pure=da/persons/310794"],
  ["Nielsen, Nikoline Juul","Lektor","?pure=da/persons/228256"],
  ["Nielsen, Tue Kjærgaard","Tenure Track Adjunkt","?pure=da/persons/331150"],
  ["Noack, Lise Charlotte Marie","Adjunkt","?pure=da/persons/693373"],
  ["Ochoa Fernandez, Rocio","Adjunkt","?pure=da/persons/708015"],
  ["Ogden, Mike","Adjunkt","?pure=da/persons/742042"],
  ["Ourry, Morgane","Adjunkt","?pure=da/persons/709398"],
  ["Palmgren, Michael Broberg","Professor","?pure=da/persons/95923"],
  ["Pandey, Chandana","Adjunkt","?pure=da/persons/641742"],
  ["Pedersen, Carsten","Lektor","?pure=da/persons/310087"],
  ["Pergament Persson, Daniel","Lektor","?pure=da/persons/310608"],
  ["Persson, Staffan","Professor","?pure=da/persons/675412"],
  ["Petersen, Morten","Institutleder","?pure=da/persons/159910"],
  ["Poulsen, Rikke","Adjunkt","?pure=da/persons/347264"],
  ["Poveda Huertes, Daniel","Adjunkt","?pure=da/persons/711720"],
  ["Raymond, Nelly Sophie","Adjunkt","?pure=da/persons/506202"],
  ["Riber, Leise","Lektor","?pure=da/persons/383117"],
  ["Roitsch, Thomas Georg","Professor","?pure=da/persons/468246"],
  ["Rojas Triana, Monica","Adjunkt","?pure=da/persons/771280"],
  ["Rosenqvist, Eva","Lektor","?pure=da/persons/207353"],
  ["Schulz, Alexander","Professor","?pure=da/persons/309543"],
  ["Sigsgaard, Lene","Lektor","?pure=da/persons/46040"],
  ["Strobel, Bjarne W.","Lektor","?pure=da/persons/309780"],
  ["Svane, Simon Fiil","Adjunkt","?pure=da/persons/331234"],
  ["Tariq, Azeem","Adjunkt","?pure=da/persons/430421"],
  ["Thordal-Christensen, Hans","Professor","?pure=da/persons/207715"],
  ["Thorup-Kristensen, Kristian","Professor","?pure=da/persons/143157"],
  ["Tidemand, Frederik Grønbæk","Adjunkt","?pure=da/persons/410166"],
  ["Tisler, Selina Kornelia","Adjunkt","?pure=da/persons/675360"],
  ["Tobler, Dominique Jeanette","Lektor","?pure=da/persons/441880"],
  ["Toldam-Andersen, Torben Bo","Lektor","?pure=da/persons/309900"],
  ["Tomasi, Giorgio","Lektor","?pure=da/persons/313738"],
  ["Trier, Xenia","Lektor","?pure=da/persons/228963"],
  ["Trinh, Mai Duy Luu","Adjunkt","?pure=da/persons/706273"],
  ["Ulvskov, Peter","Professor","?pure=da/persons/91123"],
  ["van der Bom, Frederik","Tenure Track Adjunkt","?pure=da/persons/474828"],
  ["Xu, Deyang","Lektor","?pure=da/persons/438696"],
  ["Zheng, Shuai","Adjunkt","?pure=da/persons/694751"],
  ["de Fine Licht, Henrik Hjarvard","Lektor - forfremmelsesprogrammet","?pure=da/persons/194704"],
  ["Ørgaard, Marian","Lektor","?pure=da/persons/39398"],
  ["Kot, Witold Piotr","Tenure Track Adjunkt","?pure=da/persons/335675"],
  ["Trevenzoli Favero, Bruno","Adjunkt","?pure=da/persons/544560"],
  ["Wang, Xizi","Adjunkt","?pure=da/persons/594381"],
  ["Moreno Pescador, Guillermo Sergio","Adjunkt","?pure=da/persons/427635"],
]

const DIKU = [
  ["Amir Yehudayoff","Professor","?pure=da/persons/786711"],
  ["Anders Krogh","Professor","?pure=da/persons/8330"],
  ["Anders Søgaard","Professor","?pure=da/persons/221553"],
  ["Barry Brown","Professor","?pure=da/persons/742081"],
  ["Christian Igel","Professor","?pure=da/persons/400547"],
  ["Christina Lioma","Professor","?pure=da/persons/424829"],
  ["Erik Bjørnager Dam","Professor","?pure=da/persons/93620"],
  ["Ingemar Johansson Cox","Professor","?pure=da/persons/456392"],
  ["Irina Alex Shklovski","Professor","?pure=da/persons/672153"],
  ["Isabelle Augenstein","Professor","?pure=da/persons/597320"],
  ["Jakob Nordström","Professor","?pure=da/persons/638573"],
  ["Jon Sporring","Professor","?pure=da/persons/45217"],
  ["Kasper Hornbæk","Professor","?pure=da/persons/141851"],
  ["Kenny Erleben","Professor","?pure=da/persons/110537"],
  ["Kim Steenstrup Pedersen","Professor","?pure=da/persons/83684"],
  ["Mads Nielsen","Professor","?pure=da/persons/137906"],
  ["Martin Lillholm","Professor","?pure=da/persons/24414"],
  ["Martin Elsman","Professor","?pure=da/persons/127388"],
  ["Mikkel Thorup","Professor","?pure=da/persons/70661"],
  ["Morten Misfeldt","Professor","?pure=da/persons/21225"],
  ["Panagiotis Karras","Professor","?pure=da/persons/710238"],
  ["Pernille Bjørn","Professor","?pure=da/persons/417695"],
  ["Philippe Bonnet","Professor","?pure=da/persons/214771"],
  ["Rasmus Pagh","Professor","?pure=da/persons/309342"],
  ["Robert Glück","Professor","?pure=da/persons/146978"],
  ["Robert Jenssen","Professor","?pure=da/persons/722791"],
  ["Serge Belongie","Professor","?pure=da/persons/575485"],
  ["Stefan Sommer","Professor","?pure=da/persons/254908"],
  ["Stephen Alstrup","Professor","?pure=da/persons/110448"],
  ["Sune Darkner","Professor","?pure=da/persons/383640"],
  ["Thomas Philip Jensen","Professor","?pure=da/persons/120287"],
  ["Thomas Troels Hildebrandt","Professor","?pure=da/persons/350259"],
  ["Thomas Wim Hamelryck","Professor","?pure=da/persons/271052"],
  ["Wouter Boomsma","Professor","?pure=da/persons/275482"],
  ["Yevgeny Seldin","Professor","?pure=da/persons/500475"],
  ["Yongluan Zhou","Professor","?pure=da/persons/590429"],
  ["Andrzej Filinski","Lektor","?pure=da/persons/90337"],
  ["Boris Düdder","Lektor","?pure=da/persons/575423"],
  ["Bulat Ibragimov","Lektor - forfremmelsesprogrammet","?pure=da/persons/644987"],
  ["Cosmin Eugen Oancea","Lektor","?pure=da/persons/421441"],
  ["Daniel Lee Ashbrook","Lektor","?pure=da/persons/609533"],
  ["Daniel Spikol","Lektor","?pure=da/persons/709183"],
  ["Desmond Elliott","Lektor","?pure=da/persons/631668"],
  ["Dmitriy Traytel","Lektor - forfremmelsesprogrammet","?pure=da/persons/682552"],
  ["Fabian Christian Gieseke","Lektor","?pure=da/persons/473301"],
  ["Francois Lauze","Lektor","?pure=da/persons/200294"],
  ["Fritz Henglein","Professor","?pure=da/persons/14770"],
  ["James Emil Avery","Lektor","?pure=da/persons/180093"],
  ["Jens Petersen","Lektor","?pure=da/persons/178402"],
  ["Joanna Emilia Bergström","Lektor","?pure=da/persons/540723"],
  ["Maria Maistro","Lektor","?pure=da/persons/641366"],
  ["Melanie Ganz-Benjaminsen","Lektor - forfremmelsesprogrammet","?pure=da/persons/341919"],
  ["Michael Kastoryano","Lektor","?pure=da/persons/354625"],
  ["Mikkel Abrahamsen","Lektor - forfremmelsesprogrammet","?pure=da/persons/289414"],
  ["Naja Holten Møller","Lektor - forfremmelsesprogrammet","?pure=da/persons/340853"],
  ["Omry Ross","Lektor","?pure=da/persons/295505"],
  ["Oswin Krause","Lektor","?pure=da/persons/440348"],
  ["Srikanth Srinivasan","Lektor","?pure=da/persons/792011"],
  ["Tariq Osman Andersen","Lektor - forfremmelsesprogrammet","?pure=da/persons/353044"],
  ["Tijs Slaats","Lektor","?pure=da/persons/561613"],
  ["Torben Ægidius Mogensen","Lektor","?pure=da/persons/162114"],
  ["Tuukka Ruotsalo","Lektor","?pure=da/persons/679001"],
  ["Amartya Sanyal","Tenure Track Adjunkt","?pure=da/persons/790067"],
  ["Ankit Kariryaa","Tenure Track Adjunkt","?pure=da/persons/636966"],
  ["Bernhard Kerbl","Tenure Track Adjunkt","?pure=da/persons/840995"],
  ["Boel Nelson","Tenure Track Adjunkt","?pure=da/persons/760913"],
  ["Daniel Hershcovich","Tenure Track Adjunkt","?pure=da/persons/643203"],
  ["Hang Yin","Tenure Track Adjunkt","?pure=da/persons/773091"],
  ["Jacob Holm","Tenure Track Adjunkt","?pure=da/persons/42387"],
  ["Julius Bier Kirkegaard","Tenure Track Adjunkt","?pure=da/persons/373643"],
  ["Nirupam Gupta","Tenure Track Adjunkt","?pure=da/persons/819815"],
  ["Pepa Kostadinova Atanasova","Tenure Track Adjunkt","?pure=da/persons/644356"],
  ["Raghavendra Selvan","Tenure Track Adjunkt","?pure=da/persons/532407"],
  ["Sadegh Talebi","Tenure Track Adjunkt","?pure=da/persons/673024"],
  ["Sarah Frances Homewood","Tenure Track Adjunkt","?pure=da/persons/710616"],
  ["Teresa Hirzle","Tenure Track Adjunkt","?pure=da/persons/745346"],
  ["Troels Henriksen","Tenure Track Adjunkt","?pure=da/persons/304977"],
  ["Valkyrie Savage","Tenure Track Adjunkt","?pure=da/persons/729674"],
  ["Jeppe Have Rasmussen","Adjunkt","?pure=da/persons/793108"],
  ["Ilias Chalkidis","Adjunkt","?pure=da/persons/708168"],
  ["Martin Nørgaard","Adjunkt","?pure=da/persons/397206"],
  ["Michael Kirkedal Thomsen","Adjunkt","?pure=da/persons/196082"],
  ["Mostafa Mehdipour Ghazi","Adjunkt","?pure=da/persons/595060"],
  ["Stefan Oehmcke","Adjunkt","?pure=da/persons/641966"],
  ["Svetlana Kutuzova","Adjunkt","?pure=da/persons/642441"],
  ["Vikrant Singhal","Adjunkt","?pure=da/persons/922895"],
]

const blocks = [
  { institution: 'University of Copenhagen', department: 'PLEN', baseHost: 'https://plen.ku.dk', data: PLEN_FULL },
  { institution: 'University of Copenhagen', department: 'DIKU', baseHost: 'https://di.ku.dk', data: DIKU },
]

const newRecords = []
for (const b of blocks) {
  for (const [rawName, rawTitle, rawUrl] of b.data) {
    const title = translateTitle(rawTitle)
    if (!keep(title)) continue
    const name = normalize(rawName)
    let url
    if (!rawUrl) url = undefined
    else if (rawUrl.startsWith('http')) url = rawUrl
    else if (rawUrl.startsWith('?')) url = b.baseHost + '/' + rawUrl
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
const byDept = {}
for (const r of existing) {
  byInst[r.institution || 'Other'] = (byInst[r.institution || 'Other'] || 0) + 1
  byDept[r.department || '(none)'] = (byDept[r.department || '(none)'] || 0) + 1
}
console.log('\nBy institution:')
for (const [k, v] of Object.entries(byInst).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
console.log('\nBy department:')
for (const [k, v] of Object.entries(byDept).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
