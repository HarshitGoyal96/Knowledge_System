import re
from collections import Counter

STOPWORDS = set(["the","is","in","and","to","to","from","of","for","a","an","on","with","by","this","that","it"])

def normalize_text(text):
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
    text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)

    return text.lower().strip()

def extract_keywords(text , top_n = 10):
    text = normalize_text(text)
    words = text.split()
    words = [
        w for w in words
        if w not in STOPWORDS and len(w) > 3
    ]
    freq = Counter(words)
    max_freq = max(freq.values()) if freq else 1

    scored_words = {
        word: count / max_freq
        for word, count in freq.items()
    }
    sorted_words = sorted(
        scored_words.items(),
        key=lambda x: x[1],
        reverse=True
    )
    keywords = [word for word, _ in sorted_words[:top_n]]
    return keywords

def extract_summary(text):
    sentences = re.split(r'[.!?]',text)
    
    for sent in sentences:
        if len(sent.strip())>5:
            return sent.strip()
    return text.strip()

def highlight_words(text , keywords):
    for word in keywords:
        text   = re.sub(rf"\b({word})\b", r"**\1**", text, flags=re.IGNORECASE)
    return text

def analyze_large_text(text):
    chunks = text.split("\n")
    all_keywords = []

    for chunk in chunks:
        if len(chunk.strip()) == 0:
            continue
        keywords = extract_keywords(chunk)
        all_keywords.extend(keywords)

    return list(set(all_keywords))