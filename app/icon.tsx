import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#c8102e',
          position: 'relative',
        }}
      >
        {/* Danish cross - vertical arm (offset left, per flag convention) */}
        <div style={{ position: 'absolute', left: 20, top: 0, width: 10, height: 64, background: '#ffffff', display: 'flex' }} />
        {/* Danish cross - horizontal arm */}
        <div style={{ position: 'absolute', left: 0, top: 27, width: 64, height: 10, background: '#ffffff', display: 'flex' }} />
        {/* Network node triangle overlay (top-right red quadrant) */}
        <div style={{ position: 'absolute', left: 42, top: 8, width: 10, height: 10, borderRadius: 5, background: '#16a34a', display: 'flex' }} />
        <div style={{ position: 'absolute', left: 52, top: 18, width: 8, height: 8, borderRadius: 4, background: '#16a34a', display: 'flex' }} />
        <div style={{ position: 'absolute', left: 40, top: 20, width: 7, height: 7, borderRadius: 3.5, background: '#16a34a', display: 'flex' }} />
      </div>
    ),
    { ...size },
  )
}
