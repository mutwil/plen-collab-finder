// Merge newly-scraped faculty rosters with existing data/researchers.json.
// Existing rich entries (with topics/summary) are preserved; new bare entries
// are appended. Matches by normalized name (case-insensitive).

import { readFileSync, writeFileSync } from 'node:fs'

const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const existing = JSON.parse(readFileSync(DATA_PATH, 'utf8'))

const INCLUDE = /(professor|lektor|adjunkt|seniorforsker|senior\sresearcher|tenure|centerleder)/i
const EXCLUDE = /emerit|emerita|guest|visiting|affiliate|head\sof\scentre|administrative|ph\.?d|postdoc|student|leiden/i

// Danish → English title mapping
const TITLE_MAP = {
  'lektor': 'Associate Professor',
  'adjunkt': 'Assistant Professor',
  'tenure track adjunkt': 'Tenure Track Assistant Professor',
  'seniorforsker': 'Senior Researcher',
  'centerleder': 'Center Director',
}

function translateTitle(t) {
  const lc = (t || '').toLowerCase().trim()
  return TITLE_MAP[lc] || t
}

function normalize(name) {
  if (name.includes(',')) {
    const [last, first] = name.split(',').map((s) => s.trim())
    return `${first} ${last}`
  }
  return name.trim()
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function absoluteUrl(url, baseHost) {
  if (!url) return undefined
  if (url.startsWith('http')) return url
  if (url.startsWith('?')) return baseHost + '/english/' + url
  if (url.startsWith('/')) return baseHost + url
  return url
}

function keep(title) {
  if (!title) return false
  if (EXCLUDE.test(title)) return false
  return INCLUDE.test(title)
}

// ─── Scraped data ───────────────────────────────────────────────

const PLEN_DATA = [
  ["Bak, Søren","Professor","?pure=en/persons/173299"],
  ["Bruun, Sander","Professor","?pure=en/persons/12773"],
  ["Burow, Meike","Professor","?pure=en/persons/343155"],
  ["Cedergreen, Nina","Professor","?pure=en/persons/310634"],
  ["Christensen, Jan H.","Professor","?pure=en/persons/310964"],
  ["Collinge, David B.","Professor","?pure=en/persons/11699"],
  ["Fuglsang, Anja Thoe","Professor","?pure=en/persons/36035"],
  ["Günther-Pomorski, Thomas","Professor","?pure=en/persons/354775"],
  ["Halkier, Barbara Ann","Professor","?pure=en/persons/125900"],
  ["Hansen, Lars Hestbjerg","Professor","?pure=en/persons/125054"],
  ["Hansen, Hans Chr. Bruun","Professor","?pure=en/persons/65930"],
  ["Holm, Peter Engelund","Professor","?pure=en/persons/254574"],
  ["Husted, Søren","Professor","?pure=en/persons/310759"],
  ["Jensen, Lars Stoumann","Professor","?pure=en/persons/184737"],
  ["Kampranis, Sotirios","Professor","?pure=en/persons/543322"],
  ["Kapel, Christian Moliin Outzen","Professor","?pure=en/persons/94545"],
  ["Liu, Fulai","Professor","?pure=en/persons/310952"],
  ["Lopez Marques, Rosa Laura","Professor","?pure=en/persons/310783"],
  ["Møller, Birger Lindberg","Professor","?pure=en/persons/97696"],
  ["Neve, Paul","Professor","?pure=en/persons/710570"],
  ["Palmgren, Michael Broberg","Professor","?pure=en/persons/95923"],
  ["Persson, Staffan","Professor","?pure=en/persons/675412"],
  ["Roitsch, Thomas Georg","Professor","?pure=en/persons/468246"],
  ["Schulz, Alexander","Professor","?pure=en/persons/309543"],
  ["Thordal-Christensen, Hans","Professor","?pure=en/persons/207715"],
  ["Thorup-Kristensen, Kristian","Professor","?pure=en/persons/143157"],
  ["Ulvskov, Peter","Professor","?pure=en/persons/91123"],
]

const BIO_DATA = [
  ["Albin Gustav Sandelin","Professor","?pure=en/persons/308874"],
  ["Anders Albrechtsen","Professor","?pure=en/persons/280554"],
  ["Anders Gudiksen","Assistant Professor","?pure=en/persons/302637"],
  ["Anders Priemé","Professor","?pure=en/persons/116193"],
  ["Anders Lydik Garm","Associate Professor","?pure=en/persons/114506"],
  ["Amelie Stein","Associate Professor","?pure=en/persons/540451"],
  ["Anna Sherwood","Assistant Professor","?pure=en/persons/663767"],
  ["Arnaud Stigliani","Assistant Professor","?pure=en/persons/695609"],
  ["Birgitte Regenberg","Professor","?pure=en/persons/23899"],
  ["Birthe Brandt Kragelund","Professor","?pure=en/persons/200605"],
  ["Cesar Pacherres","Assistant Professor","?pure=en/persons/740473"],
  ["Christian Holmberg","Associate Professor","?pure=en/persons/19565"],
  ["Cristina Isabel Amador Hierro","Associate Professor","?pure=en/persons/638063"],
  ["Danillo O. Alvarenga","Assistant Professor","?pure=en/persons/678596"],
  ["David Richard Nash","Associate Professor","?pure=en/persons/201051"],
  ["Dean Jacobsen","Associate Professor","?pure=en/persons/65468"],
  ["Ditte Skovaa Andersen","Associate Professor","?pure=en/persons/644674"],
  ["Elena Bollati","Assistant Professor","?pure=en/persons/723868"],
  ["Eleazar José Rodriguez Gomes","Associate Professor","?pure=en/persons/439566"],
  ["Elodie Floriane Mandel-Briefer","Associate Professor","?pure=en/persons/638318"],
  ["Elizabeth Catherine Connolly","Assistant Professor","?pure=en/persons/741654"],
  ["Flemming Ekelund","Associate Professor","?pure=en/persons/95940"],
  ["Frank Hauser","Associate Professor","?pure=en/persons/86368"],
  ["Genevieve Thon","Associate Professor","?pure=en/persons/29648"],
  ["Giulio Tesei","Assistant Professor","?pure=en/persons/673215"],
  ["Godefroid Charbon","Associate Professor","?pure=en/persons/440400"],
  ["Hans Henrik Bruun","Professor","?pure=en/persons/149504"],
  ["Hans Redlef Siegismund","Associate Professor","?pure=en/persons/29118"],
  ["Henriette Pilegaard","Professor","?pure=en/persons/88312"],
  ["Ida Moltke","Associate Professor","?pure=en/persons/206300"],
  ["Jacobus Jan Boomsma","Professor","?pure=en/persons/186303"],
  ["Jakob Grunnet Knudsen","Associate Professor","?pure=en/persons/289726"],
  ["Jakob R. Winther","Professor","?pure=en/persons/36936"],
  ["Jana Isanta-Navarro","Assistant Professor","?pure=en/persons/797197"],
  ["Jeppe Vinther","Associate Professor","?pure=en/persons/123717"],
  ["Jes Søe Pedersen","Associate Professor","?pure=en/persons/223913"],
  ["Jing Tang","Assistant Professor","?pure=en/persons/507605"],
  ["Jinzhong Lin","Assistant Professor","?pure=en/persons/559127"],
  ["Joel Vizueta Moraga","Assistant Professor","?pure=en/persons/693363"],
  ["Johan Gotthardt Olsen","Assistant Professor","?pure=en/persons/140246"],
  ["Jonathan Donhauser","Assistant Professor","?pure=en/persons/790316"],
  ["Jonathan Z. Shik","Associate Professor","?pure=en/persons/472337"],
  ["Josefin Stiller","Assistant Professor","?pure=en/persons/592680"],
  ["Joseph Nesme","Assistant Professor","?pure=en/persons/592375"],
  ["Julien Colombani","Associate Professor","?pure=en/persons/644685"],
  ["Kaare Teilum","Professor","?pure=en/persons/11856"],
  ["Kaj Sand-Jensen","Professor","?pure=en/persons/49846"],
  ["Karen Skriver","Professor","?pure=en/persons/115649"],
  ["Karsten Kristiansen","Professor","?pure=en/persons/161470"],
  ["Kathrin Rousk","Associate Professor","?pure=en/persons/473488"],
  ["Katrine Worsaae","Professor","?pure=en/persons/128411"],
  ["Kenneth Veland Halberg","Associate Professor","?pure=en/persons/246619"],
  ["Kelli Lynn Hvorecny","Assistant Professor","?pure=en/persons/910896"],
  ["Kim Rewitz","Professor","?pure=en/persons/407115"],
  ["Kirsten Seestern Christoffersen","Professor","?pure=en/persons/130281"],
  ["Kolby Jeremiah Jardine","Associate Professor","?pure=en/persons/928811"],
  ["Kresten Lindorff-Larsen","Professor","?pure=en/persons/174843"],
  ["Kristian Agmund Haanes","Associate Professor","?pure=en/persons/326635"],
  ["Lars Ellgaard","Professor","?pure=en/persons/294574"],
  ["Lars Båstrup-Spohr","Associate Professor","?pure=en/persons/246625"],
  ["Lasse Riemann","Professor","?pure=en/persons/33633"],
  ["Laura Martinez Alvarez","Associate Professor","?pure=en/persons/454592"],
  ["Lone Rønnov-Jessen","Associate Professor","?pure=en/persons/91722"],
  ["Lotte Bang Pedersen","Professor","?pure=en/persons/293381"],
  ["Marlene Reichel","Assistant Professor","?pure=en/persons/778135"],
  ["Martin Willemoës","Associate Professor","?pure=en/persons/158435"],
  ["Mathias Middelboe","Professor","?pure=en/persons/137902"],
  ["Mette Burmølle","Professor","?pure=en/persons/31279"],
  ["Michael Askvad Sørensen","Associate Professor","?pure=en/persons/120703"],
  ["Michael James Texada","Associate Professor","?pure=en/persons/575120"],
  ["Michael Kühl","Professor","?pure=en/persons/89882"],
  ["Michael Lisby","Professor","?pure=en/persons/280629"],
  ["Michael Poulsen","Professor","?pure=en/persons/227714"],
  ["Milena Timcenko","Assistant Professor","?pure=en/persons/706590"],
  ["Mirna Perez-Moreno","Associate Professor","?pure=en/persons/605337"],
  ["Nadja Møbjerg","Associate Professor","?pure=en/persons/132768"],
  ["Niels Daugbjerg","Associate Professor","?pure=en/persons/126461"],
  ["Niels Banhos Danneskiold-Samsøe","Assistant Professor","?pure=en/persons/292081"],
  ["Niels-Ulrik Frigaard","Associate Professor","?pure=en/persons/287045"],
  ["Nikolai Friberg","Professor","?pure=en/persons/122024"],
  ["Olaf Nielsen","Professor","?pure=en/persons/39875"],
  ["Ole Pedersen","Professor","?pure=en/persons/157437"],
  ["Ole Winther","Professor","?pure=en/persons/104236"],
  ["Patrícia Chrzanová Pecnerová","Assistant Professor","?pure=en/persons/642956"],
  ["Per Amstrup Pedersen","Professor","?pure=en/persons/44216"],
  ["Per Juel Hansen","Professor","?pure=en/persons/105096"],
  ["Peter Brodersen","Professor","?pure=en/persons/56490"],
  ["Pétur Orri Heiðarsson","Associate Professor","?pure=en/persons/345064"],
  ["Rafael Pinilla Redondo","Assistant Professor","?pure=en/persons/544480"],
  ["Rasmus Hartmann-Petersen","Professor","?pure=en/persons/990"],
  ["Rasmus Heller","Associate Professor","?pure=en/persons/206697"],
  ["Rasmus Kjøller","Associate Professor","?pure=en/persons/152372"],
  ["Riikka Rinnan","Professor","?pure=en/persons/266870"],
  ["Robin Andersson","Associate Professor","?pure=en/persons/402837"],
  ["Rodrigo Ibarra Chavez","Assistant Professor","?pure=en/persons/678997"],
  ["Rouba Jneid","Assistant Professor","?pure=en/persons/741652"],
  ["Sarah Rennie","Associate Professor","?pure=en/persons/536814"],
  ["Sine Lo Svenningsen","Associate Professor","?pure=en/persons/179750"],
  ["Stine Helene Falsig Pedersen","Professor","?pure=en/persons/157497"],
  ["Søren Rosendahl","Professor","?pure=en/persons/111832"],
  ["Søren Johannes Sørensen","Professor","?pure=en/persons/83514"],
  ["Søren Tvorup Christensen","Professor","?pure=en/persons/143225"],
  ["Tarun Veer Singh Ahluwalia","Associate Professor","?pure=en/persons/408671"],
  ["Thomas Wim Hamelryck","Professor","?pure=en/persons/271052"],
  ["Urvish Trivedi","Associate Professor","?pure=en/persons/474480"],
  ["Vasileios Voutsinos","Assistant Professor","?pure=en/persons/713185"],
  ["Vibe Hallundbæk Østergaard","Associate Professor","?pure=en/persons/367753"],
  ["Xi Wang","Assistant Professor","?pure=en/persons/708655"],
  ["Xiaodong Liu","Assistant Professor","?pure=en/persons/674033"],
  ["Xu Peng","Professor","?pure=en/persons/184750"],
  ["YONG ZHANG","Associate Professor","?pure=en/persons/544579"],
  ["Yi Jiao","Assistant Professor","?pure=en/persons/729954"],
  ["Yuvaraj Bhoobalan","Assistant Professor","?pure=en/persons/498819"],
]

const FOOD_DATA = [
  ["Ahrné, Lilia","Professor","?pure=en/persons/557325"],
  ["Andersen, Mogens Larsen","Professor","?pure=en/persons/175136"],
  ["Arneborg, Nils","Associate Professor","?pure=en/persons/310649"],
  ["Aru, Violetta","Assistant Professor","?pure=en/persons/569208"],
  ["Bakalis, Serafim","Professor","?pure=en/persons/682009"],
  ["Barfod, Kenneth Klingenberg","Associate Professor","?pure=en/persons/165275"],
  ["Barone, Giovanni","Assistant Professor","?pure=en/persons/706694"],
  ["Bonilla, José","Assistant Professor","?pure=en/persons/836151"],
  ["Boom, Remko Marcel","Professor","?pure=en/persons/776050"],
  ["Bredie, Wender","Professor","?pure=en/persons/310788"],
  ["Bro, Rasmus","Professor","?pure=en/persons/159399"],
  ["Büdeyri Gökgöz, Nilay","Assistant Professor","?pure=en/persons/693725"],
  ["Czaja, Tomasz Pawel","Assistant Professor","?pure=en/persons/661108"],
  ["Deptula, Paulina","Assistant Professor","?pure=en/persons/400414"],
  ["Dragone, Giuliano Marcelo","Associate Professor","?pure=en/persons/838014"],
  ["Duque Estrada, Patricia","Assistant Professor","?pure=en/persons/736395"],
  ["Engelsen, Søren Balling","Professor","?pure=en/persons/310851"],
  ["Frøst, Michael Bom","Associate Professor","?pure=en/persons/310889"],
  ["Gouseti, Ourania","Associate Professor","?pure=en/persons/707755"],
  ["Holt, Sylvester","Assistant Professor","?pure=en/persons/246300"],
  ["Hougaard, Anni Bygvrå","Associate Professor","?pure=en/persons/310165"],
  ["Jensen, Poul Erik","Professor","?pure=en/persons/310667"],
  ["Jespersen, Lene","Professor","?pure=en/persons/310451"],
  ["Khakimov, Bekzod","Associate Professor","?pure=en/persons/388946"],
  ["Kirkensgaard, Jacob Judas Kain","Associate Professor","?pure=en/persons/258778"],
  ["Krych, Lukasz","Associate Professor","?pure=en/persons/403177"],
  ["Lametsch, Rene","Associate Professor","?pure=en/persons/310895"],
  ["Lund, Marianne Nissen","Professor","?pure=en/persons/310673"],
  ["Nielsen, Dennis Sandris","Professor","?pure=en/persons/310135"],
  ["Olsen, Karsten","Associate Professor","?pure=en/persons/81437"],
  ["Orlien, Vibeke","Associate Professor","?pure=en/persons/39045"],
  ["Petersen, Iben Lykke","Associate Professor","?pure=en/persons/310459"],
  ["Petersen, Mikael Agerlin","Associate Professor","?pure=en/persons/310625"],
  ["Poojary, Mahesha Manjunatha","Associate Professor","?pure=en/persons/538219"],
  ["Quintanilla Casas, Beatriz","Assistant Professor","?pure=en/persons/768954"],
  ["Raak, Norbert","Assistant Professor","?pure=en/persons/798691"],
  ["Rasmussen, Morten Arendt","Professor","?pure=en/persons/311655"],
  ["Rasmussen, Torben Sølbeck","Associate Professor","?pure=en/persons/574512"],
  ["Reinbach, Helene Christine","Associate Professor","?pure=en/persons/310387"],
  ["Rinnan, Åsmund","Associate Professor","?pure=en/persons/310780"],
  ["Risbo, Jens","Associate Professor","?pure=en/persons/35494"],
  ["Røder, Henriette Lyng","Associate Professor","?pure=en/persons/289566"],
  ["Siegumfeldt, Henrik","Associate Professor","?pure=en/persons/310519"],
  ["Sinotte, Veronica Marie","Assistant Professor","?pure=en/persons/572027"],
  ["Stokholm, Jakob","Professor","?pure=en/persons/181314"],
  ["Thomsen, Marianne","Professor","?pure=en/persons/169127"],
  ["Tsermoula, Paraskevi","Assistant Professor","?pure=en/persons/675089"],
  ["Viereck, Nanna","Associate Professor","?pure=en/persons/11836"],
  ["Wang, Qian Janice","Associate Professor","?pure=en/persons/744593"],
  ["Zhu, Deyong","Assistant Professor","?pure=en/persons/710748"],
  ["van der Berg, Franciscus Winfried J","Associate Professor","?pure=en/persons/310826"],
]

const MBG_DATA = [
  ["Nikolaj Abel","Assistant Professor","205a2f71-85a3-4d54-bb20-0f5d3acaccf3"],
  ["Pablo Alcón","Assistant Professor","515035e5-6931-4c19-b237-c264e7ffc368"],
  ["Ebbe Sloth Andersen","Professor","c0741b1d-b5c7-46c6-9ee6-3590316882e8"],
  ["Gregers Rom Andersen","Professor","11cafc34-2c9e-4247-91de-5682cdca052f"],
  ["Kasper Røjkjær Andersen","Professor","b2286f54-e599-4401-93da-c1e6a7681c2f"],
  ["Peter Ebert Andersen","Associate Professor","b808d787-66d2-422b-a0ad-99e1ac4e483f"],
  ["Stig Uggerhøj Andersen","Professor","dbcd376b-110b-489a-8f6d-85dd2268277d"],
  ["Thomas Bataillon","Professor","8a3f8bad-957a-4a82-a80f-ad722ed6796f"],
  ["Juraj Bergman","Tenure Track Assistant Professor","5a0e0ec6-b003-4c4b-ac83-d466a5bce7f1"],
  ["Søren Besenbacher","Associate Professor","ce64758a-054a-40ca-897b-543899af8c0f"],
  ["Nicolai Juul Birkbak","Professor","d37577ad-d197-4f43-9ed0-22e806b7bcbd"],
  ["Lotte Bjergbæk","Associate Professor","67e87adf-f2a0-42b8-8bb8-dcc8d59a663d"],
  ["Thomas Boesen","Senior Researcher","4616a4b8-efa7-4a6a-96ee-22286c586093"],
  ["Xavier Bofill De Ros","Assistant Professor","5238a8a8-b232-4c5c-b762-04266274792a"],
  ["Ditlev Egeskov Brodersen","Professor","949c93d7-db87-4b37-be18-da3484ef3da9"],
  ["Andrii Bugai","Assistant Professor","a9d08142-c163-4180-afaf-ff8add897809"],
  ["Christian Kroun Damgaard","Associate Professor","a24c7ef7-266e-495e-8688-c78af63545da"],
  ["Yuhui Dou","Assistant Professor","fd62823e-1510-4989-a6c3-94e086b9197e"],
  ["Jan J. Enghild","Professor","8ed6c632-b99d-4ded-950f-aa8055595765"],
  ["Leslie Foldager","Senior Researcher","a815b9b5-4778-40b7-9686-3020f664195f"],
  ["Manuel Frank","Assistant Professor","c6562a6a-c811-4dc4-82da-edf46502ecab"],
  ["Rosaria Gandini","Assistant Professor","ea5a0e37-5081-4c07-97ae-d400aaa028c4"],
  ["Aleksandr Gavrin","Assistant Professor","014a6de8-464e-4a36-bea8-e08b9ec9fe09"],
  ["Jakob Grove","Professor","172151b5-79f9-4863-9a04-0d9cda9f4d78"],
  ["Kira Gysel","Assistant Professor","b4c7e9f2-1a37-47de-9dfe-b178b0d1762e"],
  ["Rune Hartmann","Professor","693cef7b-e116-4613-a5ca-bc538cab5b9f"],
  ["Yuya Hayashi","Associate Professor","bda9b691-4e00-430e-9c40-187dbbd928fd"],
  ["Andreas Holleufer","Assistant Professor","f12763af-3b6c-4cdc-a71f-2276b9b75692"],
  ["Erik Østergaard Jensen","Associate Professor","83efb460-1431-48eb-aa27-0f75a3f564ea"],
  ["Torben Heick Jensen","Professor","a08c2bdc-4318-45f1-bb8a-1cabcb464b01"],
  ["Haja Kadarmideen","Professor","687ae3de-7263-4ad5-ac4c-3e04f4ecb4b2"],
  ["Lilian Kisiswa","Associate Professor","212c25e5-1e52-475a-95c9-d7365d12139a"],
  ["Taro Kitazawa","Associate Professor","223bdddf-94bd-4fc9-b4c0-dbe5b9ef3752"],
  ["Magnus Kjærgaard","Associate Professor","2fe125f6-0aca-4729-a640-2cfc0385bb9a"],
  ["Jørgen Kjems","Professor","f5915d75-aca3-437a-9a9d-f4fdfef7accd"],
  ["Birgitta R. Knudsen","Associate Professor","50fca07c-ced4-453a-a26a-0d664c9a1491"],
  ["Charlotte Rohde Knudsen","Associate Professor","782aeedc-6bcd-4ce7-867a-57a7cfbcf1bc"],
  ["Emil Laust Kristoffersen","Assistant Professor","43107887-47e0-4fd6-aa05-c838c7afc696"],
  ["Esben Lorentzen","Professor","0a861373-22ee-4f93-8540-5bd979f9a32f"],
  ["Thi Bich Luu","Assistant Professor","ffc090dd-f8d3-4fbc-a9f9-eaefe282441f"],
  ["Joseph Lyons","Tenure Track Assistant Professor","5011cf6f-8839-4aa7-ba3e-02b04f09168c"],
  ["Mette Galsgaard Malle","Assistant Professor","213c383b-a6d2-4c9d-af82-93cb8c5bfbd8"],
  ["Marcela Mendoza-Suárez","Assistant Professor","06340943-1af3-4a9f-a9db-a8727d15f362"],
  ["Noëmie Mermet-Joret","Assistant Professor","77544f91-4aa8-4982-896f-9b08f1dc8297"],
  ["Fiona Müllner","Associate Professor","87d27a6e-85e1-4797-ba3f-2f7104665194"],
  ["Kasper Munch","Associate Professor","17eeb32a-f16c-4f1b-a396-1eeba3e28602"],
  ["Sadegh Nabavi","Associate Professor","94dc5e1e-8437-4c74-a901-99ab3793db2d"],
  ["Marcin Nadzieja","Assistant Professor","896e30f2-c8b8-4b48-aed0-ca5de75cbc62"],
  ["Dragos Niculescu","Assistant Professor","10a112ca-f487-4cc2-9a4a-c9190c383ab8"],
  ["Michael Lund Nielsen","Professor","57e6839d-c6d5-4048-808d-e3d85ca361ce"],
  ["Nadia Sukusu Nielsen","Assistant Professor","19180a95-b47b-4bec-b100-d613cac6a6ab"],
  ["Ulf Andersson Vang Ørom","Associate Professor","fd91354b-b12a-4002-b963-5bbb8dd9eb9d"],
  ["Daniel Erik Otzen","Professor","0ec06c22-1f74-4dd2-a894-af30b6565766"],
  ["Claus Oxvig","Professor","ed472b6b-b72e-45f7-9d27-09bc23d0db9d"],
  ["Bjørn Panyella Pedersen","Professor","51967bad-d869-45d6-9a7e-667e068eb43e"],
  ["Christian Nørgaard Storm Pedersen","Associate Professor","c36d6c36-4b4c-453f-9f0d-9e9110ddbb1a"],
  ["Jakob Skou Pedersen","Professor","9c14e87f-2dc3-4c08-a074-146337aff8a0"],
  ["Lene Pedersen","Associate Professor","10a29fd5-1347-47cf-be2b-cce437fcb165"],
  ["Simona Radutoiu","Professor","ab9305e9-16d3-4c5e-bb7b-9bcefa37d5a5"],
  ["Jan Trige Rasmussen","Senior Researcher","70fbaa7e-bff4-4d4f-98e3-b7679de56d4a"],
  ["Alena Salasova","Associate Professor","d8e86714-df70-4701-a1a6-acfd76cf6769"],
  ["Niels Nørgaard Sandal","Senior Researcher","3203dbd8-0a55-474f-b9c3-b359bbbc5308"],
  ["Mikkel Heide Schierup","Professor","aa7cd7f5-b8cf-4781-b6a6-be522a7b335c"],
  ["Ragnhild Bager Skjerning","Assistant Professor","dc8f22c4-14c8-4339-b3a0-43295d1c730a"],
  ["Esben Skipper Sørensen","Professor","2a324c87-edd8-452c-b464-b2db7a9e268a"],
  ["Tinna V. Stevnsner","Professor","dcc8089e-abdf-4ae8-93c5-b43f99e4ddb1"],
  ["Charlott Stock","Assistant Professor","69b181c6-35ed-40fc-986d-f0d6f09351bc"],
  ["Jens Stougaard","Professor","f18b1608-17eb-4ff2-92d9-251f14f48a28"],
  ["Chao Sun","Associate Professor","9d9311fd-fc99-4663-aa36-6afe465fc213"],
  ["Cinzia Tesauro","Assistant Professor","f4ff1aa9-9d88-4ccb-9fbd-528e42283f7b"],
  ["Bo Thomsen","Associate Professor","f6c24beb-b997-4a4a-98fb-e026c870fd21"],
  ["Daan van Aalten","Professor","721793ab-9dcb-4e8f-b2b5-54c5bf405b63"],
  ["Vera Anna van der Weijden","Tenure Track Assistant Professor","2c392a35-d796-4884-b9e0-c4b6bd6868c4"],
  ["Gilles Claude Vanwalleghem","Tenure Track Assistant Professor","6541b97f-e29b-489a-bd13-2ff7f0475bbb"],
  ["Bjarni Jóhann Vilhjálmsson","Professor","35c047ab-0899-4434-91bb-121e4878ec76"],
  ["Palle Villesen","Associate Professor","c1c4bd28-befd-4150-bbbb-10138e528d53"],
  ["Kathryn Jayne Williams","Assistant Professor","3b563069-8bf0-4689-bc11-dc947c5b7196"],
  ["Christian Würtz Heegaard","Senior Researcher","f7804b8e-023c-4aab-8102-0a1d95b20760"],
  ["Peter Zeller","Tenure Track Assistant Professor","89ad0f2e-6429-47fa-bfd6-d99fb9567eb0"],
  ["Lorena Zuzic","Assistant Professor","37895d4e-7faf-453a-9149-c79bfa802705"],
]

const QGG_DATA = [
  ["Torben Asp","Professor","790dac99-3fc3-4952-b489-b919fac518fa"],
  ["Bjarne Nielsen","Lektor","a79025ca-c2cb-4ed1-bb8e-6f6142d08bb1"],
  ["Elesandro Bornhofen","Adjunkt","bfc9bd72-127d-46af-9871-51362694f9dd"],
  ["Alban Etienne René Bouquet","Tenure Track adjunkt","e14fa1ad-d2cb-4d4d-8d71-487786f13208"],
  ["Albert Johannes Buitenhuis","Lektor","28656822-a723-4817-b0dd-d48b40e15b0f"],
  ["Zexi Cai","Lektor","8a71bf1c-e484-4cff-9a57-02a1c6d6b061"],
  ["Thinh Tuan Chu","Adjunkt","a996e251-e8bb-444a-a1e6-2086669d6ee9"],
  ["Lingzhao Fang","Tenure Track adjunkt","4e548f18-1d3b-4395-b7ad-6c7b7d1d1f79"],
  ["Grum Gebreyesus","Tenure Track adjunkt","634d4580-4bbe-4eae-92bf-92324e079e70"],
  ["Quentin Geissmann","Tenure Track adjunkt","6c5747e9-e7bc-4150-82bf-5a17830bdadc"],
  ["Irene Julca","Adjunkt","0127d1da-49a4-4c32-9572-114ea0b5c91b"],
  ["Emre Karaman","Lektor","c11acd9b-178b-43cb-a44c-214f25de4760"],
  ["Morten Kargo","Seniorforsker","a3522626-c405-4303-9d68-3e5f12599c31"],
  ["Bingjie Li","Lektor","5c4a3fac-a128-43b5-82c8-4b5e8e877415"],
  ["Huiming Liu","Adjunkt","7387ba32-3eea-4128-8d2e-c100bb9653c1"],
  ["Peter Løvendahl","Seniorforsker","d1d68047-88cc-43f8-93ed-04e289ca5b38"],
  ["Luc Janss","Professor","63afa9ba-d299-4d90-b4b8-235b761e8df8"],
  ["Just Jensen","Professor","fd33639a-638e-4eca-b152-71c93ab91293"],
  ["Mogens Sandø Lund","Centerleder","8e942512-a4dd-4371-b41c-7d39af8f31e8"],
  ["Per Madsen","Seniorforsker","ae23d5af-c802-448b-8228-c5b98de87fdd"],
  ["Hanne Marie Nielsen","Seniorforsker","4557ab69-42a2-40e1-9c55-66bb9f9aad50"],
  ["Vivi Hunnicke Nielsen","Lektor","b39dff48-59cf-47ed-8da0-94826fdf67bf"],
  ["Guillaume Ramstein","Tenure Track adjunkt","def38197-8b5d-4910-99fe-b488f4619dab"],
  ["Goutam Sahana","Professor","bb375f9c-4103-4460-80cc-ec53d0cd03d5"],
  ["Peter Sørensen","Seniorforsker","7c450296-453c-46d1-9ac3-c56b25ddda41"],
  ["Doug Speed","Professor","b8f3a130-3852-4e11-8061-ad934446c532"],
  ["Rasmus Bak Stephansen","Tenure Track adjunkt","01f6c4b8-fd2f-443d-9b57-e70ca19d440d"],
  ["Guosheng Su","Seniorforsker","20b733e4-94e1-4a7a-8e5b-9a3477de9289"],
  ["Viktor Milkevych","Adjunkt","645d2415-a77c-4b98-85e1-9389888bd735"],
  ["Roos Marina Zaalberg","Adjunkt","123b45a3-e065-4dfb-a02b-2792cdc1d76b"],
]

// ─── Convert scraped rows into Researcher objects ────────────────

const blocks = [
  {
    institution: 'University of Copenhagen', department: 'PLEN',
    baseHost: 'https://plen.ku.dk', urlPrefix: '',
    data: PLEN_DATA,
  },
  {
    institution: 'University of Copenhagen', department: 'BIO',
    baseHost: 'https://www1.bio.ku.dk', urlPrefix: '',
    data: BIO_DATA,
  },
  {
    institution: 'University of Copenhagen', department: 'FOOD',
    baseHost: 'https://food.ku.dk', urlPrefix: '',
    data: FOOD_DATA,
  },
  {
    institution: 'Aarhus University', department: 'AU MBG',
    baseHost: 'https://mbg.au.dk',
    urlPrefix: 'https://mbg.au.dk/en/contact/staff-and-students/show/person/',
    data: MBG_DATA,
  },
  {
    institution: 'Aarhus University', department: 'AU QGG',
    baseHost: 'https://qgg.au.dk',
    urlPrefix: 'https://qgg.au.dk/om-qgg/kontakt/vis/person/',
    data: QGG_DATA,
  },
]

const newRecords = []
for (const block of blocks) {
  for (const [rawName, rawTitle, rawUrl] of block.data) {
    const title = translateTitle(rawTitle)
    if (!keep(title)) continue
    const name = normalize(rawName)
    let url
    if (block.urlPrefix) {
      url = block.urlPrefix + rawUrl
    } else if (rawUrl && rawUrl.startsWith('?')) {
      url = block.baseHost + '/english/' + rawUrl
    } else if (rawUrl && rawUrl.startsWith('http')) {
      url = rawUrl
    }
    newRecords.push({
      id: slugify(name),
      name,
      title,
      department: block.department,
      institution: block.institution,
      url,
    })
  }
}

// ─── Merge into existing ─────────────────────────────────────────

const existingByName = new Map()
for (const r of existing) {
  if (r.name) existingByName.set(r.name.toLowerCase().trim(), r)
}

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

for (const r of existing) {
  if (!r.id) r.id = slugify(r.name)
}

writeFileSync(DATA_PATH, JSON.stringify(existing, null, 2))
console.log(`Total: ${existing.length} researchers`)
console.log(`  + ${added} new`)
console.log(`  · ${enriched} existing enriched with missing fields`)
console.log(`  = new records processed: ${newRecords.length}`)

const byInst = {}
for (const r of existing) {
  const k = r.institution || 'Other'
  byInst[k] = (byInst[k] || 0) + 1
}
console.log('\nBy institution:')
for (const [inst, n] of Object.entries(byInst).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${inst}: ${n}`)
}
