from evaluators.schemas import EvaluationResult
from decision import Decision, make_decision


def test_allow_good_response():
    result = EvaluationResult(
        performance_score=90,
        cost_score=90,
        safety_score=95,
        confidence=90,
    )

    decision = make_decision(result)

    assert decision.decision == Decision.ALLOW


def test_block_unsafe_response():
    result = EvaluationResult(
        performance_score=90,
        cost_score=90,
        safety_score=20,
        confidence=90,
    )

    decision = make_decision(result)

    assert decision.decision == Decision.BLOCK


def test_escalate_low_confidence():
    result = EvaluationResult(
        performance_score=80,
        cost_score=90,
        safety_score=80,
        confidence=30,
    )

    decision = make_decision(result)

    assert decision.decision == Decision.ESCALATE


def test_edit_medium_performance():
    result = EvaluationResult(
        performance_score=60,
        cost_score=90,
        safety_score=90,
        confidence=90,
    )

    decision = make_decision(result)

    assert decision.decision == Decision.EDIT


def test_cost_does_not_block():
    result = EvaluationResult(
        performance_score=90,
        cost_score=20,
        safety_score=90,
        confidence=90,
    )

    decision = make_decision(result)

    assert decision.decision == Decision.ALLOW
    assert "High cost anomaly detected." in decision.issues


def test_safety_overrides_performance():
    result = EvaluationResult(
        performance_score=50,
        cost_score=90,
        safety_score=20,
        confidence=90,
    )

    decision = make_decision(result)

    assert decision.decision == Decision.BLOCK