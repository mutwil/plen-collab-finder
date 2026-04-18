// Batch 5: Economics, Political Science, Psychology, ICMM
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|ph\.?d|postdoc|student|teaching|external|part-?time|postdoctoral/i
const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|head\sof\sdepartment|head\sof\scentre|head\sof\sstudies)/i

function normalize(n) { if (n.includes(',')) { const [l,f]=n.split(',').map(s=>s.trim()); return `${f} ${l}` } return n.trim() }
function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }
function keep(t) { if (!t) return false; if (EXCLUDE.test(t)) return false; return INCLUDE.test(t) }

const ECON = [
  ["Amalie Sofie Jensen","Associate Professor","?pure=en/persons/374532"],
  ["Anders Munk-Nielsen","Associate Professor","?pure=en/persons/333071"],
  ["Anders Rahbek","Professor","?pure=en/persons/58216"],
  ["Andreas Bjerre-Nielsen","Associate Professor","?pure=en/persons/296313"],
  ["Anne Sofie Beck Knudsen","Tenure Track Assistant Professor","?pure=en/persons/355343"],
  ["Asger Lau Andersen","Associate Professor","?pure=en/persons/220782"],
  ["Asger Mose Wingender","Associate Professor","?pure=en/persons/270119"],
  ["Bertel Schjerning","Professor","?pure=en/persons/180168"],
  ["Björn Thor Arnarson","Assistant Professor","?pure=en/persons/427734"],
  ["Brigitte Hochmuth","Tenure Track Assistant Professor","?pure=en/persons/842814"],
  ["Carl-Johan Lars Dalgaard","Professor","?pure=en/persons/64557"],
  ["Casper Worm Hansen","Professor","?pure=en/persons/352553"],
  ["Christian Skov Jensen","Tenure Track Assistant Professor","?pure=en/persons/408422"],
  ["Christina Gravert","Associate Professor","?pure=en/persons/622084"],
  ["Claus Thustrup Kreiner","Professor","?pure=en/persons/40451"],
  ["Daniel le Maire","Associate Professor","?pure=en/persons/182330"],
  ["Daphné Jocelyne Skandalis","Tenure Track Assistant Professor","?pure=en/persons/691358"],
  ["Edward Samuel Jones","Associate Professor","?pure=en/persons/335694"],
  ["Egor Starkov","Associate Professor","?pure=en/persons/653696"],
  ["Finn Tarp","Professor","?pure=en/persons/71530"],
  ["Florian Hans Fred Schneider","Tenure Track Assistant Professor","?pure=en/persons/780328"],
  ["Franziska Valder","Assistant Professor","?pure=en/persons/739466"],
  ["Frikk Nesje","Associate Professor","?pure=en/persons/686454"],
  ["Hannes Ullrich","Associate Professor","?pure=en/persons/642997"],
  ["Hans Jørgen Whitta-Jacobsen","Professor","?pure=en/persons/165534"],
  ["Heino Bohn Nielsen","Associate Professor","?pure=en/persons/36051"],
  ["Henrik Hansen","Head of Department","?pure=en/persons/89840"],
  ["Jakob Egholt Søgaard","Tenure Track Assistant Professor","?pure=en/persons/288925"],
  ["Jakob Roland Munch","Professor","?pure=en/persons/213117"],
  ["Jeanet Sinding Bentzen","Professor","?pure=en/persons/194483"],
  ["Jeppe Druedahl","Associate Professor","?pure=en/persons/304259"],
  ["Jesper Eriksen","Assistant Professor","?pure=en/persons/673243"],
  ["Jesper Riis-Vestergaard Sørensen","Associate Professor","?pure=en/persons/331465"],
  ["Johan Lagerlöf","Associate Professor","?pure=en/persons/339271"],
  ["John Rand","Professor","?pure=en/persons/126119"],
  ["John Vincent Kramer","Tenure Track Assistant Professor","?pure=en/persons/748109"],
  ["Linea Hasager","Assistant Professor","?pure=en/persons/436458"],
  ["Magnus Tolum Buus","Assistant Professor","?pure=en/persons/394881"],
  ["Manuel Menkhoff","Tenure Track Assistant Professor","?pure=en/persons/843724"],
  ["Marc Patrick Brag Klemp","Associate Professor","?pure=en/persons/279504"],
  ["Martin Browning","Professor","?pure=en/persons/153979"],
  ["Mette Foged","Associate Professor","?pure=en/persons/265951"],
  ["Mette Rasmussen","Assistant Professor","?pure=en/persons/436437"],
  ["Mette Gørtz","Professor","?pure=en/persons/59699"],
  ["Mette Ejrnæs","Professor","?pure=en/persons/5004"],
  ["Michael Bergman","Associate Professor","?pure=en/persons/280616"],
  ["Miriam Wüst","Associate Professor","?pure=en/persons/260540"],
  ["Mogens Fosgerau","Professor","?pure=en/persons/85024"],
  ["Morten Bennedsen","Professor","?pure=en/persons/117279"],
  ["Morten Graugaard Olsen","Associate Professor","?pure=en/persons/222548"],
  ["N. Meltem Daysal","Associate Professor","?pure=en/persons/667386"],
  ["Neda Trifkovic","Tenure Track Assistant Professor","?pure=en/persons/380778"],
  ["Nick Vikander","Associate Professor","?pure=en/persons/469466"],
  ["Niels Johannesen","Professor","?pure=en/persons/12366"],
  ["Nikolaj Arpe Harmon","Associate Professor","?pure=en/persons/289190"],
  ["Pablo Selaya","Associate Professor","?pure=en/persons/281083"],
  ["Paolo Falco","Associate Professor","?pure=en/persons/652536"],
  ["Peter Birch Sørensen","Professor","?pure=en/persons/162062"],
  ["Peter Kjær Kruse-Andersen","Associate Professor","?pure=en/persons/373929"],
  ["Peter Norman Sørensen","Professor","?pure=en/persons/5862"],
  ["Rasmus Søndergaard Pedersen","Associate Professor","?pure=en/persons/303839"],
  ["Robert Mahlstedt","Associate Professor","?pure=en/persons/581800"],
  ["Stefan Voigt","Tenure Track Assistant Professor","?pure=en/persons/686153"],
  ["Steffen Altmann","Associate Professor","?pure=en/persons/500202"],
  ["Søren Leth-Petersen","Professor","?pure=en/persons/85558"],
  ["Søren Hove Ravn","Associate Professor","?pure=en/persons/279434"],
  ["Thomas Jensen","Associate Professor","?pure=en/persons/65625"],
  ["Thomas Markussen","Professor","?pure=en/persons/260322"],
  ["Thomas Høgholm Jørgensen","Associate Professor","?pure=en/persons/351587"],
  ["Torben Heien Nielsen","Professor","?pure=en/persons/221398"],
]

const POLSCI = [
  ["Rebecca Adler-Nissen","Professor","?pure=en/persons/194893"],
  ["Jonathan Luke Austin","Associate Professor","?pure=en/persons/709225"],
  ["Anders Berg-Sørensen","Associate Professor","?pure=en/persons/187619"],
  ["Michele Merrill Betsill","Professor","?pure=en/persons/709226"],
  ["Christian Bueger","Professor","?pure=en/persons/608851"],
  ["Dean Cooper-Cunningham","Tenure Track Assistant Professor","?pure=en/persons/597018"],
  ["Peter Dahler-Larsen","Professor","?pure=en/persons/184767"],
  ["Peter Thisted Dinesen","Professor","?pure=en/persons/309060"],
  ["Gregory Eady","Associate Professor","?pure=en/persons/646913"],
  ["Kristin Anabel Eggeling","Assistant Professor","?pure=en/persons/633160"],
  ["Mads Andreas Elkjær","Tenure Track Assistant Professor","?pure=en/persons/741171"],
  ["Anders Esmark","Associate Professor","?pure=en/persons/21181"],
  ["Yevgeniy Golovchenko","Tenure Track Assistant Professor","?pure=en/persons/396118"],
  ["Sara Hagemann","Professor","?pure=en/persons/731277"],
  ["Kasper Møller Hansen","Professor","?pure=en/persons/280959"],
  ["Lene Hansen","Professor","?pure=en/persons/104681"],
  ["Jacob Gerner Hariri","Professor","?pure=en/persons/196635"],
  ["Kevin Jon Heller","Professor","?pure=en/persons/695418"],
  ["Silje Synnøve Lyder Hermansen","Tenure Track Assistant Professor","?pure=en/persons/722211"],
  ["Frederik Hjorth","Associate Professor","?pure=en/persons/290604"],
  ["Katja Lindskov Jacobsen","Associate Professor","?pure=en/persons/221400"],
  ["Wiebke Marie Junk","Associate Professor","?pure=en/persons/526719"],
  ["Karina Kosiara-Pedersen","Associate Professor","?pure=en/persons/98886"],
  ["Peter Kurrild-Klitgaard","Professor","?pure=en/persons/63119"],
  ["Henrik Larsen","Associate Professor","?pure=en/persons/166099"],
  ["Tobias Liebetrau","Associate Professor","?pure=en/persons/304218"],
  ["Martin Marcussen","Professor","?pure=en/persons/185065"],
  ["Dorte Sindbjerg Martinsen","Professor","?pure=en/persons/163402"],
  ["Jens Ladefoged Mortensen","Associate Professor","?pure=en/persons/272930"],
  ["Maria Mälksoo","Professor","?pure=en/persons/722206"],
  ["Peter Nedergaard","Professor","?pure=en/persons/175074"],
  ["Asmus Leth Olsen","Professor","?pure=en/persons/279298"],
  ["Mogens Jin Pedersen","Associate Professor","?pure=en/persons/609388"],
  ["Lene Holm Pedersen","Professor","?pure=en/persons/16215"],
  ["Signe Pihl-Thingvad","Head of Department","?pure=en/persons/44832"],
  ["Carolin Hjort Rapp","Associate Professor","?pure=en/persons/608618"],
  ["Mikkel Vedby Rasmussen","Professor","?pure=en/persons/29769"],
  ["Anne Rasmussen","Professor","?pure=en/persons/113084"],
  ["Karsten Ronit","Associate Professor","?pure=en/persons/102310"],
  ["Christian F. Rostbøll","Professor","?pure=en/persons/120829"],
  ["Adam Scharpf","Tenure Track Assistant Professor","?pure=en/persons/741089"],
  ["Emily Flore St Denny","Associate Professor","?pure=en/persons/675453"],
  ["Marlene Wind","Professor","?pure=en/persons/161668"],
  ["Anders Wivel","Professor","?pure=en/persons/2018"],
  ["Ole Wæver","Professor","?pure=en/persons/96961"],
  ["Maja Zehfuss","Professor","?pure=en/persons/709143"],
  ["Alice el-Wakil","Tenure Track Assistant Professor","?pure=en/persons/759769"],
]

const PSYCH = [
  ["Adéla Plechatá","Tenure Track Assistant Professor",null],
  ["Anders Petersen","Associate Professor",null],
  ["Anne Ranning","Associate Professor",null],
  ["Annemarie Olsen","Professor",null],
  ["Asmus Vogel","Associate Professor",null],
  ["Birgitte Fagerlund","Professor",null],
  ["Bo Bach","Professor",null],
  ["Brady Wagoner","Professor",null],
  ["Charlotte Bjerre Meilstrup","Senior Researcher",null],
  ["Dea Siggaard Stenbæk","Associate Professor",null],
  ["Dora Kampis","Tenure Track Assistant Professor",null],
  ["Emanuela Yeung","Assistant Professor",null],
  ["Guido Makransky","Professor",null],
  ["Hana Malá Rytter","Associate Professor",null],
  ["Ida Egmose Pedersen","Tenure Track Assistant Professor",null],
  ["Ingo Zettler","Professor",null],
  ["Jason William Burton","Tenure Track Assistant Professor",null],
  ["Jesper Dammeyer","Professor",null],
  ["Jochen Eberhard Gebauer","Professor",null],
  ["Johanne Smith-Nielsen","Associate Professor",null],
  ["Karen-Inge Karstoft","Professor",null],
  ["Katarina Begus","Tenure Track Assistant Professor",null],
  ["Katrine Røhder","Associate Professor",null],
  ["Katrine Isabella Wendelboe","Assistant Professor",null],
  ["Laila Øksnebjerg","Associate Professor",null],
  ["Lau Lilleholt Harpviken","Tenure Track Assistant Professor",null],
  ["Line Nielsen","Senior Researcher",null],
  ["Louise Birkedal Glenthøj","Associate Professor",null],
  ["Madeleine Chapman","Associate Professor",null],
  ["Mark Schram Christensen","Associate Professor",null],
  ["Martin Vestergaard Gøtzsche","Associate Professor",null],
  ["Mette Skovgaard Væver","Professor",null],
  ["Milan Obaidi","Associate Professor",null],
  ["Monika Anna Walczak","Tenure Track Assistant Professor",null],
  ["Niccolò Fiorentino Polipo","Tenure Track Assistant Professor",null],
  ["Nicoline Hemager","Associate Professor",null],
  ["Oliver James Hulme","Associate Professor",null],
  ["Paul Maurice Conway","Associate Professor",null],
  ["Pia Ingold","Professor",null],
  ["Randi Starrfelt","Professor",null],
  ["Ro Julia Robotham","Associate Professor",null],
  ["Sara Kerstine Kaya Nielsen","Tenure Track Assistant Professor",null],
  ["Sebastian Simonsen","Associate Professor",null],
  ["Simo Køppe","Professor",null],
  ["Sonja Breinholst","Associate Professor",null],
  ["Sophia Armand","Assistant Professor",null],
  ["Sophie Merrild Juul","Tenure Track Assistant Professor",null],
  ["Stephen Fitzgerald Austin","Associate Professor",null],
  ["Steven Blurton","Associate Professor",null],
  ["Stig Poulsen","Professor",null],
  ["Sune Bo Hansen","Associate Professor",null],
  ["Séamus Anthony Power","Associate Professor",null],
  ["Søren Kyllingsbæk","Professor",null],
  ["Thomas Habekost","Professor",null],
  ["Thomas Morton","Professor",null],
  ["Thomas Rune Nielsen","Associate Professor",null],
  ["Thor Grünbaum","Professor",null],
  ["Tone Roald","Associate Professor",null],
  ["Torben Bechmann Jensen","Associate Professor",null],
  ["Victoria Helen Southgate","Professor",null],
  ["Xuan Li","Associate Professor",null],
]

const ICMM = [
  ["Kristian Almstrup","Professor","https://icmm.ku.dk/ansat/"],
  ["Simon Bekker-Jensen","Professor","https://icmm.ku.dk/ansat/"],
  ["Henrik Clausen","Professor","https://icmm.ku.dk/ansat/"],
  ["Eva Ran Hoffmann","Professor","https://icmm.ku.dk/ansat/"],
  ["Ian Hickson","Professor","https://icmm.ku.dk/ansat/"],
  ["Marja Jäättelä","Professor","https://icmm.ku.dk/ansat/"],
  ["Lars Allan Larsen","Professor","https://icmm.ku.dk/ansat/"],
  ["Jørgen Olsen","Professor","https://icmm.ku.dk/ansat/"],
  ["Ole William Petersen","Professor","https://icmm.ku.dk/ansat/"],
  ["Peter E. Nielsen","Professor","https://icmm.ku.dk/ansat/"],
  ["Lene Juel Rasmussen","Professor","https://icmm.ku.dk/ansat/"],
  ["Jesper Q. Svejstrup","Professor","https://icmm.ku.dk/ansat/"],
  ["Niels Tommerup","Professor","https://icmm.ku.dk/ansat/"],
  ["Hans H. Wandall","Professor","https://icmm.ku.dk/ansat/"],
  ["Jeremy Turnbull","Professor","https://icmm.ku.dk/ansat/"],
  ["Ying Liu","Professor","https://icmm.ku.dk/ansat/"],
]

const BMI = [
  ["Alicia Lundby","Professor","https://bmi.ku.dk/english/"],
  ["Andreas Kjær","Professor","https://bmi.ku.dk/english/"],
  ["Bente Merete Stallknecht","Professor","https://bmi.ku.dk/english/"],
  ["Clare Louise Hawkins","Professor","https://bmi.ku.dk/english/"],
  ["Dominik Karl Linz","Professor","https://bmi.ku.dk/english/"],
  ["Flemming Dela","Professor","https://bmi.ku.dk/english/"],
  ["Gerrit van Hall","Professor","https://bmi.ku.dk/english/"],
  ["Joshua Mark Brickman","Professor","https://bmi.ku.dk/english/"],
  ["Jens Juul Holst","Professor","https://bmi.ku.dk/english/"],
  ["Jørn Wulff Helge","Professor","https://bmi.ku.dk/english/"],
  ["Kim Bak Jensen","Professor","https://bmi.ku.dk/english/"],
  ["Michael J. Davies","Professor","https://bmi.ku.dk/english/"],
  ["Mette Rosenkilde","Professor","https://bmi.ku.dk/english/"],
  ["Nils Billestrup","Professor","https://bmi.ku.dk/english/"],
  ["Signe Sørensen Torekov","Professor","https://bmi.ku.dk/english/"],
  ["Thomas Jespersen","Professor","https://bmi.ku.dk/english/"],
  ["Thomas Mandrup-Poulsen","Professor","https://bmi.ku.dk/english/"],
  ["Tor Biering-Sørensen","Professor","https://bmi.ku.dk/english/"],
]

const blocks = [
  { institution: 'University of Copenhagen', department: 'KU Economics', baseHost: 'https://www.economics.ku.dk', data: ECON, urlJoin: (base,u) => u?.startsWith('?') ? base+'/staff/vip/'+u : u },
  { institution: 'University of Copenhagen', department: 'KU Political Science', baseHost: 'https://politicalscience.ku.dk', data: POLSCI, urlJoin: (base,u) => u?.startsWith('?') ? base+'/staff/Academic_staff/'+u : u },
  { institution: 'University of Copenhagen', department: 'KU Psychology', baseHost: 'https://www.psychology.ku.dk', data: PSYCH, urlJoin: (base,u) => u || 'https://www.psychology.ku.dk/staff/academic_staff/' },
  { institution: 'University of Copenhagen', department: 'KU ICMM', baseHost: 'https://icmm.ku.dk', data: ICMM, urlJoin: (base,u) => u },
  { institution: 'University of Copenhagen', department: 'KU BMI', baseHost: 'https://bmi.ku.dk', data: BMI, urlJoin: (base,u) => u },
]

const newRecords = []
for (const b of blocks) {
  for (const [rawName, rawTitle, rawUrl] of b.data) {
    if (!keep(rawTitle)) continue
    const name = normalize(rawName)
    const url = b.urlJoin(b.baseHost, rawUrl)
    newRecords.push({ id: slugify(name), name, title: rawTitle, department: b.department, institution: b.institution, url })
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

const byDept = {}
for (const r of existing) byDept[r.department || '(none)'] = (byDept[r.department || '(none)'] || 0) + 1
for (const [k,v] of Object.entries(byDept).sort((a,b)=>b[1]-a[1])) console.log(`  ${k}: ${v}`)
