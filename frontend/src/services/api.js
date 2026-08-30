import { mockDashboardStats } from '../data/mockDashboard';
import { mockEvaluationsList, mockPresetScenarios } from '../data/mockEvaluations';
import { mockEventsMap } from '../data/mockEvents';
import { initialReviewQueue } from '../data/mockReviewQueue';
import { mockAnalyticsData } from '../data/mockAnalytics';

// Configuration for API endpoint (empty = mock mode)
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || '';
const IS_MOCK_MODE = !API_BASE_URL;

// Local storage keys for interactive session persistence
const STORAGE_KEYS = {
  EVALUATIONS: 'cp_evaluations',
  EVENTS: 'cp_events',
  REVIEW_QUEUE: 'cp_review_queue',
  DASHBOARD_OVERRIDE: 'cp_dashboard_stats'
};

// Helper to simulate realistic async latency
const delay = (ms = 350) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize local session storage with defaults if not present
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(mockEvaluationsList));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEventsMap));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEW_QUEUE)) {
    localStorage.setItem(STORAGE_KEYS.REVIEW_QUEUE, JSON.stringify(initialReviewQueue));
  }
  const existingDash = localStorage.getItem(STORAGE_KEYS.DASHBOARD_OVERRIDE);
  if (!existingDash || !JSON.parse(existingDash)?.overview) {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_OVERRIDE, JSON.stringify(mockDashboardStats));
  }
}

initializeLocalStorage();

/**
 * Fetch high-level dashboard metrics, score cards, and recent interactions
 */
export async function getDashboardStats() {
  if (!IS_MOCK_MODE) {
    const res = await fetch(`${API_BASE_URL}/api/v1/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return await res.json();
  }

  await delay(200);
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARD_OVERRIDE);
    if (!stored) return mockDashboardStats;
    const parsed = JSON.parse(stored);
    return {
      overview: { ...mockDashboardStats.overview, ...(parsed.overview || parsed.summary || {}) },
      recent_interactions: parsed.recent_interactions || mockDashboardStats.recent_interactions || []
    };
  } catch {
    return mockDashboardStats;
  }
}

/**
 * Fetch all historical evaluations with optional search, risk, and decision filters
 */
export async function getEvaluations(filters = {}) {
  if (!IS_MOCK_MODE) {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE_URL}/api/v1/evaluations?${query}`);
    if (!res.ok) throw new Error('Failed to fetch evaluations');
    return await res.json();
  }

  await delay(250);
  let evaluations = [...mockEvaluationsList];
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (stored) evaluations = JSON.parse(stored);
  } catch {
    // fallback
  }

  const { search, decision, risk } = filters;
  if (search) {
    const s = search.toLowerCase();
    evaluations = evaluations.filter(item =>
      item.id.toLowerCase().includes(s) ||
      item.prompt.toLowerCase().includes(s) ||
      (item.issues && item.issues.some(issue => issue.toLowerCase().includes(s)))
    );
  }
  if (decision && decision !== 'ALL') {
    evaluations = evaluations.filter(item => item.decision === decision);
  }
  if (risk && risk !== 'ALL') {
    evaluations = evaluations.filter(item => item.risk === risk);
  }

  return evaluations;
}

/**
 * Fetch full breakdown of a single evaluation event by ID
 */
export async function getEvaluation(id) {
  if (!IS_MOCK_MODE) {
    const res = await fetch(`${API_BASE_URL}/api/v1/events/${id}`);
    if (!res.ok) throw new Error(`Event #${id} not found`);
    return await res.json();
  }

  await delay(200);
  let events = { ...mockEventsMap };
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (stored) events = JSON.parse(stored);
  } catch {
    // fallback
  }

  if (events[id]) {
    return events[id];
  }

  // If newly created or fallback, create synthesized details
  const allEvals = await getEvaluations();
  const found = allEvals.find(e => e.id === String(id));
  if (found) {
    return {
      request: {
        id: found.id,
        timestamp: found.timestamp || new Date().toISOString(),
        formattedTime: found.timestamp || new Date().toLocaleString(),
        prompt: found.prompt,
        application: "Production Gateway",
        model: found.model || "gpt-4o-enterprise",
        environment: "production",
        userId: "user_live"
      },
      llm_response: {
        fullText: found.response || "No response recorded.",
        tokenCount: Math.round((found.response?.length || 100) / 4),
        latencyMs: parseInt(found.latency || "250", 10)
      },
      performance: {
        score: found.performance,
        confidence: 85,
        issues: found.issues || [],
        explanation: found.performance >= 80 ? "Output passed semantic and factual consistency checks." : "Output exhibited partial accuracy deviation or guideline issues.",
        semanticSimilarity: (found.performance / 100).toFixed(2),
        factualConsistency: ((found.performance - 5) / 100).toFixed(2),
        latencyScore: 90
      },
      cost: {
        score: found.cost,
        expectedTokens: 50,
        actualTokens: Math.round((found.response?.length || 100) / 4),
        tokenRatio: (Math.round((found.response?.length || 100) / 4) / 50).toFixed(2),
        costUsd: 0.0008,
        budgetVariance: "Nominal",
        costExplanation: "Token generation efficiency recorded."
      },
      responsibility: {
        score: found.responsibility,
        riskLevel: found.risk,
        detectedPii: found.responsibility < 60 ? [{ type: "FLAGGED_ENTITY", text: "Flagged Content", confidence: 0.92, severity: "HIGH" }] : [],
        sensitiveInfo: found.responsibility < 60 ? "Sensitive content alert" : "None detected",
        unsafeContent: found.responsibility < 50 ? "Harmful or non-compliant wording detected" : "Safe",
        toxicityScore: ((100 - found.responsibility) / 1000).toFixed(2),
        presidioStatus: found.responsibility < 60 ? "TRIGGERED" : "CLEARED"
      },
      decision: {
        finalDecision: found.decision,
        ruleMatched: `ENGINE-RULE-${found.decision.replace(/\s+/g, '-')}`,
        reason: `Evaluated with Performance: ${found.performance}, Cost: ${found.cost}, Responsibility: ${found.responsibility}.`,
        auditStatus: "Audited & Saved",
        recommendedAction: found.decision === "ALLOW" ? "Deploy output to user" : "Review output guidelines"
      }
    };
  }

  throw new Error(`Evaluation event #${id} not found`);
}

/**
 * Execute real-time evaluation simulation for a prompt and LLM response.
 * Uses exact evaluator output schema from the ControlPlane.ai specification:
 * {
 *   "performance_score": 82,
 *   "cost_score": 91,
 *   "safety_score": 95,
 *   "issues": ["possible hallucination"],
 *   "confidence": 74
 * }
 */
export async function runEvaluation(prompt, response) {
  if (!IS_MOCK_MODE) {
    const res = await fetch(`${API_BASE_URL}/api/v1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, response })
    });
    if (!res.ok) throw new Error('Evaluation request failed');
    return await res.json();
  }

  // Simulated latency for parallel evaluation calculation
  await delay(800);

  const cleanPrompt = (prompt || '').trim();
  const cleanResponse = (response || '').trim();

  // Match against predefined scenarios if text resembles them
  let matchedPreset = mockPresetScenarios.find(p =>
    (cleanPrompt && p.prompt.toLowerCase().includes(cleanPrompt.slice(0, 25).toLowerCase())) ||
    (cleanResponse && p.response.toLowerCase().includes(cleanResponse.slice(0, 25).toLowerCase()))
  );

  let output;
  if (matchedPreset) {
    output = { ...matchedPreset.expectedOutput };
  } else {
    // Dynamic heuristic simulation for custom user inputs
    const lowerResp = cleanResponse.toLowerCase();
    const isPii = lowerResp.includes('ssn') || lowerResp.includes('@') || lowerResp.includes('phone') || /\d{3}-\d{2}-\d{4}/.test(cleanResponse);
    const isToxic = lowerResp.includes('hate') || lowerResp.includes('incompetent') || lowerResp.includes('destroy') || lowerResp.includes('bypass') || lowerResp.includes('jailbreak');
    const isHallucination = lowerResp.includes('guarantee') || lowerResp.includes('100%') || lowerResp.includes('memorandum');
    const isCostHeavy = cleanResponse.length > 800;

    let perfScore = 88;
    let costScore = 92;
    let safetyScore = 96;
    let issues = [];
    let confidence = 85;
    let decision = "ALLOW";
    let reason = "All guardrails passed enterprise compliance thresholds.";

    if (isPii) {
      safetyScore = 24;
      issues.push("PII detected: sensitive personal entities");
      decision = "BLOCK";
      reason = "Presidio scanner detected unmasked identity data (SSN/Contact). Gate blocked.";
      confidence = 98;
    } else if (isToxic) {
      safetyScore = 15;
      perfScore = 40;
      issues.push("Harmful wording / policy violation");
      decision = "BLOCK";
      reason = "Toxicity and safety violation exceeding enterprise risk limits.";
      confidence = 96;
    } else if (isHallucination) {
      perfScore = 65;
      safetyScore = 78;
      issues.push("possible hallucination", "unverified factual claim");
      decision = "HUMAN REVIEW";
      reason = "Unverified numerical/factual claims detected in response. Requires analyst sign-off.";
      confidence = 74;
    } else if (isCostHeavy) {
      costScore = 38;
      issues.push("excessive token generation", "token limit budget exceeded");
      decision = "EDIT / REGENERATE";
      reason = "High token amplification detected. Re-prompt with concise constraints.";
      confidence = 90;
    } else if (cleanResponse.includes("{") && cleanResponse.includes("'")) {
      perfScore = 76;
      issues.push("single-quoted invalid JSON");
      decision = "EDIT / REGENERATE";
      reason = "JSON syntax validation error. Format correction needed.";
      confidence = 92;
    }

    output = {
      performance_score: perfScore,
      cost_score: costScore,
      safety_score: safetyScore,
      issues: issues,
      confidence: confidence,
      decision: decision,
      reason: reason
    };
  }

  // Generate new unique ID
  const newId = String(Date.now()).slice(-4);
  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  let riskLevel = "LOW";
  if (output.decision === "BLOCK" || output.safety_score < 40) {
    riskLevel = "HIGH";
  } else if (output.decision === "HUMAN REVIEW" || output.decision === "EDIT / REGENERATE" || output.performance_score < 75) {
    riskLevel = "MEDIUM";
  }

  const newEvalSummary = {
    id: newId,
    prompt: cleanPrompt || "Custom Prompt",
    response: cleanResponse || "Custom LLM Response",
    performance: output.performance_score,
    cost: output.cost_score,
    responsibility: output.safety_score,
    risk: riskLevel,
    decision: output.decision,
    issues: output.issues,
    timestamp: nowStr,
    latency: `${Math.floor(Math.random() * 150 + 200)}ms`,
    model: "gpt-4o-enterprise"
  };

  const newDetailedEvent = {
    request: {
      id: newId,
      timestamp: new Date().toISOString(),
      formattedTime: nowStr,
      prompt: cleanPrompt || "Custom Prompt",
      application: "Live Interactive Evaluator",
      model: "gpt-4o-enterprise",
      environment: "evaluator-session",
      userId: "demo_analyst"
    },
    llm_response: {
      fullText: cleanResponse,
      tokenCount: Math.round(cleanResponse.length / 4),
      latencyMs: 265
    },
    performance: {
      score: output.performance_score,
      confidence: output.confidence,
      issues: output.issues,
      explanation: output.reason,
      semanticSimilarity: (output.performance_score / 100).toFixed(2),
      factualConsistency: Math.max(0.2, (output.performance_score - 10) / 100).toFixed(2),
      latencyScore: 92
    },
    cost: {
      score: output.cost_score,
      expectedTokens: 60,
      actualTokens: Math.max(12, Math.round(cleanResponse.length / 4)),
      tokenRatio: (Math.max(12, Math.round(cleanResponse.length / 4)) / 60).toFixed(2),
      costUsd: 0.0009,
      budgetVariance: output.cost_score < 60 ? "+180%" : "-4%",
      costExplanation: output.cost_score < 60 ? "Token limits exceeded" : "Optimal token economics"
    },
    responsibility: {
      score: output.safety_score,
      riskLevel: riskLevel,
      detectedPii: output.safety_score < 50 ? [{ type: "DETECTED_PII_ENTITY", text: "Identity info", confidence: 0.96, severity: "HIGH" }] : [],
      sensitiveInfo: output.safety_score < 50 ? "Restricted compliance flag" : "Zero sensitive entities detected",
      unsafeContent: output.safety_score < 50 ? "Safety policy triggered" : "Safe for downstream distribution",
      toxicityScore: ((100 - output.safety_score) / 1000).toFixed(2),
      presidioStatus: output.safety_score < 50 ? "TRIGGERED" : "CLEARED"
    },
    decision: {
      finalDecision: output.decision,
      ruleMatched: `DECISION-ENGINE-V2-${output.decision.replace(/\s+/g, '_')}`,
      reason: output.reason,
      auditStatus: "Logged to ControlPlane Session Log",
      recommendedAction: output.decision === "ALLOW" ? "Proceed" : "Review output guidelines"
    }
  };

  // Persist into LocalStorage
  try {
    const existingEvals = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVALUATIONS) || '[]');
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify([newEvalSummary, ...existingEvals]));

    const existingEvents = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '{}');
    existingEvents[newId] = newDetailedEvent;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(existingEvents));

    // If item is human review or blocked, add to Review Queue
    if (output.decision === "HUMAN REVIEW" || output.decision === "BLOCK" || riskLevel === "HIGH") {
      const existingQueue = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEW_QUEUE) || '[]');
      const newQueueItem = {
        id: newId,
        risk: riskLevel,
        reason: output.issues[0] || output.reason,
        performance: output.performance_score,
        cost: output.cost_score,
        responsibility: output.safety_score,
        decision: output.decision,
        timestamp: "Just now",
        prompt: cleanPrompt,
        response: cleanResponse,
        status: "PENDING",
        category: output.issues[0] || "Compliance Review",
        assignedTo: "Active Reviewer"
      };
      localStorage.setItem(STORAGE_KEYS.REVIEW_QUEUE, JSON.stringify([newQueueItem, ...existingQueue]));
    }

    // Update Dashboard Counts and Recent Interactions
    const dashStats = JSON.parse(localStorage.getItem(STORAGE_KEYS.DASHBOARD_OVERRIDE) || JSON.stringify(mockDashboardStats));
    if (!dashStats.overview) dashStats.overview = { ...mockDashboardStats.overview };
    if (!dashStats.recent_interactions) dashStats.recent_interactions = [...mockDashboardStats.recent_interactions];

    dashStats.overview.total_interactions = (dashStats.overview.total_interactions || 0) + 1;
    const decUpper = (output.decision || "ALLOW").toUpperCase();
    if (decUpper === "ALLOW" || decUpper === "ALLOWED") {
      dashStats.overview.allow_count = (dashStats.overview.allow_count || 0) + 1;
    } else if (decUpper.includes("EDIT") || decUpper.includes("REGEN")) {
      dashStats.overview.edit_count = (dashStats.overview.edit_count || 0) + 1;
    } else if (decUpper === "BLOCK" || decUpper === "BLOCKED") {
      dashStats.overview.block_count = (dashStats.overview.block_count || 0) + 1;
    } else if (decUpper.includes("HUMAN") || decUpper.includes("REVIEW") || decUpper.includes("ESCALATE")) {
      dashStats.overview.escalate_count = (dashStats.overview.escalate_count || 0) + 1;
    }

    if (isPii) dashStats.overview.pii_incidents = (dashStats.overview.pii_incidents || 0) + 1;
    if (isToxic) dashStats.overview.safety_incidents = (dashStats.overview.safety_incidents || 0) + 1;
    if (isCostHeavy) dashStats.overview.cost_anomalies = (dashStats.overview.cost_anomalies || 0) + 1;

    const approxTokens = Math.max(12, Math.round((cleanPrompt.length + cleanResponse.length) / 4));
    dashStats.overview.total_tokens = (dashStats.overview.total_tokens || 0) + approxTokens;
    dashStats.overview.total_estimated_cost = Number(((dashStats.overview.total_estimated_cost || 0) + (approxTokens * 0.000035)).toFixed(6));

    const n = dashStats.overview.total_interactions;
    dashStats.overview.avg_performance = Math.round(((dashStats.overview.avg_performance || 100) * (n - 1) + output.performance_score) / n);
    dashStats.overview.avg_cost = Math.round(((dashStats.overview.avg_cost || 100) * (n - 1) + output.cost_score) / n);
    dashStats.overview.avg_safety = Math.round(((dashStats.overview.avg_safety || 100) * (n - 1) + output.safety_score) / n);
    dashStats.overview.avg_confidence = Math.round(((dashStats.overview.avg_confidence || 100) * (n - 1) + output.confidence) / n);

    const newInteractionItem = {
      id: Number(newId) || Date.now(),
      timestamp: new Date().toISOString(),
      prompt: cleanPrompt || "Custom Prompt",
      decision: output.decision === "HUMAN REVIEW" ? "ESCALATE" : output.decision,
      performance_score: output.performance_score,
      cost_score: output.cost_score,
      safety_score: output.safety_score,
      confidence: output.confidence,
      issues: output.issues || []
    };
    dashStats.recent_interactions = [newInteractionItem, ...dashStats.recent_interactions.slice(0, 19)];

    localStorage.setItem(STORAGE_KEYS.DASHBOARD_OVERRIDE, JSON.stringify(dashStats));
  } catch (e) {
    console.error("Storage update error", e);
  }

  return {
    ...output,
    eventId: newId,
    timestamp: nowStr,
    risk: riskLevel
  };
}

/**
 * Fetch human review queue items
 */
export async function getReviewQueue() {
  if (!IS_MOCK_MODE) {
    const res = await fetch(`${API_BASE_URL}/api/v1/review/queue`);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    return await res.json();
  }

  await delay(200);
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.REVIEW_QUEUE);
    return stored ? JSON.parse(stored) : initialReviewQueue;
  } catch {
    return initialReviewQueue;
  }
}

/**
 * Submit human reviewer action (APPROVE or REJECT) on a queue item
 */
export async function reviewEvaluation(id, action, notes = "") {
  if (!IS_MOCK_MODE) {
    const res = await fetch(`${API_BASE_URL}/api/v1/review/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes })
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return await res.json();
  }

  await delay(300);
  try {
    // Update queue list
    const queue = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEW_QUEUE) || '[]');
    const updatedQueue = queue.map(item => {
      if (item.id === String(id)) {
        return {
          ...item,
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewedAt: new Date().toISOString(),
          reviewerNotes: notes,
          finalDecision: action === "APPROVE" ? "ALLOW (OVERRIDE)" : "BLOCK (CONFIRMED)"
        };
      }
      return item;
    });
    localStorage.setItem(STORAGE_KEYS.REVIEW_QUEUE, JSON.stringify(updatedQueue));

    // Update history evaluation record
    const evals = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVALUATIONS) || '[]');
    const updatedEvals = evals.map(ev => {
      if (ev.id === String(id)) {
        return {
          ...ev,
          decision: action === "APPROVE" ? "ALLOW" : "BLOCK",
          risk: action === "APPROVE" ? "LOW" : "HIGH"
        };
      }
      return ev;
    });
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(updatedEvals));

    return {
      success: true,
      id,
      action,
      message: `Evaluation #${id} successfully marked as ${action === "APPROVE" ? "APPROVED" : "REJECTED"}.`
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Fetch analytics datasets for charts across selectable time ranges
 */
export async function getAnalytics(timeRange = '24h') {
  if (!IS_MOCK_MODE) {
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics?range=${timeRange}`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return await res.json();
  }

  await delay(250);
  const range = mockAnalyticsData.timeRanges.includes(timeRange) ? timeRange : '24h';

  return {
    timeRange: range,
    performanceTrends: mockAnalyticsData.performanceTrends[range] || mockAnalyticsData.performanceTrends["24h"],
    costTrends: mockAnalyticsData.costTrends[range] || mockAnalyticsData.costTrends["24h"],
    safetyTrends: mockAnalyticsData.safetyTrends[range] || mockAnalyticsData.safetyTrends["24h"],
    volumeData: mockAnalyticsData.volumeData[range] || mockAnalyticsData.volumeData["24h"],
    decisionDistribution: mockAnalyticsData.decisionDistribution,
    riskDistribution: mockAnalyticsData.riskDistribution
  };
}

/**
 * Helper to reset demo mock data to defaults
 */
export function resetMockData() {
  localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(mockEvaluationsList));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEventsMap));
  localStorage.setItem(STORAGE_KEYS.REVIEW_QUEUE, JSON.stringify(initialReviewQueue));
  localStorage.setItem(STORAGE_KEYS.DASHBOARD_OVERRIDE, JSON.stringify(mockDashboardStats));
  return true;
}
