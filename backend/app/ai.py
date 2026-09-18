import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

print("=" * 60)
print("Gemini Key Loaded:", bool(API_KEY))

if API_KEY:
    print("First 12 chars:", API_KEY[:12])
else:
    print("NO GEMINI KEY FOUND")
print("=" * 60)

client = genai.Client(api_key=API_KEY)


def generate_ai_answer(question: str):
    try:

        prompt = f"""
You are an expert engineering faculty member.

Answer the student's academic question clearly.

Student Question:
{question}

Rules:
- Simple English
- Bullet points where useful
- Maximum 250 words
- Give code example if required
"""

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )

        return response.text

    except Exception as e:
        print("=" * 60)
        print("GEMINI ERROR")
        print(repr(e))
        print("=" * 60)

        return f"AI Error: {e}"
