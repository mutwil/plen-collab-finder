import graphData from '@/data/graph.json'
import NetworkGraph from '@/components/NetworkGraph'

export const metadata = {
  title: 'Collaboration Network — DK Collab Finder',
  description: 'Network view of Danish researchers linked by topic overlap.',
}

export default function GraphPage() {
  return (
    <div className="h-[calc(100vh-56px)]">
      <div className="px-6 py-3 border-b border-[var(--border)] flex items-baseline justify-between">
        <div>
          <h1 className="text-lg font-semibold">Collaboration Network</h1>
          <p className="text-xs text-[var(--text-muted)]">
            {graphData.nodes.length} researchers linked by shared research topics. Click a node to see details and highlight neighbors.
          </p>
        </div>
      </div>
      <NetworkGraph data={graphData as { nodes: Array<{ id: string; name: string; title?: string; department?: string; institution?: string; topics?: string[]; summary?: string }>; edges: Array<{ s: string; t: string; w: number }> }} />
    </div>
  )
}
