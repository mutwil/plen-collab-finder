/**
 * Hero banner SVG: stylised Viking longship with a crew of rowers, evoking
 * "working together across Denmark". Pure inline SVG, theme-aware via
 * currentColor + var(--border)/var(--accent), no external assets.
 */
export default function VikingBanner() {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-[var(--border)] bg-gradient-to-b from-[#0ea5e9]/10 via-transparent to-[var(--accent)]/5 mb-8">
      <svg
        viewBox="0 0 1200 280"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-[150px] sm:h-[180px] md:h-[220px] block"
        aria-label="Viking longship with crew rowing together"
      >
        {/* Sky gradient */}
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--bg-card)" />
            <stop offset="100%" stopColor="var(--bg)" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="sail" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        <rect width="1200" height="280" fill="url(#sky)" />

        {/* Distant hills */}
        <path d="M0 170 Q 180 140 380 160 T 760 155 T 1200 165 L 1200 200 L 0 200 Z" fill="currentColor" opacity="0.06" />
        <path d="M0 185 Q 220 165 450 178 T 900 172 T 1200 182 L 1200 210 L 0 210 Z" fill="currentColor" opacity="0.1" />

        {/* Sea */}
        <rect x="0" y="180" width="1200" height="100" fill="url(#sea)" />
        {/* Waves */}
        <g opacity="0.35" stroke="#0ea5e9" strokeWidth="1.5" fill="none">
          <path d="M40 240 Q 60 235 80 240 T 120 240 T 160 240" />
          <path d="M220 250 Q 240 245 260 250 T 300 250 T 340 250" />
          <path d="M440 245 Q 460 240 480 245 T 520 245" />
          <path d="M880 248 Q 900 243 920 248 T 960 248 T 1000 248" />
          <path d="M1040 252 Q 1060 247 1080 252 T 1120 252" />
        </g>

        {/* Ship group */}
        <g transform="translate(240, 100)">
          {/* Oars */}
          <g stroke="#7c5e3b" strokeWidth="3.5" strokeLinecap="round" opacity="0.85">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <line key={i} x1={70 + i * 68} y1="118" x2={50 + i * 68} y2="160" />
            ))}
          </g>
          {/* Oar paddles */}
          <g fill="#5b4527" opacity="0.9">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ellipse key={i} cx={50 + i * 68} cy="162" rx="8" ry="3" />
            ))}
          </g>

          {/* Hull */}
          <path
            d="M 20 110
               Q 30 125 50 125
               L 700 125
               Q 720 125 730 115
               L 740 100
               L 720 100
               L 700 118
               L 50 118
               L 30 102
               L 10 102
               Z"
            fill="#8b5a2b"
            stroke="#5b3a15"
            strokeWidth="1.5"
          />
          {/* Plank detail line */}
          <path
            d="M 30 110 L 720 110"
            stroke="#5b3a15"
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Shield rail along the hull */}
          <g>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
              const x = 40 + i * 68
              const colors = ['#dc2626', '#fbbf24', '#16a34a', '#1d4ed8', '#dc2626', '#fbbf24', '#16a34a', '#1d4ed8', '#dc2626', '#fbbf24']
              return (
                <g key={i}>
                  <circle cx={x} cy="95" r="14" fill={colors[i]} stroke="#3f2714" strokeWidth="1.5" />
                  <circle cx={x} cy="95" r="3" fill="#3f2714" />
                  <line x1={x - 12} y1="95" x2={x + 12} y2="95" stroke="#3f2714" strokeWidth="1" opacity="0.7" />
                  <line x1={x} y1="83" x2={x} y2="107" stroke="#3f2714" strokeWidth="1" opacity="0.7" />
                </g>
              )
            })}
          </g>

          {/* Dragon head prow */}
          <g transform="translate(740, 60)">
            <path
              d="M 0 40 Q 10 20 25 22 Q 35 10 30 -5 Q 22 -12 12 -5 Q 5 2 5 10 Q -5 15 0 40 Z"
              fill="#7c5e3b"
              stroke="#3f2714"
              strokeWidth="1.5"
            />
            <circle cx="15" cy="5" r="2" fill="#dc2626" />
            <path d="M 18 12 L 25 12 L 22 18 Z" fill="#3f2714" />
          </g>

          {/* Stern curl */}
          <g transform="translate(10, 80)">
            <path
              d="M 0 30 Q -15 20 -10 5 Q -5 -5 5 0 Q 10 10 5 22 Q 0 28 0 30 Z"
              fill="#7c5e3b"
              stroke="#3f2714"
              strokeWidth="1.5"
            />
          </g>

          {/* Mast */}
          <line x1="370" y1="-70" x2="370" y2="92" stroke="#5b3a15" strokeWidth="4" />
          {/* Yard */}
          <line x1="230" y1="-60" x2="510" y2="-60" stroke="#5b3a15" strokeWidth="3" />

          {/* Sail */}
          <path d="M 230 -60 L 510 -60 L 495 40 L 245 40 Z" fill="url(#sail)" stroke="#92400e" strokeWidth="1.5" />
          {/* Sail stripes */}
          <g stroke="#b45309" strokeWidth="1" opacity="0.5">
            <line x1="240" y1="-30" x2="500" y2="-30" />
            <line x1="238" y1="0" x2="502" y2="0" />
            <line x1="243" y1="25" x2="497" y2="25" />
          </g>

          {/* Crew heads rowing — behind the shields */}
          <g>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
              const x = 50 + i * 68
              return (
                <g key={i}>
                  {/* Head */}
                  <circle cx={x} cy="62" r="8" fill="#f5d7b0" stroke="#7c5e3b" strokeWidth="1" />
                  {/* Helmet / hat */}
                  <path d={`M ${x - 9} 58 Q ${x} 48 ${x + 9} 58 Z`} fill="#6b7280" stroke="#3f2714" strokeWidth="1" />
                  {/* Beard */}
                  <path d={`M ${x - 5} 66 Q ${x} 72 ${x + 5} 66 Z`} fill="#7c5e3b" opacity="0.7" />
                </g>
              )
            })}
          </g>

          {/* Captain at the prow */}
          <g transform="translate(690, 40)">
            <circle cx="0" cy="20" r="9" fill="#f5d7b0" stroke="#7c5e3b" strokeWidth="1" />
            <path d="M -10 15 Q 0 2 10 15 Z" fill="#6b7280" stroke="#3f2714" strokeWidth="1" />
            {/* Horns */}
            <path d="M -9 11 Q -14 4 -11 2" fill="none" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
            <path d="M 9 11 Q 14 4 11 2" fill="none" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
            <rect x="-8" y="28" width="16" height="22" rx="3" fill="var(--accent)" />
            {/* Arm pointing forward */}
            <line x1="8" y1="34" x2="28" y2="26" stroke="#f5d7b0" strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>

        {/* Sun */}
        <circle cx="1060" cy="70" r="24" fill="#fbbf24" opacity="0.6" />
        <circle cx="1060" cy="70" r="18" fill="#fbbf24" opacity="0.9" />
      </svg>

      <div className="px-6 pb-4 pt-1 text-center text-[11px] text-[var(--text-subtle)] font-mono italic">
        Finding the right crew for your next voyage.
      </div>
    </div>
  )
}
