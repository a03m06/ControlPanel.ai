from dataclasses import dataclass
from enum import Enum

from evaluators.schemas import EvaluationResult


class Decision(str, Enum):
    ALLOW = "ALLOW"
    EDIT = "EDIT"
    BLOCK = "BLOCK"
    ESCALATE = "ESCALATE"


@dataclass
class DecisionResult:
    decision: Decision
    reason: str
    issues: list[str]


# Thresholds
HIGH_RISK = 40
MEDIUM_RISK = 70
LOW_CONFIDENCE = 50


def make_decision(result: EvaluationResult) -> DecisionResult:
    """
    Decide what should happen to an AI response based on evaluator results.

    Priority:
        1. Responsibility / safety
        2. Confidence / ambiguity
        3. Performance
        4. Cost
        5. Allow
    """

    issues = list(result.issues)

    # ---------------------------------------------------------
    # 1. RESPONSIBILITY HAS HIGHEST PRIORITY
    # ---------------------------------------------------------
    if result.safety_score < HIGH_RISK:
        return DecisionResult(
            decision=Decision.BLOCK,
            reason="High responsibility/safety risk detected.",
            issues=issues,
        )

    # ---------------------------------------------------------
    # 2. LOW CONFIDENCE -> HUMAN REVIEW
    # ---------------------------------------------------------
    if result.confidence < LOW_CONFIDENCE:
        return DecisionResult(
            decision=Decision.ESCALATE,
            reason="Evaluation confidence is too low for automatic routing.",
            issues=issues,
        )

    # ---------------------------------------------------------
    # 3. PERFORMANCE
    # ---------------------------------------------------------
    if result.performance_score < HIGH_RISK:
        return DecisionResult(
            decision=Decision.ESCALATE,
            reason="Performance risk is too high for automatic editing.",
            issues=issues,
        )

    if result.performance_score < MEDIUM_RISK:
        return DecisionResult(
            decision=Decision.EDIT,
            reason="Moderate performance risk detected; response should be edited.",
            issues=issues,
        )

    # ---------------------------------------------------------
    # 4. COST
    # ---------------------------------------------------------
    # Cost alone does NOT block the response.
    # We simply preserve the cost issue for logging/dashboard alerts.
    if result.cost_score < HIGH_RISK:
        issues.append("High cost anomaly detected.")

    # ---------------------------------------------------------
    # 5. EVERYTHING LOOKS GOOD
    # ---------------------------------------------------------
    return DecisionResult(
        decision=Decision.ALLOW,
        reason="Response passed all critical checks.",
        issues=issues,
    )