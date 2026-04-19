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
    words = [word for word in words if len(word)>3 and word not in STOPWORDS]
    freq = Counter(words)
    keywords = [word for word, _ in freq.most_common(top_n)]
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