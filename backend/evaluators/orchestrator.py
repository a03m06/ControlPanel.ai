import asyncio
from evaluators.performance import evaluate_performance
from evaluators.costs import evaluate_cost
from evaluators.responsibility import evaluate_responsibility, scan_prompt_for_pii, redact_pii
from evaluators.schemas import EvaluationResult


# ---------------------------------------------------------------------------
# STEP 1 — PRE-SEND CHECK
# Call this BEFORE the prompt is sent to the LLM at all.
#
# Backend usage:
#   safety = await check_prompt_safety(prompt)
#   if safety["requires_consent"]:
#       # tell frontend to show the consent pop-up and WAIT for confirmation
#       # before calling the LLM
#       ...
#   # only after consent (or if no PII was found) -> proceed to call the LLM
#   # with the ORIGINAL, unredacted prompt.
#   # Whatever gets written to logs/DB/cache for this interaction should use
#   # redact_pii(prompt) instead of the raw prompt.
# ---------------------------------------------------------------------------
async def check_prompt_safety(prompt: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, scan_prompt_for_pii, prompt)


def get_safe_prompt_for_storage(prompt: str) -> str:
    """Convenience pass-through so backend doesn't need a separate import
    just to redact a prompt before logging/caching it."""
    return redact_pii(prompt)


# ---------------------------------------------------------------------------
# STEP 2 — POST-RESPONSE EVALUATION
# Call this AFTER the LLM has generated a response, to score it on
# performance, cost, and responsibility before it reaches the user.
# ---------------------------------------------------------------------------
async def run_parallel_evaluations(prompt: str, response: str, reference_docs: str = None) -> EvaluationResult:
    # Run performance, cost, and responsibility checks concurrently using asyncio
    loop = asyncio.get_event_loop()

    perf_task = loop.run_in_executor(None, evaluate_performance, prompt, response, reference_docs)
    cost_task = loop.run_in_executor(None, evaluate_cost, prompt, response)
    # NOTE: prompt is now passed through so evaluate_responsibility can tell
    # the difference between PII the user already provided (echoed, not a
    # leak) and PII that appears in the response but was never in the
    # prompt (novel -- genuinely flagged). Without this, every response
    # PII match falls back to the conservative "flag everything" behavior.
    resp_task = loop.run_in_executor(None, evaluate_responsibility, response, prompt)

    perf_res, cost_res, resp_res = await asyncio.gather(perf_task, cost_task, resp_task)

    all_issues = perf_res["issues"] + cost_res["issues"] + resp_res["issues"]
    avg_confidence = int((perf_res["score"] + cost_res["score"] + resp_res["score"]) / 3)

    return EvaluationResult(
        performance_score=perf_res["score"],
        cost_score=cost_res["score"],
        safety_score=resp_res["score"],
        confidence=avg_confidence,
        issues=all_issues,
        total_tokens=cost_res["total_tokens"],
        estimated_cost_usd=cost_res["estimated_cost_usd"]
    )