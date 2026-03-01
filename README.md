# Indian Political Sentiment Analyzer

A full-stack web application that uses **Natural Language Processing (NLP)**, **Machine Learning (ML)**, and a **Groq-powered AI chatbot** to analyze governance sentiment of Indian political parties across years and sectors.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Dataset](#2-dataset)
3. [NLP Concepts Used](#3-nlp-concepts-used)
   - [TF-IDF Vectorization](#31-tf-idf-vectorization)
   - [Logistic Regression Classifier](#32-logistic-regression-classifier)
   - [Scikit-learn Pipeline](#33-scikit-learn-pipeline)
   - [NLTK VADER Sentiment Analysis](#34-nltk-vader-sentiment-analysis)
4. [Why Two Models?](#4-why-two-models)
5. [ML Pipeline — How It Works](#5-ml-pipeline--how-it-works)
6. [AI Chatbot — Groq Integration](#6-ai-chatbot--groq-integration)
   - [What is Groq?](#61-what-is-groq)
   - [How the Chatbot Works](#62-how-the-chatbot-works)
   - [System Prompt](#63-system-prompt)
   - [Conversation History](#64-conversation-history)
   - [Configuration](#65-configuration)
7. [Backend — FastAPI](#7-backend--fastapi)
8. [Frontend — React](#8-frontend--react)
   - [Why React?](#81-why-react)
   - [Component Architecture](#82-component-architecture)
   - [Build & Serve Flow](#83-build--serve-flow)
   - [UI Sections](#84-ui-sections)
9. [Project Structure](#9-project-structure)
10. [How to Run](#10-how-to-run)
11. [API Reference](#11-api-reference)
12. [Concepts Glossary](#12-concepts-glossary)

---

## 1. Project Overview

This project answers the question:

> *"Based on governance reviews, which political party performed best in each sector for a given year — and what does NLP say about their sentiment?"*

**What it does:**
- Loads a hand-crafted dataset of 73 governance records (2005–2023) covering 22+ Indian political parties
- Trains a **TF-IDF + Logistic Regression** ML model on governance review text
- Uses **VADER** (rule-based NLP) as a secondary sentiment analyzer
- Serves a **FastAPI web app** with a dark-themed interactive dashboard
- Shows sector winners, rankings, charts, and live text prediction
- Provides a floating **AI chatbot** powered by Groq (LLaMA 3.3) for conversational insights

---

## 2. Dataset

**File:** `indian_politics_sentiment_dataset.csv`

| Column | Type | Description |
|--------|------|-------------|
| `party` | string | Political party (BJP, INC, AAP, TMC, …) |
| `state` | string | State name or "National (Central)" |
| `year` | int | Reference year (2005–2023) |
| `region_type` | string | State / National / UT |
| `administration_score` | float 1–10 | Governance & law-order rating |
| `education_score` | float 1–10 | Education policy rating |
| `employment_score` | float 1–10 | Jobs & livelihood rating |
| `health_score` | float 1–10 | Healthcare rating |
| `public_transport_score` | float 1–10 | Transport infrastructure rating |
| `overall_sentiment_score` | float 1–10 | Weighted average of all sectors |
| `sentiment_label` | string | Positive / Neutral / Negative |
| `governance_review` | string | Short free-text review (NLP input) |

**Sentiment thresholds:**

```
overall_score >= 6.5  →  Positive
5.5 <= score < 6.5    →  Neutral
score < 5.5           →  Negative
```

**Label distribution:** 37 Positive | 35 Neutral | 1 Negative

**Parties covered:** BJP, INC, AAP, TMC, SP, BSP, DMK, AIADMK, TRS/BRS, YSR Congress, TDP, NCP, Shiv Sena, JDU, RJD, LDF, UDF, SAD, JMM, SKM, NC, PDP

---

## 3. NLP Concepts Used

### 3.1 TF-IDF Vectorization

**TF-IDF** stands for **Term Frequency – Inverse Document Frequency**. It converts raw text into a numerical matrix that ML models can understand.

#### Term Frequency (TF)
How often a word appears in a single document (review), relative to the document length.

```
TF(word, doc) = count of word in doc / total words in doc
```

#### Inverse Document Frequency (IDF)
Penalizes words that appear in almost every document (like "the", "and") since they carry little meaning.

```
IDF(word) = log( total documents / documents containing word )
```

#### TF-IDF Score
```
TF-IDF(word, doc) = TF × IDF
```

Words that are **frequent in one review but rare across all reviews** get high scores — they are the most descriptive.

#### Parameters used in this project

```python
TfidfVectorizer(
    max_features  = 500,        # Keep only top 500 most informative words
    ngram_range   = (1, 2),     # Use single words AND word pairs (bigrams)
    stop_words    = 'english',  # Remove common filler words (the, is, are…)
    sublinear_tf  = True,       # Use log(TF) to reduce impact of very frequent words
)
```

**Why bigrams?** Phrases like "law order" or "poor infrastructure" carry more meaning together than as individual words. With `ngram_range=(1,2)`, both unigrams and bigrams are included.

**Why `sublinear_tf`?** A word appearing 10 times isn't necessarily 10× more important than one appearing once. Taking `log(TF)` dampens this effect.

---

### 3.2 Logistic Regression Classifier

Despite its name, Logistic Regression is a **classification** algorithm, not regression.

#### How it works
1. Computes a **weighted sum** of input features (TF-IDF scores): `z = w₁x₁ + w₂x₂ + … + wₙxₙ + b`
2. Passes it through the **sigmoid function** (for binary) or **softmax** (for multi-class) to produce a probability between 0 and 1
3. Assigns the class with the **highest probability**

#### Multi-class (this project)
Since we have 3 classes (Positive, Neutral, Negative), it uses **One-vs-Rest (OvR)** — trains one binary classifier per class and picks the winner.

#### Parameters used

```python
LogisticRegression(
    C             = 5.0,        # Inverse regularization strength (higher = less penalty)
    class_weight  = 'balanced', # Compensate for imbalanced labels
    max_iter      = 1000,       # Max optimization iterations
    random_state  = 42,
)
```

**Why `class_weight='balanced'`?**
Our dataset has only **1 Negative** record vs 37 Positive and 35 Neutral. Without balancing, the model would just ignore Negative entirely. `balanced` automatically sets class weights as:

```
weight(class) = total_samples / (num_classes × count_of_class)
```

So Negative gets a much higher weight, forcing the model to pay attention to it.

**What is C?**
`C` controls **regularization** — a penalty on large weights to prevent overfitting. `C=5.0` means moderate regularization (not too strict, not too loose), which works well for small datasets.

---

### 3.3 Scikit-learn Pipeline

A **Pipeline** chains multiple steps into one object, so the same transformation is consistently applied during training and prediction.

```python
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(...)),   # Step 1: text → numbers
    ('clf',   LogisticRegression(...)) # Step 2: numbers → label
])

pipeline.fit(X_train, y_train)         # Trains both steps together
pipeline.predict(["some review text"]) # Vectorizes + predicts in one call
```

**Why Pipeline?**
- Prevents **data leakage** — the vectorizer learns vocabulary only from training data, not test data
- Saved as a **single `.pkl` file** — load once, predict anywhere
- Clean, reproducible workflow

---

### 3.4 NLTK VADER Sentiment Analysis

**VADER** (Valence Aware Dictionary and sEntiment Reasoner) is a **rule-based** sentiment analyzer built specifically for social-media-style short texts. It requires **no training** — it uses a hand-crafted lexicon of ~7,500 words with sentiment scores.

#### How it works
1. Each word in the text is looked up in the VADER lexicon and assigned a valence score (e.g., "excellent" = +3.0, "terrible" = −3.1)
2. Scores are adjusted for:
   - **Capitalization** — "GREAT" > "great"
   - **Punctuation** — "great!!!" > "great"
   - **Negation** — "not good" flips the polarity
   - **Degree modifiers** — "very good" > "good", "barely good" < "good"
3. Outputs four scores:

| Score | Meaning |
|-------|---------|
| `pos` | Proportion of positive sentiment (0–1) |
| `neu` | Proportion of neutral content (0–1) |
| `neg` | Proportion of negative sentiment (0–1) |
| `compound` | Overall score from −1.0 (most negative) to +1.0 (most positive) |

#### Label thresholds used

```python
compound >= 0.05   →  Positive
compound <= -0.05  →  Negative
else               →  Neutral
```

---

## 4. Why Two Models?

| | TF-IDF + Logistic Regression | VADER |
|---|---|---|
| **Type** | Trained ML model | Rule-based lexicon |
| **Needs training data?** | Yes | No |
| **Learns from dataset?** | Yes — adapts to political language | No — generic sentiment |
| **Handles context?** | Partially (via bigrams) | Via modifier rules |
| **Best for** | Domain-specific text | General short text |
| **Weakness** | Small dataset, may generalize poorly | Doesn't understand domain jargon |

Using both provides a **cross-check**. When they agree, confidence is high. When they disagree, it signals ambiguous language — useful insight in itself.

---

## 5. ML Pipeline — How It Works

```
Raw Text (governance_review)
        │
        ▼
┌───────────────────────────────────┐
│  TfidfVectorizer                  │
│  "Excellent roads, poor jobs"     │
│   → [0.0, 0.82, 0.0, 0.61, ...]  │  ← 500-dim sparse vector
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  LogisticRegression               │
│  z = w·x + b                      │
│  softmax([z_pos, z_neu, z_neg])   │
│   → {Positive: 0.72,              │
│      Neutral:  0.25,              │
│      Negative: 0.03}              │
└───────────────────────────────────┘
        │
        ▼
    Predicted Label: "Positive"
    Confidence: 72%
```

**Training flow:**
1. Load CSV → extract `governance_review` (X) and `sentiment_label` (y)
2. `pipeline.fit(X, y)` — vectorizer learns vocabulary, LR learns weights
3. Save to `model/sentiment_pipeline.pkl` via `pickle`
4. On startup, `app.py` checks if `.pkl` exists — trains automatically if not

---

## 6. AI Chatbot — Groq Integration

### 6.1 What is Groq?

**Groq** is an AI inference platform that runs open-source large language models (LLMs) at very high speed using custom **LPU (Language Processing Unit)** hardware. It provides an OpenAI-compatible API, making it easy to integrate into Python apps.

- **Speed**: Groq serves tokens significantly faster than most cloud LLM APIs
- **Free tier**: Groq offers a generous free tier at [console.groq.com](https://console.groq.com)
- **Models available**: LLaMA 3.3, Mixtral, Gemma, and more

This project uses **`llama-3.3-70b-versatile`** — Meta's LLaMA 3.3 70-billion parameter model, capable of nuanced reasoning about governance and politics.

---

### 6.2 How the Chatbot Works

```
User types message in chat widget
        │
        ▼
Frontend appends message to chatHistory[]
        │
        ▼
POST /api/chat  ←  { messages: [{role, content}, ...] }
        │
        ▼
Backend prepends SYSTEM_PROMPT to messages
        │
        ▼
Groq API (LLaMA 3.3 70B)
        │
        ▼
{ reply: "..." }  →  Frontend displays in chat bubble
        │
        ▼
Assistant reply appended to chatHistory[]
        (full history sent on every turn → multi-turn memory)
```

The full conversation history is sent with every request, giving the model **multi-turn memory** — it remembers everything said earlier in the session.

---

### 6.3 System Prompt

The system prompt is defined in `app.py` as `SYSTEM_PROMPT`. It instructs the model to act as a political governance expert with knowledge of:
- All 22+ parties and their states covered in the dataset
- 5 sector scores and their meaning
- Sentiment scoring thresholds (Positive ≥ 6.5, Neutral 5.5–6.5, Negative < 5.5)
- Both ML (TF-IDF + LR) and rule-based (VADER) sentiment analysis

**To customise it**, edit the `SYSTEM_PROMPT` string near the top of `app.py`:

```python
SYSTEM_PROMPT = """You are a knowledgeable assistant specializing in Indian political
governance and sentiment analysis..."""
```

---

### 6.4 Conversation History

Each chat message is tracked in a JavaScript array on the frontend:

```javascript
chatHistory = [
  { role: "user",      content: "Which party scored best in 2022?" },
  { role: "assistant", content: "AAP (Delhi) scored highest overall at 8.3..." },
  { role: "user",      content: "What about health specifically?" },
  // ...
]
```

The entire history is sent on every API call so the model can refer back to earlier context. This is the standard **multi-turn chat** pattern used by all modern LLM APIs.

**Guard:** If `GROQ_API_KEY` is still the placeholder string, the `/api/chat` endpoint returns `503 Service Unavailable` with a clear message instead of crashing.

---

### 6.5 Configuration

Open `app.py` and set these three variables near the top:

```python
GROQ_API_KEY = "gsk_xxxxxxxxxxxxxxxxxxxx"   # ← Your Groq API key
GROQ_MODEL   = "llama-3.3-70b-versatile"    # ← Model to use
SYSTEM_PROMPT = """..."""                    # ← Bot personality & knowledge
```

**Available Groq models** (as of 2025):

| Model | Best for |
|-------|---------|
| `llama-3.3-70b-versatile` | Best quality, default choice |
| `llama-3.1-8b-instant` | Fastest, lower cost |
| `mixtral-8x7b-32768` | Long context windows |
| `gemma2-9b-it` | Lightweight, efficient |

---

## 7. Backend — FastAPI

**FastAPI** is a modern, high-performance Python web framework built on **Starlette** and **Pydantic**. It is fully async and auto-generates interactive API documentation.

### Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Serves the built React SPA (`static/index.html`) |
| `/api/years` | GET | Returns available years list + default year |
| `/api/analysis/{year}` | GET | Full JSON analysis for a selected year |
| `/api/predict` | POST | `{"text":"..."}` → ML + VADER prediction |
| `/api/chat` | POST | `{"messages":[...]}` → Groq LLM reply |
| `/docs` | GET | Auto-generated Swagger UI (try endpoints live) |
| `/redoc` | GET | Auto-generated ReDoc documentation |

The built React files in `static/` are mounted as `StaticFiles` — FastAPI serves them directly with no template engine.

### Why FastAPI over Flask?

| Feature | Flask | FastAPI |
|---------|-------|---------|
| Performance | Sync (WSGI) | Async (ASGI) |
| Request validation | Manual | Automatic via Pydantic |
| API docs | None built-in | Swagger + ReDoc auto-generated |
| Type hints | Optional | First-class |
| Error handling | `return jsonify(), 404` | `raise HTTPException(404)` |

---

## 8. Frontend — React

The frontend was migrated from a single monolithic Jinja2 HTML template to a proper **React 18** application bundled with **Vite**.

### 8.1 Why React?

| | Old (Jinja2 HTML) | New (React + Vite) |
|---|---|---|
| **Structure** | One 670-line HTML file | 11 focused components |
| **State management** | Global JS vars | `useState` / `useEffect` hooks |
| **Re-renders** | Manual DOM manipulation | Automatic, declarative |
| **Charts** | Chart.js via CDN | `react-chartjs-2` (proper lifecycle) |
| **Build** | None (loaded in browser) | Vite — optimised, tree-shaken bundle |
| **Dev experience** | Edit & hard refresh | Hot Module Replacement (HMR) |

---

### 8.2 Component Architecture

```
App.jsx  (root — owns year state, fetches /api/analysis/{year})
│
├── Navbar.jsx            ← Header with tech stack badges
├── YearSelector.jsx      ← Controlled <select> + ← → arrow buttons
├── StatsBar.jsx          ← 4 summary stat chips
├── SectorCards.jsx       ← 5 sector winner cards (Admin/Edu/Emp/Health/Transport)
├── ChampionBanner.jsx    ← Overall champion highlight with review quote
├── PerformanceCharts.jsx ← Bar chart (top 6 parties) + Radar chart (party selector)
│                            uses react-chartjs-2 with Chart.js v4
├── RankingsTable.jsx     ← Full sortable table with inline mini-bars + sentiment pills
├── LivePredictor.jsx     ← Textarea → POST /api/predict → ML + VADER result
├── NLPCards.jsx          ← Grid of per-party NLP analysis cards with confidence bars
└── ChatBot.jsx           ← Floating 💬 widget → POST /api/chat → Groq reply
```

**Data flow:**
```
App fetches /api/years on mount → sets year state
        │
        ▼ (year changes)
App fetches /api/analysis/{year} → passes data as props to all child components
        │
        ├── All display components re-render with new data
        └── LivePredictor & ChatBot manage their own local state independently
```

**Key React patterns used:**
- `useState` — year selection, API responses, loading/error flags, chat history
- `useEffect` — data fetching triggered by year changes, scroll-to-bottom in chat
- `useRef` — scroll anchor for chat messages
- Controlled components — `<select>`, `<textarea>` bound to state
- Prop drilling — `App` fetches once, passes data down to children

---

### 8.3 Build & Serve Flow

```
frontend/src/          (React source — JSX, CSS)
        │
        ▼  npm run build  (Vite)
static/                (production bundle — served by FastAPI)
├── index.html         ← entry point
└── assets/
    ├── index-*.js     ← minified JS (React + Chart.js + app logic)
    └── index-*.css    ← extracted + minified CSS
```

- Vite compiles JSX → JS, bundles dependencies, minifies everything
- FastAPI mounts `static/` as `StaticFiles(html=True)` — serves `index.html` for `/`
- All `/api/*` requests are handled by FastAPI routes before the static mount

**Development mode** (hot reload):
```bash
# Terminal 1
python app.py           # FastAPI on :5000

# Terminal 2
cd frontend
npm run dev             # Vite dev server on :5173, proxies /api → :5000
```

---

### 8.4 UI Sections

| Section | Component | Description |
|---------|-----------|-------------|
| Navbar | `Navbar.jsx` | Title + tech stack badges |
| Year Selector | `YearSelector.jsx` | Dropdown + ← → arrows; triggers data fetch |
| Stats Bar | `StatsBar.jsx` | Entry count, champion party, top score, positive count |
| Sector Leader Cards | `SectorCards.jsx` | 5 cards — trophy, party, state, score per sector |
| Champion Banner | `ChampionBanner.jsx` | Gold border card with overall winner + review quote |
| Bar Chart | `PerformanceCharts.jsx` | Grouped bars — top 6 parties × 5 sectors |
| Radar Chart | `PerformanceCharts.jsx` | 5-sector pentagon for selected party |
| Rankings Table | `RankingsTable.jsx` | All parties sorted by score, with ML + VADER pills |
| Live Predictor | `LivePredictor.jsx` | Free text → ML prediction + VADER + probability bars |
| NLP Cards | `NLPCards.jsx` | Per-party card with review text + confidence bars |
| AI Chatbot | `ChatBot.jsx` | Floating 💬 → slide-in panel → Groq LLaMA 3.3 |

**Color theme:**
```
Background:  #0a0f1e  (deep navy)
Card:        #1a2238
Accent:      #FF9933  (saffron — Indian flag)
Text:        #e8f0fe
Positive:    #2ECC71 (green)
Neutral:     #F1C40F (amber)
Negative:    #E74C3C (red)
```

---

## 9. Project Structure

```
Political sentimental analysis/
│
├── README.md                        ← You are here
├── CLAUDE.md                        ← AI assistant context file
├── requirements.txt                 ← Python deps (fastapi, uvicorn, sklearn, groq…)
│
├── app.py                           ← FastAPI backend
│                                      ↳ GROQ_API_KEY   ← set your key here
│                                      ↳ GROQ_MODEL     ← change model here
│                                      ↳ SYSTEM_PROMPT  ← edit bot personality
├── train_model.py                   ← Standalone ML training + evaluation
│
├── indian_politics_sentiment_dataset.csv  ← Dataset (73 records)
├── dataset_info.txt                 ← Column descriptions
│
├── model/
│   └── sentiment_pipeline.pkl       ← TF-IDF + LR pipeline (auto-generated)
│
├── frontend/                        ← React source (Vite)
│   ├── package.json                 ← npm deps: react, chart.js, react-chartjs-2
│   ├── vite.config.js               ← Build → ../static/ | dev proxy /api → :5000
│   ├── index.html                   ← Vite HTML entry point
│   └── src/
│       ├── main.jsx                 ← ReactDOM.createRoot
│       ├── App.jsx                  ← Root component — state, data fetching
│       ├── App.css                  ← Global styles (dark saffron theme)
│       ├── utils.js                 ← getPartyColor, SECTOR_KEYS, sentClass
│       └── components/
│           ├── Navbar.jsx
│           ├── YearSelector.jsx
│           ├── StatsBar.jsx
│           ├── SectorCards.jsx
│           ├── ChampionBanner.jsx
│           ├── PerformanceCharts.jsx  ← Bar + Radar via react-chartjs-2
│           ├── RankingsTable.jsx
│           ├── LivePredictor.jsx
│           ├── NLPCards.jsx
│           └── ChatBot.jsx           ← Groq floating chat widget
│
└── static/                          ← Vite production build (served by FastAPI)
    ├── index.html
    └── assets/
        ├── index-*.js               ← Bundled + minified React app
        └── index-*.css              ← Extracted + minified CSS
```

---

## 10. How to Run

### Production (recommended)

**Step 1 — Install Python dependencies**
```bash
pip install -r requirements.txt
```

**Step 2 — Build the React frontend**
```bash
cd frontend
npm install
npm run build
cd ..
```
This compiles the React app into `static/` which FastAPI serves directly.

**Step 3 — (Optional) Enable the AI chatbot**

Get a free API key from [console.groq.com](https://console.groq.com) → API Keys, then open `app.py` and set:
```python
GROQ_API_KEY = "gsk_xxxxxxxxxxxxxxxxxxxx"
```
> Skip this step to run the dashboard without the chatbot. The `💬` button will still appear but shows a "key not configured" message when used.

**Step 4 — Start the server**
```bash
python app.py
```

The ML model trains automatically on first run (~1 second). You'll see:
```
Dataset loaded: 73 records | Years: 2005–2023
Model ready.
Open: http://localhost:5000
```

**Step 5 — Open browser**

| URL | What you get |
|-----|-------------|
| `http://localhost:5000` | React dashboard |
| `http://localhost:5000/docs` | Swagger UI — test all APIs interactively |
| `http://localhost:5000/redoc` | ReDoc — clean API documentation |

---

### Development (hot reload)

Run the Python API and Vite dev server simultaneously:

```bash
# Terminal 1 — FastAPI backend
python app.py

# Terminal 2 — React dev server (HMR on save)
cd frontend
npm run dev
```

Open **http://localhost:5173** — Vite proxies all `/api/*` requests to FastAPI on `:5000`. Changes to React components appear instantly without a page reload.

After making frontend changes, rebuild for production:
```bash
cd frontend && npm run build
```

---

**Optional — Train ML model separately**
```bash
python train_model.py
```
Prints cross-validation accuracy and a full classification report.

---

## 11. API Reference

### `GET /api/years`

```json
{
  "years": [2005, 2007, 2008, 2010, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
  "default_year": 2022
}
```

Called by React on mount to populate the year selector dropdown.

### `GET /api/analysis/{year}`

```json
{
  "year": 2022,
  "count": 26,
  "sectors": [
    {
      "sector": "Administration",
      "best_party": "AAP",
      "best_score": 9.1,
      "best_state": "Delhi",
      "rankings": [{"party": "AAP", "state": "Delhi", "score": 9.1}, "..."]
    }
  ],
  "best_overall": {
    "party": "AAP", "state": "Delhi", "score": 8.3,
    "review": "Excellent governance and public services..."
  },
  "parties": [
    {
      "party": "AAP", "state": "Delhi",
      "actual_label": "Positive",
      "ml_prediction": "Positive", "ml_confidence": 0.91,
      "ml_probabilities": {"Negative": 0.02, "Neutral": 0.07, "Positive": 0.91},
      "vader_compound": 0.72, "vader_label": "Positive",
      "vader_pos": 0.25, "vader_neu": 0.68, "vader_neg": 0.07,
      "scores": {
        "Administration": 9.1, "Education": 9.2,
        "Employment": 7.8, "Health": 8.0, "Public Transport": 8.5
      },
      "overall": 8.3
    }
  ]
}
```

### `POST /api/predict`

**Request:**
```json
{ "text": "Excellent roads and hospitals, great governance" }
```

**Response:**
```json
{
  "ml_prediction": "Positive",
  "ml_confidence": 0.87,
  "ml_probabilities": {"Negative": 0.01, "Neutral": 0.12, "Positive": 0.87},
  "vader_compound": 0.74,
  "vader_label": "Positive",
  "vader_pos": 0.31, "vader_neu": 0.69, "vader_neg": 0.0
}
```

### `POST /api/chat`

**Request:**
```json
{
  "messages": [
    { "role": "user",      "content": "Which party performed best in 2022?" },
    { "role": "assistant", "content": "AAP (Delhi) scored highest overall at 8.3..." },
    { "role": "user",      "content": "What about their health score?" }
  ]
}
```

**Response:**
```json
{
  "reply": "AAP (Delhi) scored 8.0 in Health in 2022, which ranked them among the top performers..."
}
```

**Error (key not set):**
```json
{ "detail": "Groq API key not configured. Set GROQ_API_KEY in app.py." }
```
HTTP status: `503 Service Unavailable`

> The full conversation history is included in every request so the model maintains context across turns. The system prompt is prepended automatically by the backend — the frontend only tracks `user` and `assistant` messages.

---

## 12. Concepts Glossary

| Term | Meaning |
|------|---------|
| **NLP** | Natural Language Processing — making computers understand human text |
| **Sentiment Analysis** | Classifying text as Positive, Neutral, or Negative |
| **TF-IDF** | Numerical text representation based on word frequency and rarity |
| **Vectorization** | Converting text into a list of numbers that ML models can process |
| **Bigram** | A pair of consecutive words treated as a single feature (e.g., "law order") |
| **Logistic Regression** | A classification algorithm that outputs class probabilities via sigmoid/softmax |
| **Regularization** | Penalizing large model weights to prevent overfitting |
| **class_weight='balanced'** | Automatically upweights minority classes to handle label imbalance |
| **Pipeline** | A chained sequence of ML steps (vectorize → classify) treated as one object |
| **Pickle (.pkl)** | Python's binary serialization format for saving/loading trained models |
| **VADER** | Rule-based sentiment analyzer using a hand-crafted lexicon; no training needed |
| **Compound score** | VADER's single overall sentiment score from −1.0 to +1.0 |
| **Cross-validation** | Splitting data into k folds to estimate model accuracy on unseen data |
| **Overfitting** | When a model memorizes training data and fails to generalize |
| **FastAPI** | A modern async Python web framework with automatic Swagger docs |
| **Pydantic** | Python library for data validation using type annotations; used by FastAPI |
| **Uvicorn** | ASGI server that runs FastAPI apps; replaces Flask's built-in dev server |
| **Jinja2** | Templating engine for injecting Python values into HTML files |
| **Chart.js** | A JavaScript library for rendering interactive charts in the browser |
| **REST API** | An HTTP-based interface where each URL endpoint performs a specific action |
| **LLM** | Large Language Model — a deep learning model trained on vast text data to generate human-like responses |
| **Groq** | AI inference platform using LPU hardware for extremely fast LLM responses |
| **LPU** | Language Processing Unit — Groq's custom chip optimised specifically for LLM inference |
| **LLaMA** | Meta's open-source large language model family; LLaMA 3.3 70B is used here |
| **System Prompt** | A hidden instruction given to an LLM before the conversation starts; defines its persona and knowledge |
| **Multi-turn chat** | A conversation pattern where the full message history is sent on every API call so the model remembers earlier context |
| **Inference** | Running a trained model on new input to get a prediction or response (as opposed to training) |
| **Token** | The basic unit an LLM processes — roughly ¾ of a word; LLMs are billed and rate-limited per token |
| **React** | A JavaScript UI library that builds interfaces from reusable components with declarative state |
| **JSX** | JavaScript syntax extension that looks like HTML; compiled to `React.createElement()` calls by Vite |
| **Component** | A self-contained React function that returns UI; receives props, manages its own state |
| **useState** | React hook for declaring reactive state variables inside a component |
| **useEffect** | React hook for running side effects (API calls, subscriptions) after renders |
| **Props** | Data passed from a parent component to a child; read-only in the child |
| **Vite** | A fast frontend build tool using native ES modules in dev and Rollup for production builds |
| **HMR** | Hot Module Replacement — Vite updates changed components in the browser without a full page reload |
| **Bundle** | The single optimised JS file Vite produces containing all app code and dependencies |
| **StaticFiles** | FastAPI middleware that serves a directory of files (HTML, JS, CSS) directly over HTTP |
| **npm** | Node Package Manager — installs and manages JavaScript dependencies listed in `package.json` |
