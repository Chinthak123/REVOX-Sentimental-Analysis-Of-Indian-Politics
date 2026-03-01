import { getPartyColor, SECTOR_KEYS, SECTOR_COLORS, sentClass } from '../utils'

function MiniBar({ score, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 bg-navy-600 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${(score / 10) * 100}%`, background: color }}
        />
      </div>
      <span className="text-xs text-slate-400 tabular-nums">{score.toFixed(1)}</span>
    </div>
  )
}

export default function RankingsTable({ parties }) {
  const sorted = [...parties].sort((a, b) => b.overall - a.overall)

  return (
    <div className="bg-navy-800 border border-navy-600 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-600">
              {['#', 'Party', 'State', 'Overall', 'Admin', 'Education', 'Employment', 'Health', 'Transport', 'Actual', 'ML Pred', 'VADER'].map(h => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => (
              <tr
                key={`${p.party}-${p.state}`}
                className="border-b border-navy-700/50 hover:bg-navy-700/40 transition-colors duration-150"
              >
                <td className="px-4 py-3 text-slate-500 tabular-nums">{i + 1}</td>
                <td
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                  style={{ color: getPartyColor(p.party) }}
                >
                  {p.party}
                </td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{p.state}</td>
                <td className="px-4 py-3"><MiniBar score={p.overall} color="#60a5fa" /></td>
                {SECTOR_KEYS.map((k, si) => (
                  <td key={k} className="px-4 py-3">
                    <MiniBar score={p.scores[k] ?? 0} color={SECTOR_COLORS[si]} />
                  </td>
                ))}
                <td className="px-4 py-3"><span className={sentClass(p.actual_label)}>{p.actual_label}</span></td>
                <td className="px-4 py-3">
                  <span className={sentClass(p.ml_prediction)}>{p.ml_prediction}</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">{(p.ml_confidence * 100).toFixed(0)}%</div>
                </td>
                <td className="px-4 py-3">
                  <span className={sentClass(p.vader_label)}>{p.vader_label}</span>
                  <div className="text-[10px] text-slate-500 mt-0.5">{p.vader_compound.toFixed(2)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
