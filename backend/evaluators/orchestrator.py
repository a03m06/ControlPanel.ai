import asyncio

from evaluators.performance import evaluate_performance
from evaluators.costs import evaluate_cost
from evaluators.responsibility import (
    evaluate_responsibility,
    scan_prompt_for_pii,
    redact_pii
)
from evaluators.schemas import EvaluationResult
from decision import make_decision
from gateway import call_llm


# ---------------------------------------------------------------------------
# STEP 1 — PRE-SEND CHECK
# ---------------------------------------------------------------------------
async def check_prompt_safety(prompt: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        scan_prompt_for_pii,
        prompt
    )


def get_safe_prompt_for_storage(prompt: str) -> str:
    """Redact PII before storing/logging the prompt."""
    return redact_pii(prompt)


# ---------------------------------------------------------------------------
# STEP 2 — LLM GATEWAY
# Call the configured LLM provider only after the pre-send check passes.
# ---------------------------------------------------------------------------
async def generate_response(prompt: str) -> dict:
    return await call_llm(prompt)


# ---------------------------------------------------------------------------
# STEP 3 — POST-RESPONSE EVALUATION
# ---------------------------------------------------------------------------
async def run_parallel_evaluations(
    prompt: str,
    response: str,
    reference_docs: str = None
) -> EvaluationResult:

    loop = asyncio.get_event_loop()

    perf_task = loop.run_in_executor(
        None,
        evaluate_performance,
        prompt,
        response,
        reference_docs
    )

    cost_task = loop.run_in_executor(
        None,
        evaluate_cost,
        prompt,
        response
    )

    resp_task = loop.run_in_executor(
        None,
        evaluate_responsibility,
        response,
        prompt
    )

    perf_res, cost_res, resp_res = await asyncio.gather(
        perf_task,
        cost_task,
        resp_task
    )

    all_issues = (
        perf_res["issues"]
        + cost_res["issues"]
        + resp_res["issues"]
    )

    avg_confidence = int(
        (
            perf_res["score"]
            + cost_res["score"]
            + resp_res["score"]
        ) / 3
    )

    return EvaluationResult(
        performance_score=perf_res["score"],
        cost_score=cost_res["score"],
        safety_score=resp_res["score"],
        confidence=avg_confidence,
        issues=all_issues,
        total_tokens=cost_res["total_tokens"],
        estimated_cost_usd=cost_res["estimated_cost_usd"]
    )


# ---------------------------------------------------------------------------
# STEP 4 — COMPLETE CONTROL PLANE
#
# PRE-SEND CHECK
#       ↓
# LLM GATEWAY
#       ↓
# POST-RESPONSE EVALUATION
#       ↓
# DECISION
# ---------------------------------------------------------------------------
async def run_control_plane(
    prompt: str,
    reference_docs: str = None
):
    # 1. Check prompt BEFORE sending it to the LLM
    safety = await check_prompt_safety(prompt)

    # If PII requires user consent, stop here.
    # The frontend/application should obtain consent and call again.
    if safety.get("requires_consent", False):
        return {
            "status": "CONSENT_REQUIRED",
            "safety": safety
        }

    # 2. Send prompt through the LLM Gateway
    gateway_result = await generate_response(prompt)

    response = gateway_result["response"]

    # 3. Evaluate the generated response
    evaluation = await run_parallel_evaluations(
        prompt=prompt,
        response=response,
        reference_docs=reference_docs
    )

    # 4. Apply deterministic decision policy
    decision = make_decision(evaluation)

    return {
        "status": "COMPLETED",
        "response": response,
        "gateway": gateway_result,
        "evaluation": evaluation,
        "decision": decision
    }