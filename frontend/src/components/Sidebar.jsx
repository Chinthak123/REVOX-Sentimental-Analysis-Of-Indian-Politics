const NAV = [
  { id: 'dashboard',  label: 'Dashboard',      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="2"/></svg> },
  { id: 'performance',label: 'Performance',    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'sectors',    label: 'Sector Leaders', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'rankings',   label: 'Party Rankings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2" strokeLinecap="round"/></svg> },
  { id: 'profiles',   label: 'Party Profiles', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'nlp',        label: 'NLP Analysis',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'predict',    label: 'Live Predict',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'chat',       label: 'AI Assistant',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
]

export default function Sidebar({ active, onNav }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-navy-800 border-r border-navy-600 flex flex-col z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-navy-600">
        <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-sm shadow-glow-blue">
          RX
        </div>
        <div>
          <p className="text-white font-bold text-sm tracking-wider">REVOX</p>
          <p className="text-slate-500 text-xs">Political Analytics</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-slate-600 text-[10px] uppercase tracking-widest px-3 mb-3">Navigation</p>
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`
              relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 group text-left
              ${active === item.id
                ? 'sidebar-active bg-blue-500/10 text-blue-400'
                : 'text-slate-400 hover:bg-navy-700 hover:text-slate-200'}
            `}
          >
            <span className={`transition-colors duration-200 ${active === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {item.icon}
            </span>
            {item.label}
            {active === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-navy-600">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs text-white font-bold">IN</div>
          <div>
            <p className="text-slate-300 text-xs font-medium">India Dashboard</p>
            <p className="text-slate-600 text-[10px]">2005 – 2023</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
