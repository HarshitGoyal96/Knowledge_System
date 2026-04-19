from sentence_transformers import SentenceTransformer
import numpy as np
import re

model = SentenceTransformer('all-MiniLM-L6-v2')

def clean_chunk(text):
    text = re.sub(r'[^a-zA-Z0-9\s.,:]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.lower().strip()


def preprocess_text(text):
    lines = text.split("\n")

    clean_lines = []

    for line in lines:
        line = line.strip()

        if len(line.split()) < 4:  # relaxed filter
            continue

        clean_lines.append(line)

    return " ".join(clean_lines)


def split_text(text, chunk_size=40):
    words = text.split()

    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        chunk = clean_chunk(chunk)

        if len(chunk) > 30:
            chunks.append(chunk)

    return chunks


def semantic_search(query, text, top_k=3):

    query = clean_chunk(query)

    text = preprocess_text(text)

    chunks = split_text(text)

    if not chunks:
        return []


    query_embedding = model.encode(query, normalize_embeddings=True)
    chunk_embeddings = model.encode(chunks, normalize_embeddings=True)

    similarities = []

    for i, emb in enumerate(chunk_embeddings):
        score = np.dot(query_embedding, emb)
        similarities.append((chunks[i], score))

    similarities.sort(key=lambda x: x[1], reverse=True)

    results = [
        {
            "text": chunk[:180],
            "score": round(float(score), 3)
        }
        for chunk, score in similarities[:top_k]
    ]

    return results