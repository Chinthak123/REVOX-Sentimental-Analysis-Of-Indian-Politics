import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend,
} from 'chart.js'
import { Line, Radar } from 'react-chartjs-2'
import { getPartyColor, SECTOR_KEYS } from '../utils'

ChartJS.register(
  CategoryScale, LinearScale,
  RadialLinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend,
)

const GRID_COLOR   = '#0d1f3c'
const TICK_COLOR   = '#475569'
const LEGEND_COLOR = '#94a3b8'

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: LEGEND_COLOR, font: { size: 11 }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: '#071428',
      borderColor: '#122548',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
    },
  },
}

export default function PerformanceCharts({ data }) {
  const top6 = [...data.parties].sort((a, b) => b.overall - a.overall).slice(0, 6)
  const top5 = top6.slice(0, 5)
  const [active, setActive] = useState(top5[0]?.party ?? null)

  useEffect(() => { setActive(top5[0]?.party ?? null) }, [data.year])

  const radarParty = top5.find(p => p.party === active) ?? top5[0]

  /* ── Line chart ── */
  const lineData = {
    labels: SECTOR_KEYS,
    datasets: top6.map((p, i) => {
      const color = getPartyColor(p.party)
      return {
        label: p.party,
        data: SECTOR_KEYS.map(k => p.scores[k] ?? 0),
        borderColor: color,
        backgroundColor: i === 0 ? color + '22' : 'transparent',
        borderWidth: i === 0 ? 2.5 : 1.5,
        tension: 0.45,
        fill: i === 0,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: color,
        pointBorderColor: '#020817',
        pointBorderWidth: 2,
      }
    }),
  }

  const lineOptions = {
    ...baseOpts,
    scales: {
      x: {
        ticks: { color: TICK_COLOR, font: { size: 11 } },
        grid: { color: GRID_COLOR },
        border: { color: GRID_COLOR },
      },
      y: {
        min: 0, max: 10,
        ticks: { color: TICK_COLOR, font: { size: 11 } },
        grid: { color: GRID_COLOR },
        border: { color: GRID_COLOR },
      },
    },
  }

  /* ── Radar chart ── */
  const rColor = radarParty ? getPartyColor(radarParty.party) : '#60a5fa'
  const radarData = {
    labels: SECTOR_KEYS,
    datasets: [{
      label: radarParty?.party ?? '',
      data: SECTOR_KEYS.map(k => radarParty?.scores[k] ?? 0),
      backgroundColor: rColor + '25',
      borderColor: rColor,
      borderWidth: 2,
      pointBackgroundColor: rColor,
      pointBorderColor: '#020817',
      pointBorderWidth: 2,
      pointRadius: 4,
    }],
  }

  const radarOptions = {
    ...baseOpts,
    scales: {
      r: {
        min: 0, max: 10,
        ticks: { color: TICK_COLOR, backdropColor: 'transparent', font: { size: 9 } },
        grid: { color: '#122548' },
        pointLabels: { color: LEGEND_COLOR, font: { size: 10 } },
        angleLines: { color: '#122548' },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Line chart — main */}
      <div className="xl:col-span-2 bg-navy-800 border border-navy-600 rounded-2xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">
          Sector Scores — Top {top6.length} Parties
        </p>
        <div className="h-64">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-navy-800 border border-navy-600 rounded-2xl p-5">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
          Sector Profile
        </p>
        {/* Party selector */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {top5.map(p => (
            <button
              key={p.party}
              onClick={() => setActive(p.party)}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                active === p.party
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-navy-600 hover:border-navy-500'
              }`}
            >
              {p.party}
            </button>
          ))}
        </div>
        <div className="h-52">
          <Radar data={radarData} options={radarOptions} />
        </div>
      </div>
    </div>
  )
}
