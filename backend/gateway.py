import os

from dotenv import load_dotenv
from groq import AsyncGroq


load_dotenv()

client = AsyncGroq(
    api_key=os.getenv("GROQ_API_KEY")
)


async def call_llm(
    prompt: str,
    model: str = "openai/gpt-oss-20b"
) -> dict:
    """
    Send a prompt to the configured Groq LLM.

    Returns the generated response along with
    basic model and token usage information.
    """

    completion = await client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
    )

    response = completion.choices[0].message.content
    usage = completion.usage

    return {
        "response": response,
        "model": model,
        "prompt_tokens": usage.prompt_tokens if usage else 0,
        "completion_tokens": usage.completion_tokens if usage else 0,
        "total_tokens": usage.total_tokens if usage else 0,
    }