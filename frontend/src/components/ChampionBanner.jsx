export default function ChampionBanner({ best, year }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 via-navy-800 to-navy-800 px-6 py-5 flex items-center gap-6 glow-border">
      {/* Crown */}
      <div className="text-4xl shrink-0 select-none">👑</div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mb-1">
          Overall Champion · {year}
        </p>
        <p className="text-2xl font-bold text-white truncate">{best.party}</p>
        <p className="text-slate-400 text-sm mt-0.5">{best.state}</p>
      </div>

      {/* Score badge */}
      <div className="shrink-0 text-center">
        <div className="text-3xl font-black text-blue-400">{best.score.toFixed(1)}</div>
        <div className="text-slate-500 text-xs">/ 10</div>
      </div>

      {/* Review quote */}
      <div className="hidden md:block flex-1 border-l border-navy-600 pl-6 min-w-0">
        <p className="text-slate-400 text-sm italic leading-relaxed line-clamp-2">
          "{best.review}"
        </p>
      </div>
    </div>
  )
}
