import chromadb
import uuid
import re


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
        r'[^a-zA-Z0-9\s.,:]',
        ' ',
        text
    )

    text = re.sub(
        r'\s+',
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


# SIMPLE KEYWORD SEARCH

def search_chunks(
    query,
    top_k=5
):

    results = collection.get()

    documents = results["documents"]

    metadatas = results["metadatas"]

    formatted_results = []

    query = query.lower()

    for doc, meta in zip(
        documents,
        metadatas
    ):

        if query in doc.lower():

            formatted_results.append({

                "text": doc,

                "metadata": meta,

                "distance": 0

            })

    return formatted_results[:top_k]


# GET ALL DOCS

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