import chromadb
import uuid
import re

from sentence_transformers import SentenceTransformer

# EMBEDDING MODEL

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# CHROMADB CLIENT

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="pdf_memory"
)

# CLEAN TEXT

def clean_chunk(text):

    text = re.sub(
        r'[^a-zA-Z0-9\\s.,:]',
        ' ',
        text
    )

    text = re.sub(
        r'\\s+',
        ' ',
        text
    )

    return text.lower().strip()

# SPLIT TEXT

def split_text(text, chunk_size=120):

    words = text.split()

    chunks = []

    for i in range(
        0,
        len(words),
        chunk_size
    ):

        chunk = " ".join(
            words[i:i + chunk_size]
        )

        chunk = clean_chunk(chunk)

        if len(chunk) > 40:

            chunks.append(chunk)

    return chunks

# STORE PDF CHUNKS

def store_pdf_chunks(
    text,
    filename
):

    chunks = split_text(text)

    embeddings = model.encode(
        chunks
    ).tolist()

    for chunk, embedding in zip(
        chunks,
        embeddings
    ):

        collection.add(

            documents=[chunk],

            embeddings=[embedding],

            ids=[str(uuid.uuid4())],

            metadatas=[
                {
                    "source":  str(filename)
                }
            ]

        )

# SEARCH CHUNKS

def search_chunks(
    query,
    top_k=4
):

    query_embedding = model.encode(
        query
    ).tolist()

    results = collection.query(

        query_embeddings=[
            query_embedding
        ],

        n_results=top_k

    )

    documents = results["documents"][0]

    metadatas = results["metadatas"][0]

    formatted_results = []

    for i in range(len(documents)):

        doc = documents[i]

        meta = metadatas[i]

        # SAFETY FIX

        if isinstance(meta, str):

            meta = {
                "source": meta
            }

        formatted_results.append({

            "text": doc,

            "metadata": meta

        })

    return formatted_results