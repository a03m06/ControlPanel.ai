import asyncio

from evaluators.orchestrator import run_parallel_evaluations


async def main():
    prompt = "Explain what photosynthesis is in simple terms."

    response = (
        "Photosynthesis is the process by which plants use sunlight, "
        "water, and carbon dioxide to produce glucose and oxygen."
    )

    result = await run_parallel_evaluations(
        prompt=prompt,
        response=response
    )

    print("\n--- ORCHESTRATOR RESULT ---")
    print("Performance Score:", result.performance_score)
    print("Cost Score:", result.cost_score)
    print("Safety Score:", result.safety_score)
    print("Confidence:", result.confidence)
    print("Issues:", result.issues)
    print("Total Tokens:", result.total_tokens)
    print("Estimated Cost:", result.estimated_cost_usd)


if __name__ == "__main__":
    asyncio.run(main())