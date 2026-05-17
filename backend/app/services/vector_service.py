import chromadb

from sentence_transformers import (
    SentenceTransformer
)

# EMBEDDING MODEL

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

# CHROMA DATABASE

client = chromadb.PersistentClient(
    path="./chroma_db"
)

collection = client.get_or_create_collection(
    name="study_material"
)

# STORE CHUNKS

def store_chunks(chunks):

    # clear old data first

    try:
        existing =collection.get()

        if existing["ids"]:
            collection.delete(
                ids=existing["ids"]
            )

    except:
        pass

    for i, chunk in enumerate(chunks):

        embedding =embedding_model.encode(
                chunk
            ).tolist()

        collection.add(
            ids=[str(i)],
            documents=[chunk],
            embeddings=[embedding]
        )

# SEARCH CHUNKS

def search_chunks(query, n_results=3):

    query_embedding =embedding_model.encode(
            query
        ).tolist()

    results =collection.query(
            query_embeddings=[
                query_embedding
            ],
            n_results=n_results
        )

    return results["documents"][0]