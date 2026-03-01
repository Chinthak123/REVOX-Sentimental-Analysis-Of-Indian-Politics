import { getPartyColor } from '../utils'

/* ── Static party info from parties info.txt ── */
const PARTY_INFO = {
  BJP: {
    fullName: 'Bharatiya Janata Party',
    formed: 1980,
    leader: 'Narendra Modi',
    leaderTitle: 'Prime Minister',
    activities: [
      'Promotes nationalism and Hindutva ideology',
      'Focus on economic development, infrastructure and defence',
      'Strong central governance policies',
    ],
    history: [
      'Currently the ruling party at the Centre',
      'Major reforms like GST and Article 370 removal',
      'Dominant political force since 2014',
    ],
    emoji: '🟧',
  },
  INC: {
    fullName: 'Indian National Congress',
    formed: 1885,
    leader: 'Mallikarjun Kharge',
    leaderTitle: 'President',
    activities: [
      'Promotes secularism and inclusive development',
      'Welfare schemes, social justice, economic reforms',
    ],
    history: [
      "Led India's freedom struggle",
      'Shaped by leaders like Mahatma Gandhi and Jawaharlal Nehru',
      'Dominated Indian politics for decades after independence',
    ],
    emoji: '🟦',
  },
  AAP: {
    fullName: 'Aam Aadmi Party',
    formed: 2012,
    leader: 'Arvind Kejriwal',
    leaderTitle: 'National Convener',
    activities: [
      'Focus on anti-corruption and transparency',
      'Education and healthcare reforms',
      'Governance model based on public welfare',
    ],
    history: [
      'Emerged from the anti-corruption movement (2011)',
      'Formed government in Delhi multiple times',
      'Known for reforms in government schools and Mohalla Clinics',
    ],
    emoji: '🟨',
  },
  LDF: {
    fullName: 'Left Democratic Front — led by CPI(M)',
    formed: 1964,
    leader: 'M. A. Baby',
    leaderTitle: 'CPI(M) General Secretary',
    activities: [
      'Promotes Marxist ideology',
      "Focus on workers' rights, farmers' welfare, public sector protection",
      'Active in trade unions and student movements',
    ],
    history: [
      'Played a major role in Left politics in India',
      'Ruled West Bengal for 34 years (1977–2011)',
      'Influential in land reforms and decentralisation policies',
    ],
    emoji: '🟥',
  },
  'CPI(M)': {
    fullName: 'Communist Party of India (Marxist)',
    formed: 1964,
    leader: 'M. A. Baby',
    leaderTitle: 'General Secretary',
    activities: [
      'Promotes Marxist ideology',
      "Focus on workers' rights, farmers' welfare, public sector protection",
      'Active in trade unions and student movements',
    ],
    history: [
      'Played a major role in Left politics in India',
      'Ruled West Bengal for 34 years (1977–2011)',
      'Influential in land reforms and decentralisation policies',
    ],
    emoji: '🟥',
  },
}

/* ── Which parties to show (have profile info) ── */
const PROFILE_KEYS = ['BJP', 'INC', 'AAP', 'LDF', 'CPI(M)']

function ScoreBadge({ score, label }) {
  const pct = (score / 10) * 100
  const color = score >= 6.5 ? '#34d399' : score >= 5.5 ? '#fbbf24' : '#f87171'
  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-600">
      <span className="text-xs text-slate-500">{label} score</span>
      <div className="flex-1 h-1.5 bg-navy-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>{score.toFixed(1)}</span>
    </div>
  )
}

export default function PartyProfiles({ parties }) {
  /* Build a quick lookup: partyName → performance data for the year */
  const perfMap = {}
  parties.forEach(p => { perfMap[p.party] = p })

  /* Collect cards: only parties that have profile info AND either have year data OR always show */
  const cards = PROFILE_KEYS.reduce((acc, key) => {
    const info = PARTY_INFO[key]
    if (!info) return acc
    /* Avoid duplicates (LDF and CPI(M) share the same info) */
    if (acc.find(c => c.key === (key === 'CPI(M)' ? 'LDF' : key))) return acc
    const perf = perfMap[key] ?? null
    acc.push({ key, info, perf })
    return acc
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {cards.map(({ key, info, perf }) => {
        const color = getPartyColor(key)
        return (
          <div
            key={key}
            className="bg-navy-800 border border-navy-600 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-glow-blue transition-all duration-300 group"
          >
            {/* Coloured top strip */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-lg font-black" style={{ color }}>{key}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{ color, borderColor: color + '40', background: color + '12' }}
                    >
                      est. {info.formed}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1 leading-snug">{info.fullName}</p>
                </div>
                {perf && (
                  <span
                    className="shrink-0 text-xs px-2 py-1 rounded-lg font-medium"
                    style={{ background: color + '18', color }}
                  >
                    #{parties.indexOf(perf) + 1 || '—'}
                  </span>
                )}
              </div>

              {/* Leader */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: color + '20', color }}
                >
                  {info.leader.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{info.leader}</p>
                  <p className="text-slate-500 text-[10px]">{info.leaderTitle}</p>
                </div>
              </div>

              {/* Activities + History — two-column grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Main Activities
                  </p>
                  <ul className="space-y-1.5">
                    {info.activities.map((a, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-400 leading-snug">
                        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Historical Significance
                  </p>
                  <ul className="space-y-1.5">
                    {info.history.map((h, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-400 leading-snug">
                        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Performance score for selected year */}
              {perf
                ? <ScoreBadge score={perf.overall} label={`${perf.state} overall`} />
                : (
                  <p className="text-[10px] text-slate-600 mt-3 pt-3 border-t border-navy-700">
                    No performance data for this year
                  </p>
                )
              }
            </div>
          </div>
        )
      })}
    </div>
  )
}
