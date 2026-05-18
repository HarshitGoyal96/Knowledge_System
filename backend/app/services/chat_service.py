from groq import Groq
from app.services.semantic_service import search_chunks
from app.services.vector_service import (
    search_chunks
)
from dotenv import load_dotenv
import os
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(query, text):

    results = search_chunks(query)

    # HANDLE CHROMADB RESULTS

    context_parts = []

    for item in results:

        # IF ITEM IS DICTIONARY

        if isinstance(item, dict):

            text_chunk = item.get(
                "text",
                ""
            )

            metadata = item.get(
                "metadata",
                {}
            )

            source = metadata.get(
                "source",
                "Unknown PDF"
            )

        # IF ITEM IS STRING

        else:

            text_chunk = str(item)

            source = "Uploaded PDF"

        context_parts.append(

            f"Source: {source}\n{text_chunk}"

        )

    context = "\n".join(
        context_parts
    )

    print("Context:", context)

    prompt = f"""
You are an intelligent AI study assistant.

Answer the question using the provided document context.

Context:
{context}

Question:
{query}

Rules:
- Answer clearly
- Keep response concise
- Use simple language
- If answer is unavailable, say so
"""

    response = client.chat.completions.create(

        model="llama-3.1-8b-instant",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        stream=True

    )

    for chunk in response:

        content = chunk.choices[0].delta.content

        if content:

            yield content



def explain_topic(topic, text):

    results = search_chunks(topic)

    context = "\n".join(results)
    

    prompt = f"""
You are an AI concept explainer.

Explain the topic briefly using ONLY the context.

Rules:
- Maximum 2 sentences
- Under 30 words
- Ignore unrelated text
- No extra details
- No formatting

Topic:
{topic}

Context:
{context}

Explanation:
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        stream = True
    )

    for chunk in response:

        content = chunk.choices[0].delta.content

        if content:

            yield content