import asyncio

from gateway import call_llm


async def main():
    result = await call_llm(
        "Explain photosynthesis in one simple sentence."
    )

    print("\n--- GATEWAY RESULT ---")
    print("Response:", result["response"])
    print("Model:", result["model"])
    print("Prompt Tokens:", result["prompt_tokens"])
    print("Completion Tokens:", result["completion_tokens"])
    print("Total Tokens:", result["total_tokens"])


if __name__ == "__main__":
    asyncio.run(main())