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

def get_dashboard_data():

    with get_connection() as conn:
        with conn.cursor() as cur:

            # -------------------------------------------------
            # OVERVIEW METRICS
            # -------------------------------------------------
            cur.execute("""
                SELECT
                    COUNT(*) AS total_interactions,

                    COUNT(*) FILTER (
                        WHERE decision = 'ALLOW'
                    ) AS allow_count,

                    COUNT(*) FILTER (
                        WHERE decision = 'EDIT'
                    ) AS edit_count,

                    COUNT(*) FILTER (
                        WHERE decision = 'BLOCK'
                    ) AS block_count,

                    COUNT(*) FILTER (
                        WHERE decision = 'ESCALATE'
                    ) AS escalate_count,

                    ROUND(AVG(performance_score), 2)
                        AS avg_performance,

                    ROUND(AVG(cost_score), 2)
                        AS avg_cost,

                    ROUND(AVG(safety_score), 2)
                        AS avg_safety,

                    ROUND(AVG(confidence), 2)
                        AS avg_confidence,

                    COALESCE(SUM(total_tokens), 0)
                        AS total_tokens,

                    COALESCE(SUM(estimated_cost_usd), 0)
                        AS total_estimated_cost,

                    COUNT(*) FILTER (
                        WHERE cost_score < 40
                    ) AS cost_anomalies,

                    COUNT(*) FILTER (
                        WHERE EXISTS (
                            SELECT 1
                            FROM unnest(issues) AS issue
                            WHERE issue ILIKE '%PII%'
                        )
                    ) AS pii_incidents,

                    COUNT(*) FILTER (
                        WHERE safety_score < 40
                    ) AS safety_incidents

                FROM interactions;
            """)

            overview = cur.fetchone()

            # -------------------------------------------------
            # RECENT FLAGGED INTERACTIONS
            # -------------------------------------------------
            cur.execute("""
                SELECT
                    id,
                    timestamp,
                    prompt,
                    decision,
                    performance_score,
                    cost_score,
                    safety_score,
                    confidence,
                    issues
                FROM interactions
                WHERE decision != 'ALLOW'
                   OR cardinality(issues) > 0
                ORDER BY timestamp DESC
                LIMIT 20;
            """)

            rows = cur.fetchall()

    overview_data = {
        "total_interactions": overview[0],
        "allow_count": overview[1],
        "edit_count": overview[2],
        "block_count": overview[3],
        "escalate_count": overview[4],
        "avg_performance": float(overview[5] or 0),
        "avg_cost": float(overview[6] or 0),
        "avg_safety": float(overview[7] or 0),
        "avg_confidence": float(overview[8] or 0),
        "total_tokens": overview[9],
        "total_estimated_cost": float(overview[10] or 0),
        "cost_anomalies": overview[11],
        "pii_incidents": overview[12],
        "safety_incidents": overview[13],
    }

    recent_interactions = []

    for row in rows:
        recent_interactions.append({
            "id": row[0],
            "timestamp": row[1],
            "prompt": row[2],
            "decision": row[3],
            "performance_score": row[4],
            "cost_score": row[5],
            "safety_score": row[6],
            "confidence": row[7],
            "issues": row[8],
        })

    return {
        "overview": overview_data,
        "recent_interactions": recent_interactions,
    }
def get_escalated_interactions():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    id,
                    timestamp,
                    prompt,
                    response,
                    performance_score,
                    cost_score,
                    safety_score,
                    confidence,
                    issues
                FROM interactions
                WHERE decision = 'ESCALATE'
                ORDER BY timestamp DESC;
            """)

            rows = cur.fetchall()

    return [
        {
            "id": row[0],
            "timestamp": row[1],
            "prompt": row[2],
            "response": row[3],
            "performance_score": row[4],
            "cost_score": row[5],
            "safety_score": row[6],
            "confidence": row[7],
            "issues": row[8],
        }
        for row in rows
    ]

def resolve_escalated_interaction(
    interaction_id: int,
    new_decision: str
):
    new_decision = new_decision.upper()

    if new_decision not in ("ALLOW", "BLOCK"):
        raise ValueError("Decision must be ALLOW or BLOCK")

    with get_connection() as conn:
        with conn.cursor() as cur:

            cur.execute(
                """
                UPDATE interactions
                SET decision = %s
                WHERE id = %s
                  AND decision = 'ESCALATE'
                RETURNING id, decision;
                """,
                (new_decision, interaction_id)
            )

            result = cur.fetchone()

            if result is None:
                return {
                    "status": "NOT_FOUND",
                    "message": "Escalated interaction not found or already resolved."
                }

    return {
        "status": "RESOLVED",
        "id": result[0],
        "decision": result[1]
    }