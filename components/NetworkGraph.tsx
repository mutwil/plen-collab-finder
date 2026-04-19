'use client'

import { useEffect, useRef, useState, useMemo } from 'react'

interface GraphNode {
  id: string
  name: string
  title?: string
  department?: string
  institution?: string
  topics?: string[]
  summary?: string
}

interface GraphEdge {
  s: string
  t: string
  w: number
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

const INST_COLORS: Record<string, string> = {
  'University of Copenhagen': '#c084fc',
  'Technical University of Denmark': '#3b82f6',
  'Aarhus University': '#f97316',
  'Copenhagen Business School': '#16a34a',
  'University of Southern Denmark': '#eab308',
}

export default function NetworkGraph({ data }: { data: GraphData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<unknown>(null)
  const [selected, setSelected] = useState<GraphNode | null>(null)
  const [filterInst, setFilterInst] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState<'fcose' | 'concentric' | 'circle'>('fcose')
  const [hideIsolated, setHideIsolated] = useState(true)
  const [minSimilarity, setMinSimilarity] = useState(0.2)
  const [loading, setLoading] = useState(true)

  const institutions = useMemo(() => {
    const set = new Set<string>()
    for (const n of data.nodes) if (n.institution) set.add(n.institution)
    return Array.from(set).sort()
  }, [data.nodes])

  // Compute visible node IDs based on filters
  const visibleIds = useMemo(() => {
    const q = query.trim().toLowerCase()
    const ids = new Set<string>()
    for (const n of data.nodes) {
      if (filterInst !== 'all' && n.institution !== filterInst) continue
      if (q) {
        const hay = [n.name, n.title, n.department, n.institution, ...(n.topics || [])]
          .filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(q)) continue
      }
      ids.add(n.id)
    }
    return ids
  }, [data.nodes, filterInst, query])

  // Init cytoscape once
  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let cy: any = null

    ;(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cytoscape = ((await import('cytoscape')) as any).default
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fcose = ((await import('cytoscape-fcose')) as any).default
      try { cytoscape.use(fcose) } catch { /* already registered */ }

      if (cancelled || !containerRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const elements: any[] = []
      for (const n of data.nodes) {
        elements.push({
          group: 'nodes',
          data: {
            id: n.id,
            label: n.name,
            inst: n.institution,
            dept: n.department,
            color: INST_COLORS[n.institution || ''] || '#94a3b8',
            raw: n,
          },
        })
      }
      for (const e of data.edges) {
        elements.push({
          group: 'edges',
          data: { id: `${e.s}__${e.t}`, source: e.s, target: e.t, weight: e.w },
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy = cytoscape({
        container: containerRef.current,
        elements,
        minZoom: 0.1,
        maxZoom: 3,
        wheelSensitivity: 0.3,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(color)',
              'width': 8,
              'height': 8,
              'label': '',
              'border-width': 0,
              'opacity': 0.9,
            },
          },
          {
            selector: 'node.selected',
            style: {
              'width': 18,
              'height': 18,
              'border-width': 3,
              'border-color': '#16a34a',
              'label': 'data(label)',
              'font-size': 13,
              'font-weight': 'bold',
              'color': '#f5f5f4',
              'text-outline-color': '#0c0a09',
              'text-outline-width': 3,
              'text-valign': 'top',
              'text-margin-y': -4,
              'z-index': 999,
            },
          },
          {
            selector: 'node.hover',
            style: {
              'width': 14,
              'height': 14,
              'label': 'data(label)',
              'font-size': 12,
              'color': '#f5f5f4',
              'text-outline-color': '#0c0a09',
              'text-outline-width': 3,
              'text-valign': 'top',
              'text-margin-y': -2,
              'z-index': 900,
            },
          },
          {
            selector: 'node.hidden',
            style: { 'display': 'none' },
          },
          {
            selector: 'node.faded',
            style: { 'opacity': 0.08 },
          },
          {
            selector: 'edge.hidden',
            style: { 'display': 'none' },
          },
          {
            selector: 'node.neighbor',
            style: {
              'width': 12,
              'height': 12,
              'label': 'data(label)',
              'font-size': 11,
              'color': '#e7e5e4',
              'text-outline-color': '#0c0a09',
              'text-outline-width': 3,
              'text-valign': 'top',
              'text-margin-y': -2,
              'z-index': 800,
            },
          },
          {
            selector: 'node.match',
            style: {
              'width': 14,
              'height': 14,
              'border-width': 2,
              'border-color': '#f59e0b',
              'label': 'data(label)',
              'font-size': 12,
              'color': '#fde68a',
              'text-outline-color': '#0c0a09',
              'text-outline-width': 3,
              'text-valign': 'top',
              'text-margin-y': -2,
              'z-index': 850,
            },
          },
          {
            selector: 'edge',
            style: {
              'width': 'mapData(weight, 0.08, 1, 0.3, 3)',
              'line-color': '#78716c',
              'opacity': 0.25,
              'curve-style': 'straight',
            },
          },
          {
            selector: 'edge.highlighted',
            style: {
              'line-color': '#16a34a',
              'opacity': 0.8,
              'width': 2,
              'z-index': 850,
            },
          },
          {
            selector: 'edge.dimmed',
            style: { 'opacity': 0.05 },
          },
        ],
        layout: { name: 'preset' },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.on('tap', 'node', (evt: any) => {
        const id = evt.target.id()
        cy!.nodes().removeClass('selected neighbor')
        cy!.edges().removeClass('highlighted dimmed')
        const me = cy!.$id(id)
        me.addClass('selected')
        const neighbors = me.neighborhood('node')
        neighbors.addClass('neighbor')
        me.connectedEdges().addClass('highlighted')
        cy!.edges().not('.highlighted').addClass('dimmed')
        setSelected(evt.target.data('raw') as GraphNode)
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.on('tap', (evt: any) => {
        if (evt.target === cy) {
          cy!.nodes().removeClass('selected neighbor')
          cy!.edges().removeClass('highlighted dimmed')
          setSelected(null)
        }
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.on('mouseover', 'node', (evt: any) => { evt.target.addClass('hover') })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.on('mouseout', 'node', (evt: any) => { evt.target.removeClass('hover') })

      cyRef.current = cy

      // Run initial layout
      const lay = cy.layout({
        name: 'fcose',
        quality: 'default',
        randomize: true,
        animate: false,
        nodeRepulsion: 5000,
        idealEdgeLength: 60,
        edgeElasticity: 0.45,
        gravity: 0.35,
        numIter: 2000,
      } as unknown as object)
      lay.run()
      cy.fit(undefined, 60)
      setLoading(false)
    })()

    return () => {
      cancelled = true
      if (cy) cy.destroy()
      cyRef.current = null
    }
  }, [data])

  // Apply visibility whenever filters change
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cy = cyRef.current as any
    if (!cy) return
    const hasQuery = query.trim().length > 0
    const hasInst = filterInst !== 'all'
    const hasAnyFilter = hasQuery || hasInst

    // 1. Hide edges below similarity cutoff
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cy.edges().forEach((e: any) => {
      const w = e.data('weight') ?? 1
      if (w < minSimilarity) e.addClass('hidden')
      else e.removeClass('hidden')
    })

    // 2. Compute which nodes have visible (not .hidden) edges
    const connectedIds = new Set<string>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cy.edges(':not(.hidden)').forEach((e: any) => {
      connectedIds.add(e.source().id())
      connectedIds.add(e.target().id())
    })

    // 3. Matches and their neighbors
    const matchIds = visibleIds
    const expandedIds = new Set<string>(matchIds)
    if (hasAnyFilter) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cy.nodes().forEach((n: any) => {
        if (matchIds.has(n.id())) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          n.connectedEdges(':not(.hidden)').forEach((e: any) => {
            expandedIds.add(e.source().id())
            expandedIds.add(e.target().id())
          })
        }
      })
    }

    // 4. Apply classes to nodes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cy.nodes().forEach((n: any) => {
      n.removeClass('hidden match faded')
      const id = n.id()
      const isOrphan = !connectedIds.has(id)

      // Hide orphans (nodes with no edges above cutoff) if user wants
      if (hideIsolated && isOrphan) {
        n.addClass('hidden')
        return
      }
      if (hasAnyFilter) {
        if (matchIds.has(id)) n.addClass('match')
        else if (!expandedIds.has(id)) n.addClass('faded')
      }
    })

    // 5. Dim edges outside the match neighborhood
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cy.edges(':not(.hidden)').forEach((e: any) => {
      e.removeClass('dimmed')
      if (!hasAnyFilter) return
      const s = e.source().id()
      const t = e.target().id()
      if (!matchIds.has(s) && !matchIds.has(t)) e.addClass('dimmed')
    })
  }, [visibleIds, hideIsolated, query, filterInst, minSimilarity])

  const runLayout = (name: typeof layout) => {
    setLayout(name)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cy = cyRef.current as any
    if (!cy) return
    const opts =
      name === 'fcose'
        ? { name: 'fcose', quality: 'default', randomize: true, animate: true, animationDuration: 800, nodeRepulsion: 5000, idealEdgeLength: 60, gravity: 0.35 }
        : name === 'concentric'
        ? { name: 'concentric', animate: true, animationDuration: 800, minNodeSpacing: 20 }
        : { name: 'circle', animate: true, animationDuration: 800 }
    cy.layout(opts).run()
    setTimeout(() => cy.fit(undefined, 60), 900)
  }

  return (
    <div className="flex flex-col md:flex-row gap-0 h-[calc(100vh-120px)]">
      <div className="flex-1 relative bg-[var(--bg-subtle)]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1 rounded shadow">
              Laying out {data.nodes.length} researchers…
            </span>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />

        {/* Controls overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 max-w-xs shadow-lg">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names & topics…"
            className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text)] w-full"
          />
          <select
            value={filterInst}
            onChange={(e) => setFilterInst(e.target.value)}
            className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text)]"
          >
            <option value="all">All institutions</option>
            {institutions.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--text-muted)]">
            <button onClick={() => runLayout('fcose')} className={`px-2 py-0.5 rounded cursor-pointer border-none ${layout === 'fcose' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}>Force</button>
            <button onClick={() => runLayout('concentric')} className={`px-2 py-0.5 rounded cursor-pointer border-none ${layout === 'concentric' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}>Concentric</button>
            <button onClick={() => runLayout('circle')} className={`px-2 py-0.5 rounded cursor-pointer border-none ${layout === 'circle' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}>Circle</button>
          </div>
          <label className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" checked={hideIsolated} onChange={(e) => setHideIsolated(e.target.checked)} />
            Hide disconnected
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-mono text-[var(--text-muted)]">
            <div className="flex items-center justify-between">
              <span>Similarity cutoff</span>
              <span className="text-[var(--text)]">{minSimilarity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.08}
              max={0.8}
              step={0.01}
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[9px] text-[var(--text-subtle)]">
              <span>loose</span>
              <span>strict</span>
            </div>
          </label>
          <div className="text-[10px] font-mono text-[var(--text-subtle)] pt-1 border-t border-[var(--border)]">
            {visibleIds.size} of {data.nodes.length} nodes · {data.edges.length} edges
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-3 text-[10px] font-mono shadow-lg">
          <div className="text-[var(--text-muted)] mb-1 uppercase tracking-wider">Legend</div>
          {Object.entries(INST_COLORS).map(([inst, color]) => (
            <div key={inst} className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
              <span>{inst}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar for selected node */}
      {selected && (
        <aside className="w-full md:w-80 border-l border-[var(--border)] bg-[var(--bg-card)] p-5 overflow-y-auto">
          <button onClick={() => setSelected(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] bg-transparent border-none cursor-pointer mb-3">× Close</button>
          <h3 className="text-lg font-semibold mb-1">{selected.name}</h3>
          <div className="text-xs text-[var(--text-muted)] mb-3">
            {selected.title} · {selected.department}
            {selected.institution && <div className="text-[var(--text-subtle)] mt-0.5">{selected.institution}</div>}
          </div>
          {selected.summary && (
            <p className="text-sm leading-relaxed text-[var(--text)] mb-4">{selected.summary}</p>
          )}
          {selected.topics && selected.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {selected.topics.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border)]">{t}</span>
              ))}
            </div>
          )}
          <a href={`/researcher/${selected.id}`} className="block text-center text-sm text-white bg-[var(--accent)] rounded py-2 no-underline hover:opacity-90">
            Open full profile →
          </a>
        </aside>
      )}
    </div>
  )
}
