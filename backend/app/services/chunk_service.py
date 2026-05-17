import re

def clean_text(text):

    # remove extra spaces
    text = re.sub(r"\s+", " ", text)

    # remove weird symbols
    text = re.sub(
        r"[^a-zA-Z0-9.,!?()\-:\n ]",
        "",
        text
    )

    return text.strip()

def chunk_text(
    text,
    chunk_size=200,
    overlap=50
):

    text = clean_text(text)

    words = text.split()

    chunks = []

    start = 0

    while start < len(words):

        end = start + chunk_size

        chunk = " ".join(
            words[start:end]
        )

        # avoid tiny junk chunks
        if len(chunk.split()) > 40:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks