import re
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

HEDGING_WORDS = ["probably", "i think", "not sure", "might be", "unclear"]

# --- Scoring constants -----------------------------------------------------
# These are still heuristic (not derived from a labeled dataset), but are now
# named, documented, and proportional rather than arbitrary flat numbers
# buried in the code. If you get time before submission, the strongest
# improvement here is replacing these with values calibrated against a small
# set of human-labeled good/bad responses instead of hand-picked guesses.
MIN_VALID_RESPONSE_LEN = 10
SHORT_RESPONSE_SCORE = 20

HEDGE_PENALTY_PER_WORD = 5      # each distinct hedging word found costs 5 points
HEDGE_PENALTY_CAP = 20          # ...but never more than 20 total, so one
                                  # heavily-hedged sentence isn't punished
                                  # disproportionately vs. a rambling one

LOW_RELEVANCE_THRESHOLD = 0.25   # prompt<->response similarity below this
LOW_RELEVANCE_PENALTY = 35

LOW_GROUNDING_THRESHOLD = 0.35   # response<->source similarity below this
LOW_GROUNDING_PENALTY = 40

LOW_CONSISTENCY_THRESHOLD = 0.60  # avg pairwise similarity across samples
LOW_CONSISTENCY_PENALTY = 30

GROUNDING_CHUNK_SIZE = 200        # characters per chunk when splitting a
                                    # long reference document (see note below)


def _chunk_text(text: str, chunk_size: int = GROUNDING_CHUNK_SIZE) -> list[str]:
    """Splits long text into roughly chunk_size-character pieces, breaking
    on sentence boundaries where possible so chunks stay coherent."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks = []
    current = ""
    for sentence in sentences:
        if len(current) + len(sentence) <= chunk_size:
            current = f"{current} {sentence}".strip()
        else:
            if current:
                chunks.append(current)
            current = sentence
    if current:
        chunks.append(current)
    return chunks if chunks else [text]


def _check_grounding(response_embedding, reference_docs: str) -> tuple[float, bool]:
    """
    Checks the response against a reference document.

    FIX vs. the original version: the original embedded the ENTIRE
    reference_docs string as one vector. all-MiniLM-L6-v2 has a hard input
    limit of ~256 word-pieces, so anything longer than a couple hundred
    words was SILENTLY TRUNCATED — a long PDF's worth of source text would
    only ever have its first ~200 words actually checked, with no warning.

    This version splits the reference into chunks, embeds each chunk
    separately, and takes the BEST (max) similarity across all chunks. This
    means grounding now correctly finds a match even if the relevant part
    of a long document is somewhere in the middle or end, not just the
    start.

    Note: this still only accepts plain text passed in as reference_docs.
    It does NOT read/extract text from PDFs, DOCX, scanned images, or web
    pages — that extraction has to happen upstream, before this function is
    called. This fixes the truncation problem, not the missing-parser
    problem.
    """
    chunks = _chunk_text(reference_docs)
    chunk_embeddings = model.encode(chunks, convert_to_tensor=True)
    similarities = util.cos_sim(response_embedding, chunk_embeddings)[0]
    best_similarity = float(similarities.max())
    return best_similarity, len(chunks) > 1


def _check_self_consistency(response: str, response_samples: list[str] | None) -> tuple[float | None, list[str]]:
    """
    Real self-consistency check (this did not exist before — the original
    file only compared prompt-vs-response relevance, never response-vs-
    response). To actually check "does the LLM give roughly the same
    answer if asked the same thing more than once," this function needs
    MULTIPLE generated responses to the same prompt, not just one.

    `response_samples` should be a list of additional responses generated
    by calling the LLM again with the identical prompt (this happens
    upstream, wherever the LLM is actually called — this file has no LLM
    client of its own). If backend doesn't pass any samples, this check is
    skipped entirely and clearly noted as skipped, rather than silently
    pretending consistency was verified when it wasn't.

    Returns (avg_similarity_or_None, issues_list).
    """
    if not response_samples:
        return None, ["Self-consistency check skipped: no additional response samples provided " \
                       "(pass response_samples=[...] with 2+ extra LLM generations of the same prompt to enable this check)."]

    all_responses = [response] + response_samples
    embeddings = model.encode(all_responses, convert_to_tensor=True)

    pair_similarities = []
    for i in range(len(all_responses)):
        for j in range(i + 1, len(all_responses)):
            pair_similarities.append(float(util.cos_sim(embeddings[i], embeddings[j]).item()))

    avg_similarity = sum(pair_similarities) / len(pair_similarities)
    return avg_similarity, []


def evaluate_performance(prompt: str, response: str, reference_docs: str = None,
                          response_samples: list[str] = None) -> dict:
    """
    response_samples (optional): additional LLM-generated responses to the
    SAME prompt, used for self-consistency scoring. Without these, the
    self-consistency check is skipped (see _check_self_consistency).
    """
    issues = []
    score = 100

    # Step 1: Fast Heuristics
    if len(response.strip()) < MIN_VALID_RESPONSE_LEN:
        issues.append("Low quality: Response too short")
        return {"score": SHORT_RESPONSE_SCORE, "issues": issues}

    hedges = [w for w in HEDGING_WORDS if w in response.lower()]
    if hedges:
        penalty = min(len(hedges) * HEDGE_PENALTY_PER_WORD, HEDGE_PENALTY_CAP)
        issues.append(f"Uncertainty detected: Found hedging words ({', '.join(hedges)}) [-{penalty}]")
        score -= penalty

    # Step 2: Embeddings & Similarity (prompt <-> response relevance)
    embeddings = model.encode([prompt, response], convert_to_tensor=True)
    similarity = util.cos_sim(embeddings[0], embeddings[1]).item()

    if similarity < LOW_RELEVANCE_THRESHOLD:
        issues.append(f"Low prompt relevance / context drift (similarity={similarity:.2f})")
        score -= LOW_RELEVANCE_PENALTY

    # Step 3: Grounding check (if reference text exists) — now chunked
    if reference_docs:
        doc_similarity, was_chunked = _check_grounding(embeddings[1], reference_docs)
        if doc_similarity < LOW_GROUNDING_THRESHOLD:
            issues.append(f"Possible Hallucination: Not grounded in source text (best match={doc_similarity:.2f})")
            score -= LOW_GROUNDING_PENALTY

    # Step 4: Self-consistency check (real multi-sample comparison)
    consistency_score, consistency_issues = _check_self_consistency(response, response_samples)
    issues.extend(consistency_issues)
    if consistency_score is not None and consistency_score < LOW_CONSISTENCY_THRESHOLD:
        issues.append(f"Low self-consistency across repeated generations (avg similarity={consistency_score:.2f})")
        score -= LOW_CONSISTENCY_PENALTY

    return {"score": max(0, score), "issues": issues}