from groq import Groq
import os
from dotenv import load_dotenv
from pathlib import Path
import json

# LOAD ENV

env_path = Path(__file__).resolve().parents[2] / ".env"

load_dotenv(dotenv_path=env_path)

# GROQ CLIENT

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# MAIN FUNCTION

def generate_learning_content(text):

    # LIMIT CONTEXT SIZE

    MAX_TEXT = 12000

    if len(text) > MAX_TEXT:

        text = text[:MAX_TEXT]

    # PROMPT

    prompt = f"""
You are an advanced AI study assistant.

The uploaded content may contain MULTIPLE PDFs combined together.

IMPORTANT:
- Analyze ALL subjects and ALL documents equally
- Do NOT focus on only one topic
- Include concepts from every document
- If multiple domains exist (Git, AI, Resume, Web Dev, etc),
  include all of them

YOUR TASK:

1. Extract ONLY 10-15 most important topics
2. Generate ONLY 10 flashcards maximum
3. Generate concise mind map concepts covering ALL PDFs

RULES:
- Return ONLY valid JSON
- No markdown
- No explanations
- No extra text
- Keep output concise
- Topics must come from ALL PDFs
- Flashcards must come from DIFFERENT PDFs
- Mindmap should contain ONLY major concepts
- Avoid repetition
- Keep answers short and clean

JSON FORMAT:

{{
  "topics": [
    "Topic 1",
    "Topic 2"
  ],

  "flashcards": [
    {{
      "question": "Question here",
      "answer": "Answer here"
    }}
  ],

  "mindmap": {{
    "Main Topic": {{
      "Sub Topic": [
        "Point 1",
        "Point 2"
      ]
    }}
  }}
}}

CONTENT:
{text}
"""

    try:

        response = client.chat.completions.create(

            model="llama-3.3-70b-versatile",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.2,

            max_tokens=1800

        )

        output = response.choices[0].message.content

        print("RAW OUTPUT:", output)

        # CLEAN OUTPUT

        output = output.strip()

        output = output.replace(
         "```json",
          ""
        )

        output = output.replace(
             "```",
            ""
        )

        output = output.strip()

        # PARSE JSON

        parsed = json.loads(output)

        # SAFETY FALLBACKS

        return {

            "topics":
                parsed.get(
                    "topics",
                    []
                ),

            "flashcards":
                parsed.get(
                    "flashcards",
                    []
                ),

            "mindmap":
                parsed.get(
                    "mindmap",
                    {}
                )

        }

    except Exception as e:

        print("ERROR:", e)

        return {

            "topics": [],

            "flashcards": [],

            "mindmap": {}

        }