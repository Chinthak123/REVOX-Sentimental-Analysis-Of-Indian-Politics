export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-title">
        REVOX <span>Indian Politics Sentiment Analyzer</span>
      </div>
      <div className="badge-group">
        <span className="badge accent">TF-IDF + Logistic Regression</span>
        <span className="badge">VADER NLP</span>
        <span className="badge">Groq · LLaMA 3.3</span>
        <span className="badge">React + FastAPI</span>
      </div>
    </nav>
  )
}
