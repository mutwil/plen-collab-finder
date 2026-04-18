// Batch 6: AU Physics, Chemistry, Agroecology, Political Science
import { readFileSync, writeFileSync } from 'node:fs'
const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|ph\.?d|postdoc|student|teaching|external|honorary/i
const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|head\sof\sdepartment|head\sof\ssection|head\sof\scentre|centre\sdirector|center\sdirector|researcher\s\(tenure\))/i

function normalize(n) { if (n.includes(',')) { const [l,f]=n.split(',').map(s=>s.trim()); return `${f} ${l}` } return n.trim() }
function slugify(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') }
function keep(t) { if (!t) return false; if (EXCLUDE.test(t)) return false; return INCLUDE.test(t) }

const AU_PHYS = [
  ["Simon Albrecht","Associate Professor"],
  ["Mie Andersen","Associate Professor"],
  ["Jan Joachim Arlt","Professor"],
  ["Peter Balling","Professor"],
  ["Georg Bruun","Professor"],
  ["Yong Chen","Professor"],
  ["Aurelien Romain Dantan","Associate Professor"],
  ["Michael Drewsen","Professor"],
  ["Dmitri Fedorov","Associate Professor"],
  ["Hans Otto Uldall Fynbo","Professor"],
  ["Frank Grundahl","Associate Professor"],
  ["Bjørk Hammer","Professor"],
  ["Jeffrey S. Hangst","Professor"],
  ["Steen Hannestad","Professor"],
  ["Philip Hofmann","Professor"],
  ["Liv Hornekær","Professor"],
  ["Sergio Ioppolo","Associate Professor"],
  ["Brian Julsgaard","Associate Professor"],
  ["Christoffer Karoff","Associate Professor"],
  ["Hans Kjeldsen","Professor"],
  ["Trolle René Linderoth","Associate Professor"],
  ["Lars Bojer Madsen","Professor"],
  ["Jill Miwa","Associate Professor"],
  ["Anne E. B. Nielsen","Associate Professor"],
  ["Steen Brøndsted Nielsen","Professor"],
  ["Jesper Olsen","Associate Professor"],
  ["Henrik B. Pedersen","Associate Professor"],
  ["Karsten Riisager","Associate Professor"],
  ["Maximilian Stritzinger","Associate Professor"],
  ["Thomas Tram","Associate Professor"],
  ["Ulrik Ingerslev Uggerhøj","Head of Department"],
  ["Søren Ulstrup","Associate Professor"],
  ["Simon Elliot Wall","Associate Professor"],
  ["Nikolaj Thomas Zinner","Professor"],
]

const AU_CHEM = [
  ["Merete Bilde","Professor","https://chem.au.dk/en/the-department/staff/show/person/ff8bdc6d-99b3-4736-b769-1c147b5c7dcc"],
  ["Henrik Birkedal","Professor","https://chem.au.dk/en/the-department/staff/show/person/e5418e07-b317-4ecc-a9df-8bdedaa32f5b"],
  ["Victoria Birkedal","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/7055d6e9-f1c4-4ecf-84b7-8d579b2bb667"],
  ["Martin Bremholm","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/3f49d1f0-1e6f-40a1-bbff-d660220561c0"],
  ["Mogens Christensen","Professor","https://chem.au.dk/en/the-department/staff/show/person/95104029-b560-4ada-ba4c-0eaab3ed18f4"],
  ["Ove Christiansen","Professor","https://chem.au.dk/en/the-department/staff/show/person/a6653cc1-29c3-420c-a5ab-cb35eed06fab"],
  ["Kim Daasbjerg","Professor","https://chem.au.dk/en/the-department/staff/show/person/f064c1bc-c2f1-4dbc-b55d-a21838d64df1"],
  ["Anna Louise Duncan","Tenure Track Assistant Professor","https://chem.au.dk/en/the-department/staff/show/person/5034229c-0b90-4a04-95c4-2dd256aca009"],
  ["Jonas Elm","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/1cf322e2-4552-4a27-bdf3-be1c6e4d5409"],
  ["Marianne Glasius","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/c161fb26-0c93-4fa3-9db7-88ddd5c4b78d"],
  ["Maarten Goesten","Tenure Track Assistant Professor","https://chem.au.dk/en/the-department/staff/show/person/fa1f60af-88f9-4837-a184-087e86cc567b"],
  ["Kurt Vesterager Gothelf","Professor","https://chem.au.dk/en/the-department/staff/show/person/8ca43d09-e887-432e-8775-ab2f38db1e6d"],
  ["Nicole Maria Hauser","Tenure Track Assistant Professor","https://chem.au.dk/en/the-department/staff/show/person/3dc4315d-7563-404d-a4e0-ab9cd146b962"],
  ["Bo Brummerstedt Iversen","Professor","https://chem.au.dk/en/the-department/staff/show/person/17abd7bf-2bbb-4ff3-9405-a140882a86b2"],
  ["Frank Jensen","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/7f24d274-8bec-4667-bde5-f8f9dedc4889"],
  ["Henrik Helligsø Jensen","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/877378e2-5b43-446a-87c2-cc8353cc42f3"],
  ["Torben René Jensen","Professor","https://chem.au.dk/en/the-department/staff/show/person/e0750478-df89-45bf-aa48-b6a86de93fa0"],
  ["Karl Anker Jørgensen","Professor","https://chem.au.dk/en/the-department/staff/show/person/3493fd45-67db-4228-a0a5-5d93bb039a30"],
  ["Mads Ry Vogel Jørgensen","Senior Researcher","https://chem.au.dk/en/the-department/staff/show/person/2edd459d-a703-477f-bd5b-b8fffc2e1e7b"],
  ["Fabian Mahrt","Tenure Track Assistant Professor","https://chem.au.dk/en/the-department/staff/show/person/eb9ecf6b-4efc-461c-a0ce-53bc03d1f060"],
  ["Niels Christian Nielsen","Professor","https://chem.au.dk/en/the-department/staff/show/person/32a7422d-cc2f-4301-87c9-951639ed3662"],
  ["Jan Skov Pedersen","Professor","https://chem.au.dk/en/the-department/staff/show/person/8cb5e42a-3881-479c-82a5-232355605d7e"],
  ["Thomas Poulsen","Professor","https://chem.au.dk/en/the-department/staff/show/person/9a15ee93-bb6a-4e1f-bb03-aac8b87ecf90"],
  ["Dorthe Ravnsbæk","Professor","https://chem.au.dk/en/the-department/staff/show/person/58830250-9dd7-43c2-977b-cb8f4b63c15e"],
  ["Alonso Rosas-Hernández","Tenure Track Assistant Professor","https://chem.au.dk/en/the-department/staff/show/person/d6a4cb55-5e17-438d-9197-93eedf2b0905"],
  ["Jørgen Skibsted","Professor","https://chem.au.dk/en/the-department/staff/show/person/861c686f-c84f-4ad0-8581-c8e4fe22bdf9"],
  ["Troels Skrydstrup","Professor","https://chem.au.dk/en/the-department/staff/show/person/67f8ccf9-98a3-4760-a864-1d012fffc489"],
  ["Henrik Stapelfeldt","Professor","https://chem.au.dk/en/the-department/staff/show/person/a9848e15-c57a-44e9-9df0-efab2ef571fd"],
  ["Thibault Viennet","Tenure Track Assistant Professor","https://chem.au.dk/en/the-department/staff/show/person/51035f35-7479-4260-89c0-2f771d0c5614"],
  ["Thomas Vosegaard","Head of Department","https://chem.au.dk/en/the-department/staff/show/person/24095b61-42fb-41c6-aa1f-7c622f454ed4"],
  ["Shuai Wei","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/b4ca37da-bf38-422e-a3d5-1e8c63754fa5"],
  ["Tobias Weidner","Associate Professor","https://chem.au.dk/en/the-department/staff/show/person/7a001432-fe35-4c21-b32c-40a65e060b03"],
  ["Michael Westberg","Tenure Track Assistant Professor","https://chem.au.dk/en/the-department/staff/show/person/2a448bf5-a8b7-4134-832f-924eb10c3f03"],
  ["Alexander Zelikin","Professor","https://chem.au.dk/en/the-department/staff/show/person/0554974f-a5c6-4817-9b94-19e0bdc178e2"],
]

const AU_AGRO = [
  ["Diego Abalos","Professor"],
  ["Mathias Neumann Andersen","Professor"],
  ["Davide Cammarano","Professor"],
  ["Iris Vogeler Cronin","Professor"],
  ["Tommy Dalgaard","Professor"],
  ["Lis Wollesen de Jonge","Professor"],
  ["Lars Elsgaard","Professor"],
  ["Jørgen Eriksen","Professor"],
  ["Mo Bahram","Professor"],
  ["Birte Boelt","Professor"],
  ["Henrik Brinch-Pedersen","Professor"],
  ["René Gislum","Associate Professor"],
  ["Mogens Støvring Hovmøller","Professor"],
  ["Christopher James Barnes","Associate Professor"],
  ["Kim Hebelstrup","Associate Professor"],
  ["Isaac Kwesi Abuley","Tenure Track Assistant Professor"],
  ["Daniel Buchvaldt Amby","Tenure Track Assistant Professor"],
  ["Benjamin Fuchs","Tenure Track Assistant Professor"],
  ["Jawameer Hama","Tenure Track Assistant Professor"],
  ["Tobias Hanak","Assistant Professor"],
  ["Christian Dold","Tenure Track Assistant Professor"],
  ["Kirsten Lønne Enggrob","Tenure Track Assistant Professor"],
  ["Klaus Butterbach-Bahl","Centre Director"],
  ["Amélie Marie Beucher","Assistant Professor"],
  ["Mohit Masta","Assistant Professor"],
  ["Claus Rasmussen","Associate Professor"],
  ["Christopher John Topping","Professor"],
]

const AU_PS = [
  ["Christoffer Green-Pedersen","Head of Department"],
  ["Lene Aarøe","Professor"],
  ["Laurits Florang Aarslew","Assistant Professor"],
  ["Nanna Vestergaard Ahrensberg","Assistant Professor"],
  ["David Delfs Erbo Andersen","Associate Professor"],
  ["Jens Peter Andersen","Senior Researcher"],
  ["Lotte Bøgh Andersen","Professor"],
  ["Simon Calmar Andersen","Professor"],
  ["Andreas Bengtson","Associate Professor"],
  ["Anne Skorkjær Binderkrantz","Professor"],
  ["Martin Bisgaard","Associate Professor"],
  ["Carter Walter Bloch","Centre Director"],
  ["Jens Blom-Hansen","Professor"],
  ["Troels Bøggild","Associate Professor"],
  ["Morten Brænder","Associate Professor"],
  ["Love Aksel Christensen","Assistant Professor"],
  ["Peter Munk Christiansen","Professor"],
  ["Derek Beach","Professor"],
  ["Daniel Finke","Professor"],
  ["Marion Kathe Godman","Associate Professor"],
  ["Johan Gøtzsche-Astrup","Assistant Professor"],
  ["Daniel Sandvej Eriksen","Assistant Professor"],
  ["Nicholas Haas","Associate Professor"],
  ["Aske Halling","Assistant Professor"],
  ["Christian Bøtcher Jacobsen","Professor"],
  ["Mads Leth Jakobsen","Associate Professor"],
  ["Morten Jakobsen","Associate Professor"],
  ["Carsten Jensen","Professor"],
  ["Lars Vinther Johannsen","Associate Professor"],
  ["Simon Tobias Schulz Karg","Assistant Professor"],
  ["Florian Keppeler","Associate Professor"],
  ["Anne Mette Kjær","Professor"],
  ["Anne Mette Hjortskov Kjeldsen","Associate Professor"],
  ["Tonny Brems Knudsen","Associate Professor"],
  ["Karoline Larsen Kolstad","Assistant Professor"],
  ["Ane Edslev Konradsen","Assistant Professor"],
  ["Suthan Krishnarajan","Associate Professor"],
  ["Mathias Kruse","Assistant Professor"],
  ["Lars Thorup Larsen","Associate Professor"],
  ["Martin Vinæs Larsen","Associate Professor"],
  ["Carsten Bagge Laustsen","Associate Professor"],
  ["Lasse Laustsen","Associate Professor"],
  ["Lasse Egendal Leipziger","Assistant Professor"],
  ["Lasse Lindekilde","Professor"],
  ["Kasper Lippert-Rasmussen","Professor"],
  ["Clara Siboni Lund","Assistant Professor"],
  ["Jørgen Møller","Professor"],
  ["Peter Bjerre Mortensen","Professor"],
  ["Clara Neupert-Wentz","Associate Professor"],
  ["Vibeke Lehmann Nielsen","Professor"],
  ["Tore Vincents Olsen","Associate Professor"],
  ["Thomas Olesen","Professor"],
  ["Poul Aaes Nielsen","Associate Professor"],
  ["Viki Lyngby Hvid","Associate Professor"],
  ["Martin Bækgaard","Professor"],
  ["William Kjærgaard Egendal","Assistant Professor"],
  ["Mads Fuglsang Hove","Assistant Professor"],
  ["Kristian Frederiksen","Associate Professor"],
  ["Niels Nyholt","Assistant Professor"],
]

const blocks = [
  { institution: 'Aarhus University', department: 'AU Physics', data: AU_PHYS.map(([n,t])=>[n,t,`https://phys.au.dk/en/staff`]) },
  { institution: 'Aarhus University', department: 'AU Chemistry', data: AU_CHEM },
  { institution: 'Aarhus University', department: 'AU Agroecology', data: AU_AGRO.map(([n,t])=>[n,t,'https://agro.au.dk/en/about-the-department/employees']) },
  { institution: 'Aarhus University', department: 'AU Political Science', data: AU_PS.map(([n,t])=>[n,t,'https://ps.au.dk/en/contact/staff-1']) },
]

const newRecords = []
for (const b of blocks) {
  for (const [rawName, rawTitle, rawUrl] of b.data) {
    if (!keep(rawTitle)) continue
    const name = normalize(rawName)
    newRecords.push({ id: slugify(name), name, title: rawTitle, department: b.department, institution: b.institution, url: rawUrl })
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
