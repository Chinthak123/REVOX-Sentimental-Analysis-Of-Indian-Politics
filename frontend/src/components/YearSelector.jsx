export default function YearSelector({ years, year, onChange }) {
  const idx = years.indexOf(year)
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => idx > 0 && onChange(years[idx - 1])}
        disabled={idx <= 0}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-700 hover:bg-navy-600 disabled:opacity-30 text-slate-300 hover:text-white transition-all text-lg leading-none"
      >
        ‹
      </button>

      <select
        value={year ?? ''}
        onChange={e => onChange(Number(e.target.value))}
        className="bg-navy-700 border border-navy-500 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors cursor-pointer"
      >
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      <button
        onClick={() => idx < years.length - 1 && onChange(years[idx + 1])}
        disabled={idx >= years.length - 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-navy-700 hover:bg-navy-600 disabled:opacity-30 text-slate-300 hover:text-white transition-all text-lg leading-none"
      >
        ›
      </button>
    </div>
  )
}
