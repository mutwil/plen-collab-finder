import { ImageResponse } from 'next/og'
import researchersData from '@/data/researchers.json'

export const runtime = 'edge'
export const alt = 'Danish Research Collaboration Finder'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const count = (researchersData as unknown[]).length
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: '#22c55e',
            }}
          />
          <div style={{ fontSize: 24, color: '#a8a29e', letterSpacing: '0.05em' }}>
            DK Collab Finder
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Find a research collaborator in Denmark.
          </div>
          <div style={{ fontSize: 28, color: '#a8a29e', lineHeight: 1.4 }}>
            AI-powered directory of {count} faculty across Danish universities.
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 20,
            color: '#78716c',
            fontFamily: 'monospace',
          }}
        >
          <span>KU · DTU · AU · SDU</span>
          <span>·</span>
          <span>plen-collab-finder.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
