import { useState } from 'react'

const LABEL_META = {
  Positive: { color: '#34d399', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  Neutral:  { color: '#fbbf24', bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20',  text: 'text-yellow-400'  },
  Negative: { color: '#f87171', bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400'    },
}


export default function LivePredictor() {
  const [text, setText]     = useState('')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState(null)
  const [busy, setBusy]     = useState(false)

  async function analyze() {
    if (!text.trim()) { setError('Please enter some text.'); return }
    setError(null); setBusy(true)
    try {
      const res  = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Server error'); setBusy(false); return }
      setResult(data)
    } catch (e) {
      setError('Request failed: ' + e.message)
    }
    setBusy(false)
  }

  const vadMeta = result ? (LABEL_META[result.vader_label] ?? LABEL_META.Neutral) : null

  return (
    <div className="bg-navy-800 border border-navy-600 rounded-2xl p-6 space-y-5">
      {/* Input */}
      <textarea
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter a governance review text… e.g. Excellent roads and hospitals, great administration."
        className="w-full bg-navy-900 border border-navy-600 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
      />

      <button
        onClick={analyze}
        disabled={busy}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-glow-blue hover:shadow-glow-blue-lg"
      >
        {busy ? 'Analyzing…' : 'Analyze Sentiment'}
      </button>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className={`rounded-xl border p-5 animate-fade-in ${vadMeta.bg} ${vadMeta.border}`}>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">ML Prediction</p>
          <p className={`text-2xl font-bold ${vadMeta.text}`}>{result.vader_label}</p>
          <p className="text-slate-500 text-xs mt-1 mb-5">
            Compound score: {result.vader_compound.toFixed(3)}
          </p>
          <div className="space-y-2.5 text-xs text-slate-400">
            {[['Positive', result.vader_pos], ['Neutral', result.vader_neu], ['Negative', result.vader_neg]].map(([l, v]) => (
              <div key={l} className="flex items-center gap-3">
                <span className="w-16 shrink-0">{l}</span>
                <div className="flex-1 h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((v ?? 0) * 100)}%`, background: LABEL_META[l]?.color }}
                  />
                </div>
                <span className="w-9 text-right tabular-nums">{Math.round((v ?? 0) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
