from evaluators.costs import evaluate_cost
from evaluators.performance import evaluate_performance
from evaluators.responsibility import evaluate_responsibility


def main():
    prompt = "Explain what Python is."
    response = (
        "Python is a high-level programming language known for its "
        "readability and versatility. It is commonly used for web "
        "development, automation, data analysis, and artificial intelligence."
    )

    print("\n--- COST ---")
    print(evaluate_cost(prompt, response))

    print("\n--- PERFORMANCE ---")
    print(evaluate_performance(prompt, response))

    print("\n--- RESPONSIBILITY ---")
    print(evaluate_responsibility(response, prompt))


if __name__ == "__main__":
    main()