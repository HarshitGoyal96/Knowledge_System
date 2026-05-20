import chromadb
import uuid
import re

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="pdf_memory"
)

# CLEAN TEXT

def clean_chunk(text):

    text = re.sub(

        r'[^\w\s.,:!?()-]',

        ' ',

        text

    )

    text = re.sub(

        r'\s+',

        ' ',

        text

    )

    return text.strip()

# SPLIT TEXT

def split_text(
    text,
    chunk_size=400
):

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

# STORE CHUNKS

def store_pdf_chunks(
    text,
    filename
):

    chunks = split_text(text)

    for chunk in chunks:

        collection.add(

            documents=[chunk],

            ids=[str(uuid.uuid4())],

            metadatas=[
                {
                    "source": str(filename)
                }
            ]

        )

# SEMANTIC SEARCH

def search_chunks(
    query,
    top_k=5
):

    results = collection.query(

        query_texts=[query],

        n_results=top_k

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

        formatted_results.append({

            "text": doc,

            "metadata": meta,

            "distance": distance

        })

    return formatted_results

# GET ALL DOCS

def get_all_documents():

    results = collection.get()

    documents = results["documents"]

    return "\n".join(documents)

# RESET COLLECTION

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