from database import get_connection


def save_interaction(
    prompt: str,
    response: str,
    decision: str,
    performance_score: int,
    cost_score: int,
    safety_score: int,
    confidence: int,
    total_tokens: int,
    estimated_cost_usd: float,
    issues: list[str]
) -> int:

    query = """
        INSERT INTO interactions (
            prompt,
            response,
            decision,
            performance_score,
            cost_score,
            safety_score,
            confidence,
            total_tokens,
            estimated_cost_usd,
            issues
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING id;
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                query,
                (
                    prompt,
                    response,
                    decision,
                    performance_score,
                    cost_score,
                    safety_score,
                    confidence,
                    total_tokens,
                    estimated_cost_usd,
                    issues
                )
            )

            interaction_id = cur.fetchone()[0]

        conn.commit()

    return interaction_id