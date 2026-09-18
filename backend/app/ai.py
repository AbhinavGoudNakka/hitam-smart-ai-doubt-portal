import os
from dotenv import load_dotenv
from anthropic import Anthropic

load_dotenv()

API_KEY = os.getenv("ANTHROPIC_API_KEY")

print("=" * 60)
print("Anthropic Key Loaded:", bool(API_KEY))

if API_KEY:
    print("First 12 chars:", API_KEY[:12])
else:
    print("NO ANTHROPIC KEY FOUND")
print("=" * 60)

client = Anthropic(api_key=API_KEY)

# Fast + cheap, good fit for a student doubt-answering bot.
# Swap to "claude-sonnet-5" if you want noticeably higher-quality answers
# at a higher cost per request.
MODEL = "claude-haiku-4-5-20251001"


def generate_ai_answer(question: str):
    try:

        prompt = f"""You are an expert engineering faculty member.

Answer the student's academic question clearly.

Student Question:
{question}

Rules:
- Simple English
- Bullet points where useful
- Maximum 250 words
- Give code example if required
"""

        response = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ],
        )

        return response.content[0].text

    except Exception as e:
        print("=" * 60)
        print("CLAUDE ERROR")
        print(repr(e))
        print("=" * 60)

        return f"AI Error: {e}"
