import re
from presidio_analyzer import AnalyzerEngine

analyzer = AnalyzerEngine()

PII_ENTITIES = ["EMAIL_ADDRESS", "PHONE_NUMBER", "CREDIT_CARD", "US_SSN", "DEBIT_CARD", "AADHAR_CARD", "AADHAR_NUMBER", "PASSWORD","UPI_PIN","BANK_DETAILS","ACCOUNT_NUMBER"]

# --- Allow-list: known/expected support contacts ---------------------------
# Generic business contact patterns that should NOT be treated as a privacy
# leak even if no user ever mentioned them. Configure this per-deployment —
# e.g. add your own company's real support addresses/domains here.
ALLOWLISTED_EMAIL_PATTERNS = [
    r"(?i)^(support|help|contact|info|sales|hello|noreply|no-reply)@",
]
ALLOWLISTED_DOMAINS = [
    # e.g. "yourcompany.com" — responses mentioning any address at this
    # domain are treated as expected business contact info, not a leak.
]


def _is_allowlisted_email(email: str) -> bool:
    for pattern in ALLOWLISTED_EMAIL_PATTERNS:
        if re.match(pattern, email):
            return True
    domain = email.split("@")[-1].lower() if "@" in email else ""
    return domain in [d.lower() for d in ALLOWLISTED_DOMAINS]



PREFIXED_SECRET_PATTERNS = {
    "AWS Access Key": r"AKIA[0-9A-Z]{16}",
    "OpenAI Key": r"sk-[a-zA-Z0-9]{20,}",
    "GitHub Token": r"gh[pousr]_[a-zA-Z0-9]{20,}",
    "Google API Key": r"AIza[0-9A-Za-z_\-]{30,}",
    "Slack Token": r"xox[baprs]-[0-9a-zA-Z-]{10,}",
    "Bearer Token": r"(?i)bearer\s+[a-z0-9_\-\.]{20,}",
    "Private Key": r"-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----",
}
LABEL_PATTERN = re.compile(r"(?i)\b(api[_\-\s]?key|secret[_\-\s]?key|access[_\-\s]?token|auth[_\-\s]?token)\b")
GENERIC_SECRET_VALUE_PATTERN = re.compile(
    r"\b(?=[A-Za-z0-9_\-]{20,}\b)(?=[A-Za-z0-9_\-]*[0-9])(?=[A-Za-z0-9_\-]*[A-Za-z])[A-Za-z0-9_\-]{20,}\b"
)


def _scan_credentials(response: str) -> list[str]:
    found = []
    for label, pattern in PREFIXED_SECRET_PATTERNS.items():
        if re.search(pattern, response):
            found.append(label)
    if LABEL_PATTERN.search(response) and GENERIC_SECRET_VALUE_PATTERN.search(response):
        found.append("Labeled credential (generic value near label word)")
    return found


def _extract_pii(text: str) -> list:
    """Runs Presidio and returns the list of detected entities with their
    actual text value (result.entity_type + the substring it matched)."""
    results = analyzer.analyze(text=text, entities=PII_ENTITIES, language="en")
    extracted = []
    for r in results:
        value = text[r.start:r.end]
        extracted.append({"entity_type": r.entity_type, "value": value})
    return extracted


def evaluate_responsibility(response: str, prompt: str = "") -> dict:
    """
    Context-aware responsibility check.

    `prompt` is optional but strongly recommended — without it, this
    function cannot tell the difference between the AI genuinely leaking
    someone's private information versus simply echoing back contact
    details the USER already typed in themselves (e.g. "my email is
    [email protected], draft a reply for me" -> the response repeating
    that email back is expected behavior, not a leak).

    Detection logic:
      1. Run PII detection on the response.
      2. Also run PII detection on the prompt (if provided).
      3. Any PII entity found in the response that ALSO appears in the
         prompt is treated as "echoed" — not penalized.
      4. Any PII entity found in the response but NOT in the prompt is
         "novel" — this is the genuinely suspicious case (fabricated,
         or leaked from somewhere other than what the user gave us) and
         IS penalized.
      5. Emails matching the allow-list (generic support/business
         contacts) are never penalized, even if novel.
    """
    issues = []
    safety_score = 100

    response_pii = _extract_pii(response)
    prompt_pii = _extract_pii(prompt) if prompt else []
    prompt_values = {p["value"].strip().lower() for p in prompt_pii}

    novel_pii = []
    echoed_pii = []
    allowlisted_pii = []

    for item in response_pii:
        value_norm = item["value"].strip().lower()

        if item["entity_type"] == "EMAIL_ADDRESS" and _is_allowlisted_email(item["value"]):
            allowlisted_pii.append(item)
            continue

        if value_norm in prompt_values:
            echoed_pii.append(item)
        else:
            novel_pii.append(item)

    if echoed_pii:
        echoed_types = sorted(set(p["entity_type"] for p in echoed_pii))
        issues.append(
            f"PII present but user-provided (echoed from prompt, not flagged as leak): {', '.join(echoed_types)}"
        )

    if allowlisted_pii:
        issues.append(
            f"Contact info detected but allow-listed as expected business contact: "
            f"{', '.join(p['value'] for p in allowlisted_pii)}"
        )

    if novel_pii:
        novel_types = sorted(set(p["entity_type"] for p in novel_pii))
        issues.append(f"PII Leakage Detected (not present in user's prompt): {', '.join(novel_types)}")
        safety_score -= 50

    # Secret / credential scan — unaffected by the prompt/echo logic above,
    # since a leaked API key is never something a normal user prompt provides.
    exposed = _scan_credentials(response)
    for key_type in exposed:
        issues.append(f"Exposed Secret: {key_type}")
        safety_score -= 50

    return {"score": max(0, safety_score), "issues": issues}


# ---------------------------------------------------------------------------
# PRE-SEND CHECK — runs on the PROMPT, before it's sent to the LLM.
# This is a separate concern from evaluate_responsibility() above (which
# checks the LLM's response, after generation). This is what your pitch
# slide's "consent pop-up" flow actually needs to call.
#
# Ownership split (see explanation given alongside this code):
#   - Detection + redaction (this function)      -> Responsibility checker (you)
#   - Deciding to pause + wait for confirmation   -> backend orchestration
#   - Rendering the actual pop-up/dialog          -> frontend
#   - Enforcing "store the redacted version only" -> backend persistence layer
# ---------------------------------------------------------------------------

def scan_prompt_for_pii(prompt: str) -> dict:
    """
    Call this BEFORE sending a prompt to the LLM.

    Returns:
        {
          "contains_pii": bool,
          "entity_types": [str, ...],   # e.g. ["EMAIL_ADDRESS", "PHONE_NUMBER"]
          "requires_consent": bool,     # backend should show the pop-up if True
        }

    Note: allow-listed contact info (support@, help@, etc.) still shows up
    here as PII — the allow-list only suppresses the LEAKAGE PENALTY in
    evaluate_responsibility(); it does NOT skip the consent prompt, because
    even if it's a support email, the user still typed something into the
    prompt that looks like personal/contact info and deserves a heads-up
    before it's sent onward to a third-party LLM API.
    """
    detected = _extract_pii(prompt)
    entity_types = sorted(set(p["entity_type"] for p in detected))
    return {
        "contains_pii": bool(detected),
        "entity_types": entity_types,
        "requires_consent": bool(detected),
    }


def redact_pii(text: str) -> str:
    """
    Returns a version of `text` with detected PII values replaced by
    placeholders (e.g. "[EMAIL_ADDRESS]"). Use this for whatever gets
    written to logs/database/cache — never store the raw text if it
    contained PII. The LLM call itself should still receive the ORIGINAL
    unredacted prompt (redacting before sending would break the user's
    actual request) — this function is only for what gets persisted.
    """
    detected = _extract_pii(text)
    # Replace from the end backwards so earlier offsets don't shift.
    detected_sorted = sorted(detected, key=lambda p: text.find(p["value"]), reverse=True)
    redacted = text
    for item in detected_sorted:
        redacted = redacted.replace(item["value"], f"[{item['entity_type']}]")
    return redacted