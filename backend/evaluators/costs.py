import tiktoken

# Pricing per 1K tokens, by model. (input, output) in USD.
# Source: publicly published provider pricing pages — update these numbers
# whenever a provider changes pricing; they are NOT fetched live.
MODEL_PRICING = {
    # OpenAI
    "gpt-3.5-turbo":     {"input": 0.0015, "output": 0.0020},
    "gpt-4":             {"input": 0.0300, "output": 0.0600},
    "gpt-4-turbo":       {"input": 0.0100, "output": 0.0300},
    "gpt-4o":            {"input": 0.0025, "output": 0.0100},
    "gpt-4o-mini":       {"input": 0.00015, "output": 0.0006},
    # Anthropic (Claude)
    "claude-3-opus":     {"input": 0.0150, "output": 0.0750},
    "claude-3-sonnet":   {"input": 0.0030, "output": 0.0150},
    "claude-3-haiku":    {"input": 0.00025, "output": 0.00125},
    # Google (Gemini)
    "gemini-1.5-pro":    {"input": 0.00125, "output": 0.0050},
    "gemini-1.5-flash":  {"input": 0.000075, "output": 0.0003},
    "gemini-2.0-flash":  {"input": 0.0001, "output": 0.0004},
}

# Used when model_name isn't in MODEL_PRICING above. Keeps the function from
# silently mis-pricing an unknown/newer model as if it were GPT-3.5.
DEFAULT_PRICING = {"input": 0.0015, "output": 0.0020}


def _get_pricing(model_name: str) -> tuple[dict, bool]:
    """Returns (pricing_dict, was_found). was_found=False means we fell back
    to DEFAULT_PRICING and the caller should be told the cost is an estimate,
    not an accurate figure for that specific model."""
    pricing = MODEL_PRICING.get(model_name)
    if pricing is not None:
        return pricing, True
    return DEFAULT_PRICING, False


def _get_encoding(model_name: str):
    """tiktoken only recognizes OpenAI model names. For any other model
    (Claude, Gemini, Llama, etc.) there's no exact tokenizer available here,
    so we fall back to a reasonable general-purpose encoding for an
    approximate token count. This keeps the function usable for any model,
    at the cost of exact precision for non-OpenAI models."""
    try:
        return tiktoken.encoding_for_model(model_name), True
    except KeyError:
        return tiktoken.get_encoding("cl100k_base"), False


def evaluate_cost(prompt: str, response: str, model_name: str = "gpt-3.5-turbo") -> dict:
    issues = []

    encoding, exact_tokenizer = _get_encoding(model_name)
    if not exact_tokenizer:
        issues.append(
            f"Token count is approximate: no exact tokenizer available for '{model_name}', "
            f"used a general-purpose fallback encoding."
        )

    prompt_tokens = len(encoding.encode(prompt))
    response_tokens = len(encoding.encode(response))
    total_tokens = prompt_tokens + response_tokens

    # Dynamic Budget Allocation: Classify prompt complexity
    if len(prompt.split()) < 10:
        expected_tokens = 50  # Simple prompt
    else:
        expected_tokens = 300  # Complex prompt

    ratio = response_tokens / expected_tokens if expected_tokens > 0 else 1.0

    # Calculate Risk Score
    if ratio > 3.0:
        cost_score = 20
        issues.append(f"Cost Anomaly: Generated {response_tokens} tokens ({ratio:.1f}x budget)")
    elif ratio > 1.5:
        cost_score = 60
        issues.append(f"Moderate excess tokens ({ratio:.1f}x budget)")
    else:
        cost_score = 100

    # Calculate dollar cost using the correct per-model rate
    pricing, pricing_found = _get_pricing(model_name)
    if not pricing_found:
        issues.append(
            f"No pricing entry for model '{model_name}' — used default GPT-3.5-turbo-equivalent "
            f"rates as an estimate. Add this model to MODEL_PRICING for an accurate figure."
        )

    actual_cost = ((prompt_tokens / 1000) * pricing["input"]) + ((response_tokens / 1000) * pricing["output"])

    return {
        "score": cost_score,
        "total_tokens": total_tokens,
        "estimated_cost_usd": round(actual_cost, 6),
        "model_name": model_name,
        "pricing_source": "known" if pricing_found else "default_fallback",
        "issues": issues,
    }