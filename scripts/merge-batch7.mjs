// Batch 7: CBS (7 departments) + partial RUC/others
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|ph\.?d|postdoc|student|teaching|external|senior\s(advisor|consultant)|administr|assistant\ssecretariat|officer|research\sassistant|consultant|adviser|chief\s(advisor|consultant)/i
const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|head\sof\sdepartment|head\sof\ssection|head\sof\scentre|centre\sdirector|center\sdirector|research\scenter\sdirector)/i

function normalize(n) { if (n.includes(',')) { const [l,f]=n.split(',').map(s=>s.trim()); return `${f} ${l}` } return n.trim() }
function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }
function keep(t) { if (!t) return false; if (EXCLUDE.test(t)) return false; return INCLUDE.test(t) }

// Each entry: [name, title, optional-url]
const CBS_ECON = [
  ["Marcus Asplund","Professor"],["Peter Bogetoft","Professor"],["Anette Boom","Associate Professor"],["Daniel Borowczyk-Martins","Associate Professor"],["Luigi Butera","Associate Professor"],["Alexander Christopher Sebald","Head of Department"],["Moira Daly","Associate Professor"],["Christopher Dirzka","Assistant Professor"],["Marek Giebel","Tenure Track Assistant Professor"],["Yajna Govind","Tenure Track Assistant Professor"],["Fane Naja Groes","Associate Professor"],["Tooraj Jamasb","Professor"],["Svend Erik Hougaard Jensen","Professor"],["David Jinkins","Associate Professor"],["Peter Lihn Jørgensen","Tenure Track Assistant Professor"],["Natalia Khorunzhina","Associate Professor"],["Lisbeth La Cour","Associate Professor"],["Cédric Schneider","Associate Professor"],["Dolores Romero Morales","Professor"],
]
const CBS_FIN = [
  ["Carsten Sørensen","Head of Department"],["Steffen Andersen","Professor"],["Ken L. Bechmann","Professor"],["Peter Dalgaard","Professor"],["Jens Dick-Nielsen","Professor"],["Peter Feldhütter","Professor"],["Niels Joachim Gormsen","Professor"],["Søren Hvidkjær","Professor"],["David Lando","Professor"],["Jesper Rangvid","Professor"],["Fatima Zahra Filali Adib","Tenure Track Assistant Professor"],["Louiza Bartzoka","Tenure Track Assistant Professor"],["Sangeun Ha","Tenure Track Assistant Professor"],["Jonas Happel","Tenure Track Assistant Professor"],["Markus Ibert","Tenure Track Assistant Professor"],["Katarina Ibert Warg","Tenure Track Assistant Professor"],["Peter Brok","Assistant Professor"],["Lena Jaroszek","Assistant Professor"],["Lars Christian Larsen","Assistant Professor"],["Bjarne Astrup Jensen","Associate Professor"],["Bjarne Florentsen","Associate Professor"],["Dorte Kronborg","Associate Professor"],["Marcel Fischer","Associate Professor"],["Linda Sandris Larsen","Associate Professor"],["Kathrin Schlafmann","Associate Professor"],["Arna Olafsson","Associate Professor"],["Lasse Heje Pedersen","Research Center Director"],
]
const CBS_SI = [
  ["Christoph Grimpe","Head of Department"],["Michele Acciaro","Associate Professor"],["Christian Geisler Asmussen","Professor"],["Julia Bodner","Tenure Track Assistant Professor"],["Sofie Cairo","Assistant Professor"],["Gabriel Cavalli","Tenure Track Assistant Professor"],["Carmelo Cennamo","Professor"],["Si (Coco) Cheng","Tenure Track Assistant Professor"],["Jörg Claussen","Professor"],["Kristina Dahlin","Professor"],["Peter De Langen","Professor"],["Mercedes Delgado","Associate Professor"],["Francesco Di Lorenzo","Associate Professor"],["Nicolai J. Foss","Professor"],["Orsola Garofalo","Associate Professor"],["Tom Grad","Associate Professor"],["Karin Hoisl","Professor"],["Paul Hünermund","Associate Professor"],["Martin Jes Iversen","Associate Professor"],["Peter Ørberg Jensen","Associate Professor"],["Lars Bo Jeppesen","Professor"],["Ulrich Kaiser","Professor"],["Christian Erik Kampmann","Associate Professor"],["H.C. Kongsted","Professor"],["Keld Laursen","Professor"],["Mark Lorenzen","Professor"],["Torben Pedersen","Professor"],["Grazia Santangelo","Professor"],["Michael Mol","Associate Professor"],["Marion Poetz","Associate Professor"],
]
const CBS_DIGI = [
  ["Andrea Carugati","Head of Department"],["Kim Normann Andersen","Professor"],["Michel Avital","Professor"],["Torkil Clemmensen","Professor"],["Ioanna Constantiou","Professor"],["Jan Damsgaard","Professor"],["Rob Gleasure","Professor"],["Jonas Hedman","Professor"],["Stefan Henningsson","Professor"],["Helle Zinner Henriksen","Professor"],["Tina Blegind Jensen","Professor"],["Abayomi Baiyere","Associate Professor"],["Mads Bødker","Associate Professor"],["Ben Eaton","Associate Professor"],["Qiqi Jiang","Associate Professor"],["Olivia Benfeldt","Tenure Track Assistant Professor"],["Andreas Blicher","Tenure Track Assistant Professor"],["Maren Gierlich-Joas","Tenure Track Assistant Professor"],["Travis Greene","Tenure Track Assistant Professor"],["Maike Greve","Tenure Track Assistant Professor"],["Philipp Hukal","Tenure Track Assistant Professor"],["Abid Hussain","Associate Professor"],["Anoush Margaryan","Professor"],["Günter Prockl","Associate Professor"],
]
const CBS_MSC = [
  ["Ana Alacovska","Professor"],["Oana Brindusa Albu","Associate Professor"],["Efthymios Altsitsiadis","Associate Professor"],["Daniel Barratt","Associate Professor"],["Jan Michael Bauer","Associate Professor"],["Steffen Blaschke","Associate Professor"],["Maribel Blasco","Associate Professor"],["Karin Buhmann","Professor"],["Lars Thøger Christensen","Professor"],["Peter Holdt Christensen","Associate Professor"],["Manuele Citi","Associate Professor"],["Lisbeth Clausen","Associate Professor"],["Fabian Faurholt Csaba","Associate Professor"],["Alexander Dobeson","Tenure Track Assistant Professor"],["Hannah Elliott","Assistant Professor"],["Nicole Ferry","Tenure Track Assistant Professor"],["Maria Figueroa","Associate Professor"],["Mikkel Flyverbom","Professor"],
]
const CBS_ACC = [
  ["Carsten Rohde","Head of Department"],["Tim Neerup Themsen","Associate Professor"],["Michael Andersen","Associate Professor"],["Catherine Batt","Tenure Track Assistant Professor"],["Kirstin Becker","Associate Professor"],["Leif Christensen","Associate Professor"],["Jeppe Christoffersen","Associate Professor"],["Henri Dekker","Professor"],["Aleksandra Gregoric","Associate Professor"],["Stig Hartmann","Associate Professor"],["Morten Holm","Associate Professor"],["Kim Klarskov Jeppesen","Professor"],["Thomas Riise Johansen","Professor"],["Bjørn N. Jørgensen","Professor"],["Mia Kaspersen","Associate Professor"],["Jukka Kettunen","Assistant Professor"],["Jette Steen Knudsen","Professor"],["Caroline Thøisen Larsen","Assistant Professor"],["Casper Berg Lavmand Larsen","Associate Professor"],["Jytte Grambo Larsen","Associate Professor"],["Steen Thomsen","Professor"],["Yanlei Zhang","Associate Professor"],["Wenjun Wen","Tenure Track Assistant Professor"],
]
const CBS_IOA = [
  ["Carsten Greve","Head of Department"],["Johan Simonsen Abildgaard","Associate Professor"],["Cornel Ban","Associate Professor"],["Susana Borrás","Professor"],["Eva Boxenbaum","Professor"],["Rasmus Corlin Christensen","Associate Professor"],["Christian De Cock","Professor"],["Erik Mygind du Plessis","Associate Professor"],["Christoph Houman Ellersgaard","Associate Professor"],["Laura Empson","Professor"],["Jonathan Feddersen","Assistant Professor"],["Miriam Feuls","Associate Professor"],["Søren Lund Frandsen","Assistant Professor"],["Christian Frankel","Associate Professor"],["Paul du Gay","Professor"],["Joana Geraldi","Associate Professor"],["Stine Haakonsson","Associate Professor"],["Jacob Hasselbalch","Associate Professor"],
]
const CBS_MARK = [
  ["Thyra Uth Thomsen","Head of Department"],["Mogens Bjerre","Associate Professor"],["Erik Braun","Associate Professor"],["Anna-Bertha Heeris Christensen","Assistant Professor"],["Bo Christensen","Professor"],["Felix Eggers","Professor"],["Antonia Erz","Associate Professor"],["Szilvia Gyimothy Mørup-Petersen","Associate Professor"],["Richard Gyrd-Jones","Associate Professor"],["Georgios Halkias","Associate Professor"],["Torben Hansen","Professor"],["Johannes Hattula","Associate Professor"],["Anne Toldbod Jakobsen","Assistant Professor"],["Ad de Jong","Professor"],["Alexander Josiassen","Professor"],["Selma Kadic-Maglajlic","Associate Professor"],["Florian Kock","Professor"],["Marina Leban","Tenure Track Assistant Professor"],["Adam Lindgreen","Professor"],
]
const CBS_OM = [
  ["Carsten Ørts Hansen","Head of Department"],["Allan Hansen","Associate Professor"],["Christian Hendriksen","Associate Professor"],["Christian Huber","Associate Professor"],["Ivar Friis","Associate Professor"],["Jan Mouritsen","Professor"],["Juliana Hsuan","Professor"],["Kim Sundtoft Hald","Professor"],["Andreas Wieland","Associate Professor"],["Jawwad Raja","Associate Professor"],["Leonardo Santiago","Associate Professor"],["Marin Jovanovic","Associate Professor"],["Sof Thrane","Associate Professor"],["Thomas Frandsen","Associate Professor"],["Kai Inga Liehr Storm","Associate Professor"],["Philip Beske-Janssen","Assistant Professor"],["Casper Hein Winther","Assistant Professor"],["Jasmina Holst","Assistant Professor"],["Katrine Schrøder-Hansen","Assistant Professor"],["Paola Trevisan","Assistant Professor"],["Tim Schlaich","Assistant Professor"],["Victoria Honsel","Assistant Professor"],["Iuliia Dudareva","Assistant Professor"],["Elise Berlinski","Assistant Professor"],
]
const CBS_EGB = [
  ["Jens Gammalgaard","Head of Department"],["Torben Juul Andersen","Professor"],["Eddie Ashbee","Professor"],["Kristin Brandl","Associate Professor"],["Steffen Brenner","Associate Professor"],["Kjeld Erik Brødsgaard","Professor"],["Caroline de la Porte","Professor"],["Benjamin Carl Krag Egerod","Tenure Track Assistant Professor"],["Zoltan Fazekas","Associate Professor"],["Douglas Fuller","Associate Professor"],["Lars Håkanson","Professor"],["Faith Hatani","Associate Professor"],["Bersant Hobdari","Associate Professor"],["Florian Hollenbach","Associate Professor"],["Der-Ting Huang","Tenure Track Assistant Professor"],["Andrew Inkpen","Professor"],["Anne Jamison","Tenure Track Assistant Professor"],["Mads Dagnis Jensen","Associate Professor"],["Björn Jindra","Professor"],["Mogens Kamp Justesen","Professor"],["Ari Kokko","Professor"],["Vera Kunczer","Tenure Track Assistant Professor"],["Thomas Lindner","Associate Professor"],["Evis Sinani","Associate Professor"],
]

const blocks = [
  { institution: 'Copenhagen Business School', department: 'CBS Economics', data: CBS_ECON, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-economics' },
  { institution: 'Copenhagen Business School', department: 'CBS Finance', data: CBS_FIN, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-finance' },
  { institution: 'Copenhagen Business School', department: 'CBS Strategy & Innovation', data: CBS_SI, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-strategy-and-innovation' },
  { institution: 'Copenhagen Business School', department: 'CBS Digitalization', data: CBS_DIGI, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-digitalization' },
  { institution: 'Copenhagen Business School', department: 'CBS Management, Society & Comm.', data: CBS_MSC, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-management-society-and-communication' },
  { institution: 'Copenhagen Business School', department: 'CBS Accounting', data: CBS_ACC, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-accounting' },
  { institution: 'Copenhagen Business School', department: 'CBS Organization', data: CBS_IOA, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-organization' },
  { institution: 'Copenhagen Business School', department: 'CBS Marketing', data: CBS_MARK, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-marketing' },
  { institution: 'Copenhagen Business School', department: 'CBS Operations Management', data: CBS_OM, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-operations-management' },
  { institution: 'Copenhagen Business School', department: 'CBS Int\'l Econ, Gov & Business', data: CBS_EGB, url: 'https://www.cbs.dk/en/research/departments-and-centres/department-of-international-economics-government-and-business' },
]

const newRecords = []
for (const b of blocks) {
  for (const row of b.data) {
    const [rawName, rawTitle] = row
    if (!keep(rawTitle)) continue
    const name = normalize(rawName)
    newRecords.push({ id: slugify(name), name, title: rawTitle, department: b.department, institution: b.institution, url: b.url })
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
    existing.push(r); existingByName.set(key, r); added++
  }
}

for (const r of existing) if (!r.id) r.id = slugify(r.name)
writeFileSync(DATA_PATH, JSON.stringify(existing, null, 2))
console.log(`Total: ${existing.length} · +${added} new · ${enriched} enriched`)

const byInst = {}
for (const r of existing) byInst[r.institution || 'Other'] = (byInst[r.institution || 'Other'] || 0) + 1
for (const [k,v] of Object.entries(byInst).sort((a,b)=>b[1]-a[1])) console.log(`  ${k}: ${v}`)
