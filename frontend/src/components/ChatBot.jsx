import { useState, useRef, useEffect } from 'react'

export default function ChatBot() {
  const [open, setOpen]       = useState(false)
  const [history, setHistory] = useState([])
  const [input, setInput]     = useState('')
  const [busy, setBusy]       = useState(false)
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, busy])

  async function send() {
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    setHistory(h => [...h, userMsg])
    setBusy(true)
    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...history, userMsg] }),
      })
      const data = await res.json()
      const reply = res.ok ? data.reply : '⚠ ' + (data.detail || 'Server error')
      setHistory(h => [...h, { role: 'assistant', content: reply }])
    } catch (e) {
      setHistory(h => [...h, { role: 'assistant', content: '⚠ Network error: ' + e.message }])
    }
    setBusy(false)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Ask AI about Indian politics"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-300 flex items-center justify-center text-white text-xl"
      >
        {open
          ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        }
      </button>

      {/* Chat window */}
      <div
        className={`
          fixed bottom-24 right-6 z-50 w-80 md:w-96
          bg-navy-800 border border-navy-600 rounded-2xl shadow-glow-blue
          flex flex-col overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        style={{ height: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-navy-600 bg-navy-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-black shadow-glow-blue">
              RX
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Revoxi AI</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-500 text-[10px]">Powered by Groq · LLaMA 3.3</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
          {/* Welcome */}
          <div className="flex gap-2 items-start">
            <div className="w-6 h-6 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs shrink-0 mt-0.5">R</div>
            <div className="bg-navy-700 border border-navy-600 rounded-xl rounded-tl-sm px-3 py-2 text-sm text-slate-300 leading-relaxed max-w-[85%] chat-bubble-text">
              Hi! I'm Revoxi, your Indian Political Governance assistant. Ask me anything about party performance, sector scores, or sentiment trends!
            </div>
          </div>

          {history.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2 items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {m.role !== 'user' && (
                <div className="w-6 h-6 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs shrink-0 mt-0.5">R</div>
              )}
              <div
                className={`rounded-xl px-3 py-2 text-sm leading-relaxed max-w-[85%] chat-bubble-text ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-navy-700 border border-navy-600 text-slate-300 rounded-tl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400 text-xs shrink-0 mt-0.5">R</div>
              <div className="bg-navy-700 border border-navy-600 rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-navy-600 flex gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about parties, sectors, years…"
            className="flex-1 bg-navy-900 border border-navy-600 text-slate-200 placeholder-slate-600 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
          />
          <button
            onClick={send}
            disabled={busy}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
