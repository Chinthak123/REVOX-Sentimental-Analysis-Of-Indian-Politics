
import { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import YearSelector from './components/YearSelector'
import StatsBar from './components/StatsBar'
import PerformanceCharts from './components/PerformanceCharts'
import SectorCards from './components/SectorCards'
import ChampionBanner from './components/ChampionBanner'
import RankingsTable from './components/RankingsTable'
import LivePredictor from './components/LivePredictor'
import NLPCards from './components/NLPCards'
import PartyProfiles from './components/PartyProfiles'
import ChatBot from './components/ChatBot'

export default function App() {
  const [years, setYears]     = useState([])
  const [year, setYear]       = useState(null)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [active, setActive]   = useState('dashboard')

  useEffect(() => {
    fetch('/api/years')
      .then(r => r.json())
      .then(({ years: ys, default_year }) => { setYears(ys); setYear(default_year) })
      .catch(() => { setYears([2005,2007,2008,2010,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023]); setYear(2022) })
  }, [])

  useEffect(() => {
    if (!year) return
    setLoading(true); setError(null)
    fetch(`/api/analysis/${year}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [year])

  const scrollTo = useCallback((id) => {
    setActive(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-200 font-sans">
      <Sidebar active={active} onNav={scrollTo} />

      {/* Main */}
      <div className="flex-1 min-w-0 pl-64 min-h-screen overflow-x-hidden">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-navy-950/80 backdrop-blur border-b border-navy-600 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Panel Overview</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">Performance</h1>
          </div>
          <YearSelector years={years} year={year} onChange={setYear} />
        </header>

        {/* Content */}
        <main className="px-8 py-6 space-y-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4 text-sm">
              ⚠ {error}
            </div>
          )}

          {data && !loading && (
            <>
              {/* Stats */}
              <section id="dashboard">
                <StatsBar data={data} />
              </section>

              {/* Performance chart */}
              <section id="performance">
                <PerformanceCharts data={data} />
              </section>

              {/* Champion */}
              <ChampionBanner best={data.best_overall} year={data.year} />

              {/* Sector leaders */}
              <section id="sectors">
                <SectionTitle>Sector Leaders</SectionTitle>
                <SectorCards sectors={data.sectors} />
              </section>

              {/* Rankings */}
              <section id="rankings">
                <SectionTitle>Party Rankings</SectionTitle>
                <RankingsTable parties={data.parties} />
              </section>

              {/* Party Profiles */}
              <section id="profiles">
                <SectionTitle>Party Profiles</SectionTitle>
                <PartyProfiles parties={data.parties} />
              </section>

              {/* NLP */}
              <section id="nlp">
                <SectionTitle>NLP Analysis</SectionTitle>
                <NLPCards parties={data.parties} />
              </section>
            </>
          )}

          {/* Live Predictor — always visible */}
          <section id="predict">
            <SectionTitle>Live Sentiment Predictor</SectionTitle>
            <LivePredictor />
          </section>

          <div className="h-10" />
        </main>
      </div>

      {/* Floating chatbot */}
      <section id="chat">
        <ChatBot />
      </section>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
      <span className="w-4 h-px bg-blue-500" />
      {children}
    </h2>
  )
}
