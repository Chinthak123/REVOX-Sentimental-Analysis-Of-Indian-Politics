"""
Indian Political Sentiment Analyzer — FastAPI Backend
Run: python app.py
Opens: http://localhost:5000
"""

import os
import pickle
import pandas as pd
import numpy as np
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from groq import Groq

load_dotenv()  # loads variables from .env into os.environ

# ── Chatbot config ─────────────────────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL   = "llama-3.3-70b-versatile"          # ← Change model if needed

SYSTEM_PROMPT = """You are Revoxi, a specialized AI assistant built for domain-restricted knowledge.

You are ONLY allowed to answer questions related to:
- Indian Politics (Indian Constitution, political parties, governance, public policies, elections, ministries, political history of India)
- Education systems
- Academic structures
- Transportation systems
- Healthcare systems (primarily India-focused)

If the user asks anything outside these domains:
Reply strictly with:
"I am Revox, and I am designed to answer only Indian politics and selected public knowledge topics."

If the user asks:
- Who created you?
Reply exactly:
"I was created by Chinthakdivan."

Never:
- Provide coding help
- Discuss entertainment
- Discuss foreign politics unless directly connected to India
- Give personal opinions
- Generate political bias
- Provide harmful or illegal instructions

Maintain:
- Neutral tone
- Fact-based answers
- Clear and concise explanations
- No speculation

If uncertain:
Say:
"I am not fully certain about that information."
Communication Style:
- Formal and structured
- Uses bullet points when helpful
- Avoid slang
- No emojis"""

# ── NLTK VADER setup ─────────────────────────────────────────────────────────
import nltk

def _ensure_vader():
    try:
        nltk.data.find("sentiment/vader_lexicon.zip")
    except LookupError:
        nltk.download("vader_lexicon", quiet=True)

_ensure_vader()
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "indian_politics_sentiment_dataset.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "sentiment_pipeline.pkl")

# ── Auto-train if model not found ─────────────────────────────────────────────
def _load_or_train_model():
    if not os.path.exists(MODEL_PATH):
        print("Model not found — training now...")
        from train_model import train_and_save
        return train_and_save(verbose=False)
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

# ── Global state ──────────────────────────────────────────────────────────────
df        = pd.read_csv(DATA_PATH)
pipeline  = _load_or_train_model()
vader     = SentimentIntensityAnalyzer()
YEARS     = sorted(df["year"].unique().tolist())

SECTOR_COLS = {
    "Administration":   "administration_score",
    "Education":        "education_score",
    "Employment":       "employment_score",
    "Health":           "health_score",
    "Public Transport": "public_transport_score",
}

print(f"Dataset loaded: {len(df)} records | Years: {YEARS[0]}–{YEARS[-1]}")
print("Model ready.")
print("Open: http://localhost:5000")

# ── FastAPI app ───────────────────────────────────────────────────────────────
STATIC_DIR  = os.path.join(BASE_DIR, "static")
app         = FastAPI(title="Indian Political Sentiment Analyzer")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY != "your-groq-api-key-here" else None


# ── Pydantic request models ───────────────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]


# ── Helpers ───────────────────────────────────────────────────────────────────
def _vader_label(compound: float) -> str:
    if compound >= 0.05:
        return "Positive"
    if compound <= -0.05:
        return "Negative"
    return "Neutral"


def _enrich_row(row: pd.Series) -> dict:
    text = str(row["governance_review"])

    # ML prediction
    proba    = pipeline.predict_proba([text])[0]
    classes  = pipeline.classes_
    ml_pred  = classes[int(np.argmax(proba))]
    ml_conf  = float(np.max(proba))
    ml_probs = {c: round(float(p), 4) for c, p in zip(classes, proba)}

    # VADER
    vs      = vader.polarity_scores(text)
    v_label = _vader_label(vs["compound"])

    scores = {name: round(float(row[col]), 2) for name, col in SECTOR_COLS.items()}

    return {
        "party":            row["party"],
        "state":            row["state"],
        "review":           text,
        "actual_label":     row["sentiment_label"],
        "ml_prediction":    ml_pred,
        "ml_confidence":    round(ml_conf, 4),
        "ml_probabilities": ml_probs,
        "vader_compound":   round(vs["compound"], 4),
        "vader_label":      v_label,
        "vader_pos":        round(vs["pos"], 4),
        "vader_neu":        round(vs["neu"], 4),
        "vader_neg":        round(vs["neg"], 4),
        "scores":           scores,
        "overall":          round(float(row["overall_sentiment_score"]), 2),
    }


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/api/years")
async def years():
    default_year = 2022 if 2022 in YEARS else YEARS[-1]
    return {"years": YEARS, "default_year": default_year}


@app.get("/api/analysis/{year}")
async def analysis(year: int):
    subset = df[df["year"] == year].copy()
    if subset.empty:
        raise HTTPException(status_code=404, detail=f"No data for year {year}")

    parties_data = [_enrich_row(row) for _, row in subset.iterrows()]

    # Sector leaders
    sectors = []
    for sector_name, col in SECTOR_COLS.items():
        ranked = subset.sort_values(col, ascending=False)
        rankings = [
            {"party": r["party"], "state": r["state"], "score": round(float(r[col]), 2)}
            for _, r in ranked.iterrows()
        ]
        best = ranked.iloc[0]
        sectors.append({
            "sector":     sector_name,
            "best_party": best["party"],
            "best_score": round(float(best[col]), 2),
            "best_state": best["state"],
            "rankings":   rankings,
        })

    # Overall champion
    best_row = subset.loc[subset["overall_sentiment_score"].idxmax()]
    best_overall = {
        "party":  best_row["party"],
        "state":  best_row["state"],
        "score":  round(float(best_row["overall_sentiment_score"]), 2),
        "review": str(best_row["governance_review"]),
    }

    return {
        "year":         year,
        "count":        len(subset),
        "sectors":      sectors,
        "best_overall": best_overall,
        "parties":      parties_data,
    }


@app.post("/api/predict")
async def predict(body: PredictRequest):
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    proba    = pipeline.predict_proba([text])[0]
    classes  = pipeline.classes_
    ml_pred  = classes[int(np.argmax(proba))]
    ml_conf  = float(np.max(proba))
    ml_probs = {c: round(float(p), 4) for c, p in zip(classes, proba)}

    vs      = vader.polarity_scores(text)
    v_label = _vader_label(vs["compound"])

    return {
        "text":             text,
        "ml_prediction":    ml_pred,
        "ml_confidence":    round(ml_conf, 4),
        "ml_probabilities": ml_probs,
        "vader_compound":   round(vs["compound"], 4),
        "vader_label":      v_label,
        "vader_pos":        round(vs["pos"], 4),
        "vader_neu":        round(vs["neu"], 4),
        "vader_neg":        round(vs["neg"], 4),
    }


@app.post("/api/chat")
async def chat(body: ChatRequest):
    if not groq_client:
        raise HTTPException(
            status_code=503,
            detail="Groq API key not configured. Set GROQ_API_KEY in app.py.",
        )
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    response = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        max_tokens=1024,
        temperature=0.7,
    )
    return {"reply": response.choices[0].message.content}


# ── Serve React SPA (must be last) ───────────────────────────────────────────
if os.path.isdir(STATIC_DIR):
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
else:
    @app.get("/")
    async def spa_fallback():
        return {"message": "Run 'npm run build' inside the frontend/ folder first."}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
