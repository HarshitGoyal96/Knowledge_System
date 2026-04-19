from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path
import json

# Load env
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_learning_content(text):

    # 🔥 Clean input (important)
    text = text[:3000]  # limit size for quality

    prompt = f"""
You are an expert study assistant.

Analyze the content and extract structured learning material.

STRICT RULES:
- Ignore noise, broken words, OCR errors
- Focus only on meaningful academic content
- Keep answers clear and precise

Return ONLY valid JSON.

Format:
{{
  "topics": ["topic1", "topic2"],
  "flashcards": [
    {{"question": "...", "answer": "..."}}
  ],
  "mindmap": {{
    "main_topic": {{
        "sub_topic": ["point1", "point2"]
    }}
  }}
}}

Content:
{text}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        output = response.choices[0].message.content

        # 🔥 Ensure JSON format
        try:
            return json.loads(output)
        except:
            return {"raw_output": output}

    except Exception as e:
        print("ERROR:", e)
        return {"error": "Failed to generate content"}