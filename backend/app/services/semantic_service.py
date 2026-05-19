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
    path="chroma_db"
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

def split_text(text, chunk_size=300):

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

        if len(chunk.split()) > 40:

            chunks.append(chunk)

    return chunks

# STORE PDF CHUNKS

def store_pdf_chunks(
    text,
    filename
):

    chunks = split_text(text)

    embeddings = model.encode(
        chunks,
        normalize_embeddings=True
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
    top_k=5
):

    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    ).tolist()

    results = collection.query(

        query_embeddings=[
            query_embedding
        ],

        n_results=top_k,

        include=[
            "documents",
            "metadatas",
            "distances"
        ]

    )

    documents = results["documents"][0]

    metadatas = results["metadatas"][0]

    distances = results["distances"][0]

    formatted_results = []

    for doc, meta, distance in zip(
        documents,
        metadatas,
        distances
    ):

        # IGNORE WEAK RESULTS

        if distance > 2:           
            continue

        formatted_results.append({

            "text": doc,

            "metadata": meta,

            "distance": distance

        })

    print("SEARCH RESULTS:")
    print(formatted_results)

    return formatted_results


def get_all_documents():
    

    results = collection.get()

    documents = results["documents"]

    return "\n".join(documents)
def get_relevant_documents(
    top_k=20
):

    results = collection.get()

    documents = results["documents"]

    return "\n".join(
        documents[:top_k]
    )
def reset_collection():

    global collection

    try:

        existing = collection.get()

        if existing["ids"]:

            collection.delete(
                ids=existing["ids"]
            )

    except Exception as e:

        print("RESET ERROR:", e)