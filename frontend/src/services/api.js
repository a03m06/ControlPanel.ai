// ============================================================
// ControlPlane.ai - API Client
// ============================================================

// FastAPI backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";


// ------------------------------------------------------------
// Helper
// ------------------------------------------------------------

async function handleResponse(res, defaultMessage) {
  if (!res.ok) {
    let message = defaultMessage;

    try {
      const error = await res.json();
      message = error.detail || error.message || message;
    } catch {
      // Keep default message
    }

    throw new Error(message);
  }

  return await res.json();
}


// ------------------------------------------------------------
// 1. CONTROL PLANE
// ------------------------------------------------------------

/**
 * Send a prompt through the complete ControlPlane pipeline.
 *
 * POST /api/control-plane
 */
export async function runControlPlane(prompt, reference_docs = null) {
  const res = await fetch(`${API_BASE_URL}/api/control-plane`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      reference_docs,
    }),
  });

  return await handleResponse(
    res,
    "ControlPlane request failed"
  );
}


// ------------------------------------------------------------
// Compatibility function used by Conversation.jsx
// ------------------------------------------------------------

/**
 * Frontend compatibility wrapper.
 *
 * The old frontend called:
 *     runEvaluation(prompt, response)
 *
 * The real backend now owns the complete pipeline, so the
 * response argument is no longer sent separately.
 */
export async function runEvaluation(prompt, _response = null) {
  return await runControlPlane(prompt);
}


// ------------------------------------------------------------
// 2. DASHBOARD
// ------------------------------------------------------------

/**
 * Fetch dashboard metrics and recent interactions.
 *
 * GET /api/dashboard
 */
export async function getDashboardStats() {
  const res = await fetch(`${API_BASE_URL}/api/dashboard`);

  return await handleResponse(
    res,
    "Failed to fetch dashboard data"
  );
}


// ------------------------------------------------------------
// 3. HUMAN REVIEW QUEUE
// ------------------------------------------------------------

/**
 * Fetch all interactions awaiting human review.
 *
 * GET /api/escalate
 */
export async function getReviewQueue() {
  const res = await fetch(`${API_BASE_URL}/api/escalate`);

  const data = await handleResponse(
    res,
    "Failed to fetch escalated interactions"
  );

  // Backend returns an array.
  // Normalize it to the shape expected by ReviewQueue.jsx.
  return data.map((item) => ({
    ...item,
    risk:
      item.safety_score < 40
        ? "HIGH"
        : item.performance_score < 75
          ? "MEDIUM"
          : "LOW",

    performance: item.performance_score,
    cost: item.cost_score,
    responsibility: item.safety_score,

    decision: "ESCALATE",
    status: "PENDING",

    reason:
      item.issues && item.issues.length > 0
        ? item.issues[0]
        : "Requires human review",
  }));
}


// ------------------------------------------------------------
// 4. RESOLVE HUMAN REVIEW
// ------------------------------------------------------------

/**
 * Resolve an escalated interaction.
 *
 * APPROVE -> ALLOW
 * REJECT  -> BLOCK
 *
 * PATCH /api/escalate/{interaction_id}/{new_decision}
 */
export async function reviewEvaluation(
  id,
  action,
  _notes = ""
) {
  const newDecision =
    action.toUpperCase() === "APPROVE"
      ? "ALLOW"
      : "BLOCK";

  const res = await fetch(
    `${API_BASE_URL}/api/escalate/${id}/${newDecision}`,
    {
      method: "PATCH",
    }
  );

  return await handleResponse(
    res,
    "Failed to resolve escalated interaction"
  );
}


// ------------------------------------------------------------
// 5. EVALUATION DETAIL
// ------------------------------------------------------------

/**
 * The backend currently does not expose a dedicated
 * GET /api/evaluations/{id} endpoint.
 *
 * We therefore derive the event detail from the dashboard
 * recent_interactions data.
 */
export async function getEvaluation(id) {
  const dashboard = await getDashboardStats();

  const interaction = dashboard.recent_interactions?.find(
    (item) => String(item.id) === String(id)
  );

  if (!interaction) {
    throw new Error(`Evaluation #${id} not found`);
  }

  return {
    request: {
      id: interaction.id,
      timestamp: interaction.timestamp,
      formattedTime: interaction.timestamp,
      prompt: interaction.prompt,
    },

    llm_response: {
      fullText: "Response details are not exposed by the dashboard endpoint.",
      tokenCount: 0,
      latencyMs: 0,
    },

    performance: {
      score: interaction.performance_score,
      confidence: interaction.confidence,
      issues: interaction.issues || [],
      explanation: "Performance evaluation completed by ControlPlane.",
      semanticSimilarity: null,
      factualConsistency: null,
      latencyScore: null,
    },

    cost: {
      score: interaction.cost_score,
      expectedTokens: null,
      actualTokens: null,
      tokenRatio: null,
      costUsd: null,
      budgetVariance: null,
      costExplanation: "Cost evaluation completed by ControlPlane.",
    },

    responsibility: {
      score: interaction.safety_score,
      riskLevel:
        interaction.safety_score < 40
          ? "HIGH"
          : interaction.safety_score < 75
            ? "MEDIUM"
            : "LOW",
      detectedPii: [],
      sensitiveInfo: null,
      unsafeContent: null,
      toxicityScore: null,
      presidioStatus: null,
    },

    decision: {
      finalDecision: interaction.decision,
      ruleMatched: null,
      reason:
        interaction.issues?.length > 0
          ? interaction.issues.join(", ")
          : "No issues reported.",
      auditStatus: "Audited & Saved",
      recommendedAction: interaction.decision,
    },
  };
}


// ------------------------------------------------------------
// 6. ANALYTICS
// ------------------------------------------------------------

/**
 * Analytics page compatibility layer.
 *
 * There is currently no dedicated analytics endpoint in the
 * FastAPI backend, so analytics are derived from dashboard data.
 */
export async function getAnalytics(_timeRange = "24h") {
  const dashboard = await getDashboardStats();

  const interactions =
    dashboard.recent_interactions || [];

  const performanceTrends = interactions.map((item, index) => ({
    time: index + 1,
    performance: item.performance_score ?? 0,
    semantic: item.performance_score ?? 0,
    factual: item.performance_score ?? 0,
  }));

  const costTrends = interactions.map((item, index) => ({
    time: index + 1,
    costScore: item.cost_score ?? 0,
    tokenRatio: 0,
  }));

  const safetyTrends = interactions.map((item, index) => ({
    time: index + 1,
    safety: item.safety_score ?? 0,
  }));

  const volumeData = interactions.map((item, index) => ({
    time: index + 1,
    volume: 1,
  }));

  const decisionCounts = {};

  interactions.forEach((item) => {
    const decision = item.decision || "UNKNOWN";
    decisionCounts[decision] =
      (decisionCounts[decision] || 0) + 1;
  });

  const decisionDistribution = Object.entries(
    decisionCounts
  ).map(([name, value]) => ({
    name,
    value,
  }));

  const riskCounts = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  interactions.forEach((item) => {
    const safety = item.safety_score ?? 100;

    if (safety < 40) {
      riskCounts.HIGH++;
    } else if (safety < 75) {
      riskCounts.MEDIUM++;
    } else {
      riskCounts.LOW++;
    }
  });

  const riskDistribution = Object.entries(
    riskCounts
  ).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    timeRange: _timeRange,
    performanceTrends,
    costTrends,
    safetyTrends,
    volumeData,
    decisionDistribution,
    riskDistribution,
  };
}