from storage import save_interaction


def main():
    interaction_id = save_interaction(
        prompt="Test prompt",
        response="Test response",
        decision="ALLOW",
        performance_score=100,
        cost_score=100,
        safety_score=100,
        confidence=100,
        total_tokens=10,
        estimated_cost_usd=0.001,
        issues=[]
    )

    print("Interaction saved successfully!")
    print("Interaction ID:", interaction_id)


if __name__ == "__main__":
    main()