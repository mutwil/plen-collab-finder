// Precompute a top-K nearest-neighbor graph of researchers based on
// topic-overlap (Jaccard). Writes data/graph.json consumed by /graph page.
//
// Strategy:
//   For each researcher, find top-K most similar by Jaccard on normalized
//   lowercase topics. This yields up to N*K directed edges; we then
//   dedupe to an undirected edge set (union of each pair's mutual top-K).
//   Min-score threshold keeps only meaningfully similar links.

import { readFileSync, writeFileSync } from 'node:fs'

const DATA_PATH = new URL('../data/researchers.json', import.meta.url)
const OUT_PATH = new URL('../data/graph.json', import.meta.url)

const K = 6          // top-K neighbors per node
const MIN_SCORE = 0.15  // Jaccard threshold — weaker links dropped

const researchers = JSON.parse(readFileSync(DATA_PATH, 'utf8'))
  .filter((r) => r.topics && r.topics.length >= 3)  // need topics to be meaningful

console.log(`${researchers.length} researchers with ≥3 topics`)

const norm = (t) => t.toLowerCase().trim()
const topicSets = researchers.map((r) => new Set(r.topics.map(norm)))

// Index topic → researcher indices for faster lookup
const topicIdx = new Map()
for (let i = 0; i < researchers.length; i++) {
  for (const t of topicSets[i]) {
    if (!topicIdx.has(t)) topicIdx.set(t, [])
    topicIdx.get(t).push(i)
  }
}

// For each node, score only candidates that share ≥1 topic
const edges = new Set()
const edgeWeights = new Map()

for (let i = 0; i < researchers.length; i++) {
  const mySet = topicSets[i]
  const candidates = new Map()  // neighborIdx → sharedTopicCount
  for (const t of mySet) {
    for (const j of topicIdx.get(t)) {
      if (j === i) continue
      candidates.set(j, (candidates.get(j) || 0) + 1)
    }
  }
  // Score candidates by Jaccard
  const scored = []
  for (const [j, shared] of candidates) {
    const union = mySet.size + topicSets[j].size - shared
    const score = shared / union
    if (score >= MIN_SCORE) scored.push({ j, score })
  }
  scored.sort((a, b) => b.score - a.score)
  for (const { j, score } of scored.slice(0, K)) {
    const [a, b] = i < j ? [i, j] : [j, i]
    const key = `${a}-${b}`
    if (!edges.has(key)) {
      edges.add(key)
      edgeWeights.set(key, score)
    } else if (score > edgeWeights.get(key)) {
      edgeWeights.set(key, score)
    }
  }
  if (i % 100 === 0) console.log(`  ${i}/${researchers.length}`)
}

console.log(`${edges.size} undirected edges`)

// Build export
const nodes = researchers.map((r, i) => ({
  id: r.id,
  idx: i,
  name: r.name,
  title: r.title,
  department: r.department,
  institution: r.institution,
  topics: r.topics?.slice(0, 8),
  summary: r.summary?.slice(0, 200),
}))

const edgeList = []
for (const [key, score] of edgeWeights) {
  const [a, b] = key.split('-').map(Number)
  edgeList.push({ s: nodes[a].id, t: nodes[b].id, w: +score.toFixed(3) })
}

// Stats
const deg = new Map()
for (const e of edgeList) {
  deg.set(e.s, (deg.get(e.s) || 0) + 1)
  deg.set(e.t, (deg.get(e.t) || 0) + 1)
}
const degrees = Array.from(deg.values())
const isolated = nodes.length - deg.size
console.log(`Isolated nodes: ${isolated}`)
console.log(`Avg degree: ${(degrees.reduce((a, b) => a + b, 0) / degrees.length).toFixed(1)}`)
console.log(`Max degree: ${Math.max(...degrees)}`)

writeFileSync(OUT_PATH, JSON.stringify({ nodes, edges: edgeList }, null, 0))
console.log(`Wrote ${OUT_PATH.pathname}`)
