import { getPartyColor, sentClass } from '../utils'

const PROB_COLORS = {
  Positive: '#34d399',
  Neutral:  '#fbbf24',
  Negative: '#f87171',
}

function ConfBar({ label, pct }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-[10px] text-slate-500 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: PROB_COLORS[label] }}
        />
      </div>
      <span className="w-7 text-[10px] text-slate-500 text-right tabular-nums">{pct}%</span>
    </div>
  )
}

export default function NLPCards({ parties }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {parties.map(p => {
        const probs = p.ml_probabilities
        return (
          <div
            key={`${p.party}-${p.state}`}
            className="bg-navy-800 border border-navy-600 rounded-2xl p-5 hover:border-blue-500/30 hover:shadow-glow-blue transition-all duration-300 flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className="font-bold text-base truncate"
                  style={{ color: getPartyColor(p.party) }}
                >
                  {p.party}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{p.state}</p>
              </div>
              <span className={sentClass(p.actual_label)}>{p.actual_label}</span>
            </div>

            {/* Review */}
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 border-l-2 border-navy-600 pl-3">
              {p.review}
            </p>

            {/* ML + VADER predictions */}
            <div className="flex gap-3 text-xs">
              <div className="flex-1 bg-navy-900 rounded-lg px-3 py-2">
                <p className="text-slate-600 mb-0.5">ML Model</p>
                <p className="font-semibold" style={{ color: PROB_COLORS[p.ml_prediction] ?? '#94a3b8' }}>
                  {p.ml_prediction}
                </p>
                <p className="text-slate-600 text-[10px]">{(p.ml_confidence * 100).toFixed(0)}% conf.</p>
              </div>
              <div className="flex-1 bg-navy-900 rounded-lg px-3 py-2">
                <p className="text-slate-600 mb-0.5">VADER</p>
                <p className="font-semibold" style={{ color: PROB_COLORS[p.vader_label] ?? '#94a3b8' }}>
                  {p.vader_label}
                </p>
                <p className="text-slate-600 text-[10px]">{p.vader_compound.toFixed(2)} score</p>
              </div>
            </div>

            {/* Probability bars */}
            <div className="space-y-1.5">
              <ConfBar label="Positive" pct={Math.round((probs.Positive ?? 0) * 100)} />
              <ConfBar label="Neutral"  pct={Math.round((probs.Neutral  ?? 0) * 100)} />
              <ConfBar label="Negative" pct={Math.round((probs.Negative ?? 0) * 100)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
