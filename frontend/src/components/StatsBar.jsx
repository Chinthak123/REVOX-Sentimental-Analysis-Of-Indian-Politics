function Sparkline({ values, color, id }) {
  if (!values || values.length < 2) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const w = 88, h = 36
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: h - 4 - ((v - min) / range) * (h - 8),
  }))
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 1; i < pts.length; i++) {
    const cpx = ((pts[i - 1].x + pts[i].x) / 2).toFixed(1)
    d += ` C ${cpx} ${pts[i - 1].y.toFixed(1)}, ${cpx} ${pts[i].y.toFixed(1)}, ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`
  }
  const fill = `${d} L ${pts[pts.length - 1].x} ${h} L 0 ${h} Z`
  const gid = `sg-${id}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function StatsBar({ data }) {
  const pos = data.parties.filter(p => p.actual_label === 'Positive').length
  const allScores = [...data.parties].sort((a, b) => a.overall - b.overall).map(p => p.overall)
  const bestObj = data.parties.find(p => p.party === data.best_overall.party && p.state === data.best_overall.state)
    ?? data.parties.find(p => p.party === data.best_overall.party)
  const sectorScores = bestObj ? Object.values(bestObj.scores) : allScores.slice(0, 5)
  const posScores = data.parties.filter(p => p.actual_label === 'Positive').map(p => p.overall)

  const cards = [
    {
      label: 'Parties Analysed',
      value: data.count,
      sub: `in ${data.year}`,
      spark: allScores,
      color: '#60a5fa',
      id: 'parties',
    },
    {
      label: 'Best Overall Party',
      value: data.best_overall.party,
      sub: data.best_overall.state,
      spark: sectorScores,
      color: '#34d399',
      id: 'best',
    },
    {
      label: 'Top Score',
      value: data.best_overall.score.toFixed(1),
      sub: '/ 10.0',
      spark: sectorScores,
      color: '#a78bfa',
      id: 'score',
    },
    {
      label: 'Positive Sentiment',
      value: `${pos} / ${data.count}`,
      sub: `${Math.round((pos / data.count) * 100)}% positive`,
      spark: posScores.length >= 2 ? posScores : allScores,
      color: '#34d399',
      id: 'pos',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div
          key={c.label}
          className="bg-navy-800 border border-navy-600 rounded-2xl px-5 py-4 hover:border-blue-500/40 hover:shadow-glow-blue transition-all duration-300 group"
        >
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">{c.label}</p>
          <p className="text-2xl font-bold text-white truncate">{c.value}</p>
          <p className="text-slate-600 text-xs mt-0.5">{c.sub}</p>
          {c.spark && (
            <div className="mt-3 opacity-60 group-hover:opacity-100 transition-opacity">
              <Sparkline values={c.spark} color={c.color} id={c.id} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
