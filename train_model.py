"""
Standalone training script for Indian Political Sentiment Analyzer.
Run: python train_model.py
Saves model to: model/sentiment_pipeline.pkl
"""

import os
import pickle
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.metrics import classification_report

DATA_PATH = "indian_politics_sentiment_dataset.csv"
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "sentiment_pipeline.pkl")


def train_and_save(verbose=True):
    df = pd.read_csv(DATA_PATH)
    if verbose:
        print(f"Dataset loaded: {len(df)} records")
        print("Label distribution:\n", df["sentiment_label"].value_counts())

    X = df["governance_review"].astype(str)
    y = df["sentiment_label"]

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=500,
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True,
        )),
        ("clf", LogisticRegression(
            C=5.0,
            class_weight="balanced",
            max_iter=1000,
            random_state=42,
        )),
    ])

    if verbose:
        scores = cross_val_score(pipeline, X, y, cv=3, scoring="accuracy")
        print(f"CV Accuracy: {scores.mean():.3f} ± {scores.std():.3f}")

    pipeline.fit(X, y)

    if verbose:
        preds = pipeline.predict(X)
        print("\nTraining report:")
        print(classification_report(y, preds))

    os.makedirs(MODEL_DIR, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)

    if verbose:
        print(f"\nModel saved to: {MODEL_PATH}")

    return pipeline


if __name__ == "__main__":
    train_and_save(verbose=True)
