from groq import Groq
from app.services.semantic_service import semantic_search

from dotenv import load_dotenv
import os
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_answer(query, text):
    results = semantic_search(query, text)
    context = "\n".join([r["text"] for r in results])
    print("Context:", context)
    prompt = f"""
You are an intelligent document assistant.

Your task is to answer the question using the given context.

Guidelines:
- Understand the type of document (resume, article, notes, etc.)
- Extract relevant information accordingly
- If asked about skills → list skills
- If asked for summary → summarize
- If asked about concepts → explain clearly
- If answer is not directly written → infer from context

Context:
{context}

Question:
{query}

Answer clearly and appropriately:
"""


    response = client.chat.completions.create(
    model="llama-3.1-8b-instant",   # ✅ FIXED
    messages=[{"role": "user", "content": prompt}]
)

    return response.choices[0].message.content



def explain_topic(topic, text):

    results = semantic_search(topic, text)

    context = "\n".join(
        [r["text"] for r in results]
    )

    prompt = f"""
You are an AI study assistant.

Explain this concept VERY briefly.

Rules:
- Maximum 2 short sentences
- Under 30 words
- Simple and beginner friendly
- No bullet points
- No long explanations
- No extra formatting

Topic:
{topic}

Context:
{context}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content