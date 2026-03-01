import { SECTOR_ICONS, SECTOR_COLORS } from '../utils'

const SECTOR_BG = [
  'hover:border-yellow-500/40 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  'hover:border-blue-500/40 hover:shadow-glow-blue',
  'hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  'hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  'hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]',
]

export default function SectorCards({ sectors }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {sectors.map((s, i) => (
        <div
          key={s.sector}
          className={`
            relative bg-navy-800 border border-navy-600 rounded-2xl p-5
            flex flex-col items-center text-center gap-2
            hover:scale-[1.03] transition-all duration-300 cursor-default
            ${SECTOR_BG[i] ?? ''}
          `}
        >
          {/* Trophy badge */}
          <span className="absolute top-3 right-3 text-xs">🏆</span>

          {/* Icon */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: SECTOR_COLORS[i] + '20', border: `1px solid ${SECTOR_COLORS[i]}40` }}
          >
            {SECTOR_ICONS[i]}
          </div>

          {/* Sector name */}
          <p className="text-slate-400 text-[10px] uppercase tracking-wider">{s.sector}</p>

          {/* Party */}
          <p
            className="text-base font-bold leading-tight"
            style={{ color: SECTOR_COLORS[i] }}
          >
            {s.best_party}
          </p>

          {/* State */}
          <p className="text-slate-500 text-xs">{s.best_state}</p>

          {/* Score */}
          <div
            className="mt-1 px-3 py-0.5 rounded-full text-sm font-semibold"
            style={{ background: SECTOR_COLORS[i] + '18', color: SECTOR_COLORS[i] }}
          >
            {s.best_score.toFixed(1)}
          </div>
        </div>
      ))}
    </div>
  )
}
