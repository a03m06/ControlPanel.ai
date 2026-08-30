import asyncio

from evaluators.orchestrator import run_control_plane


async def main():
    prompt = "Explain photosynthesis in simple terms."

    result = await run_control_plane(
        prompt=prompt,
    )

    print("\n--- RESPONSE ---")
    print(result["response"])

    print("\n--- EVALUATION ---")
    evaluation = result["evaluation"]
    print("Performance:", evaluation.performance_score)
    print("Cost:", evaluation.cost_score)
    print("Safety:", evaluation.safety_score)
    print("Confidence:", evaluation.confidence)
    print("Issues:", evaluation.issues)

    print("\n--- DECISION ---")
    print("Decision:", result["decision"].decision)
    print("Reason:", result["decision"].reason)
    print("Issues:", result["decision"].issues)


if __name__ == "__main__":
    asyncio.run(main())