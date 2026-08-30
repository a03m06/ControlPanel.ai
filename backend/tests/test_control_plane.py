import asyncio

from evaluators.orchestrator import run_control_plane


async def main():
    prompt = "Explain photosynthesis in simple terms."

    response = (
        "Photosynthesis is the process by which plants use sunlight, "
        "water, and carbon dioxide to produce glucose and oxygen."
    )

    result = await run_control_plane(
        prompt=prompt,
        response=response
    )

    evaluation = result["evaluation"]
    decision = result["decision"]

    print("\n--- EVALUATION ---")
    print("Performance:", evaluation.performance_score)
    print("Cost:", evaluation.cost_score)
    print("Safety:", evaluation.safety_score)
    print("Confidence:", evaluation.confidence)
    print("Issues:", evaluation.issues)

    print("\n--- DECISION ---")
    print("Decision:", decision.decision)
    print("Reason:", decision.reason)
    print("Issues:", decision.issues)


if __name__ == "__main__":
    asyncio.run(main())