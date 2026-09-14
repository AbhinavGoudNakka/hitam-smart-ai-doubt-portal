import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("Gemini Key:", "Loaded" if api_key else "NOT FOUND")

client = genai.Client(api_key=api_key)


def generate_ai_answer(question: str):
    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=f"""
You are an expert engineering faculty member.

Answer the student's academic question clearly.

Student Question:
{question}

Rules:
- Simple English
- Bullet points when useful.
- Maximum 250 words.
- If code is needed, provide a small example.
"""
        )

        return response.text

    except Exception as e:
        print("GEMINI ERROR:", repr(e))
        return f"AI Error: {e}"