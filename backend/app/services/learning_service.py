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

    text = text[:4000]

    prompt = f"""
You are an AI study assistant.

Analyze the content carefully.

Extract:

1. Main study topics
2. Flashcards
3. Mind map concepts

IMPORTANT RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra text
- Keep topics short
- Generate at least 5 flashcards if possible

JSON FORMAT:

{{
  "topics": ["Topic 1", "Topic 2"],

  "flashcards": [
    {{
      "question": "What is Git?",
      "answer": "Git is a version control system."
    }}
  ],

  "mindmap": {{
    "Main Topic": {{
      "Sub Topic": ["Point 1", "Point 2"]
    }}
  }}
}}

CONTENT:
{text}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        output = response.choices[0].message.content

        print("RAW OUTPUT:", output)

        # 🔥 Clean AI response
        output = output.strip()

        if output.startswith("```json"):
            output = output.replace("```json", "").replace("```", "")

        import json
        parsed = json.loads(output)

        return parsed

    except Exception as e:
        print("ERROR:", e)

        return {
            "topics": [],
            "flashcards": [],
            "mindmap": {}
        }