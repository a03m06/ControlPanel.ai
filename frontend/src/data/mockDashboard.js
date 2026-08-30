export const mockDashboardStats = {
  overview: {
    total_interactions: 2,
    allow_count: 2,
    edit_count: 0,
    block_count: 0,
    escalate_count: 0,
    avg_performance: 100,
    avg_cost: 100,
    avg_safety: 100,
    avg_confidence: 100,
    total_tokens: 29,
    total_estimated_cost: 0.001032,
    cost_anomalies: 0,
    pii_incidents: 0,
    safety_incidents: 0
  },
  recent_interactions: [
    {
      id: 2,
      timestamp: "2026-08-30T12:01:45.452325",
      prompt: "Answer in exactly 5 words: What is photosynthesis?",
      decision: "ALLOW",
      performance_score: 100,
      cost_score: 100,
      safety_score: 100,
      confidence: 100,
      issues: [
        "Self-consistency check skipped: no additional response samples provided (pass response_samples=[...] with 2+ extra LLM generations of the same prompt to enable this check)."
      ]
    },
    {
      id: 1,
      timestamp: "2026-08-30T11:45:10.120400",
      prompt: "Explain how solar energy converts sunlight to electricity.",
      decision: "ALLOW",
      performance_score: 100,
      cost_score: 100,
      safety_score: 100,
      confidence: 100,
      issues: []
    }
  ]
};

