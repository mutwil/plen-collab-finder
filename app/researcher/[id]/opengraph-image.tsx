import { ImageResponse } from 'next/og'
import { getById, loadResearchers } from '@/lib/researchers'

export const runtime = 'nodejs'
export const alt = 'Researcher profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return loadResearchers().map((r) => ({ id: r.id }))
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const r = getById(id)

  // Fallback if somehow the researcher doesn't exist
  if (!r) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0c0a09',
            color: '#fafaf9',
            fontSize: 48,
          }}
        >
          DK Collab Finder
        </div>
      ),
      { ...size },
    )
  }

  const titleColor = titleColorOf(r.title)
  const topics = (r.topics || []).slice(0, 6)
  const summary = (r.summary || '').slice(0, 180)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 100%)',
          color: '#fafaf9',
        }}
      >
        {/* top bar: site brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: '#22c55e',
            }}
          />
          <div style={{ fontSize: 22, color: '#a8a29e', letterSpacing: '0.05em' }}>
            DK Collab Finder
          </div>
        </div>

        {/* middle: name, title, dept, summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              {r.name}
            </div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 26 }}>
              {r.title && (
                <div
                  style={{
                    color: titleColor,
                    background: titleColor + '22',
                    padding: '4px 14px',
                    borderRadius: 8,
                    fontWeight: 500,
                  }}
                >
                  {r.title}
                </div>
              )}
              {r.department && (
                <div style={{ color: '#a8a29e', fontFamily: 'monospace' }}>
                  {r.department}
                </div>
              )}
              {r.institution && (
                <div style={{ color: '#78716c' }}>{`· ${r.institution}`}</div>
              )}
            </div>
          </div>

          {summary && (
            <div style={{ fontSize: 22, color: '#d6d3d1', lineHeight: 1.45, maxWidth: 1000 }}>
              {summary + (r.summary && r.summary.length > 180 ? '…' : '')}
            </div>
          )}

          {topics.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              {topics.map((t) => (
                <div
                  key={t}
                  style={{
                    fontSize: 18,
                    color: '#a8a29e',
                    background: '#292524',
                    border: '1px solid #44403c',
                    padding: '4px 12px',
                    borderRadius: 6,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* bottom: link hint */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 18,
            color: '#78716c',
            fontFamily: 'monospace',
          }}
        >
          <div>{`plen-collab-finder.vercel.app/researcher/${r.id}`}</div>
          <div>Find collaborators across Danish research 🇩🇰</div>
        </div>
      </div>
    ),
    { ...size },
  )
}

function titleColorOf(title?: string): string {
  if (!title) return '#94a3b8'
  const lc = title.toLowerCase()
  if (lc.includes('full professor') || lc === 'professor' || lc.includes('professor,')) return '#c084fc'
  if (lc.includes('associate professor')) return '#3b82f6'
  if (lc.includes('assistant professor') || lc.includes('tenure track')) return '#34d399'
  if (lc.includes('senior researcher')) return '#f97316'
  return '#c084fc'
}
