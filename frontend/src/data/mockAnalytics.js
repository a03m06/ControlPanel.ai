export const mockAnalyticsData = {
  timeRanges: ["24h", "7d", "30d"],
  performanceTrends: {
    "24h": [
      { time: "00:00", performance: 80, factual: 79, semantic: 84 },
      { time: "03:00", performance: 82, factual: 81, semantic: 86 },
      { time: "06:00", performance: 84, factual: 83, semantic: 87 },
      { time: "09:00", performance: 79, factual: 76, semantic: 85 },
      { time: "12:00", performance: 81, factual: 78, semantic: 88 },
      { time: "15:00", performance: 85, factual: 83, semantic: 90 },
      { time: "18:00", performance: 83, factual: 80, semantic: 89 },
      { time: "21:00", performance: 86, factual: 84, semantic: 91 }
    ],
    "7d": [
      { time: "Day 1", performance: 78, factual: 75, semantic: 83 },
      { time: "Day 2", performance: 80, factual: 78, semantic: 85 },
      { time: "Day 3", performance: 79, factual: 76, semantic: 84 },
      { time: "Day 4", performance: 83, factual: 81, semantic: 88 },
      { time: "Day 5", performance: 82, factual: 79, semantic: 87 },
      { time: "Day 6", performance: 85, factual: 83, semantic: 90 },
      { time: "Day 7", performance: 84, factual: 82, semantic: 89 }
    ],
    "30d": [
      { time: "Week 1", performance: 76, factual: 72, semantic: 81 },
      { time: "Week 2", performance: 79, factual: 76, semantic: 84 },
      { time: "Week 3", performance: 82, factual: 80, semantic: 87 },
      { time: "Week 4", performance: 85, factual: 83, semantic: 90 }
    ]
  },
  costTrends: {
    "24h": [
      { time: "00:00", costScore: 92, tokenRatio: 1.02, avgCostUsd: 0.0018 },
      { time: "03:00", costScore: 94, tokenRatio: 0.98, avgCostUsd: 0.0016 },
      { time: "06:00", costScore: 93, tokenRatio: 1.01, avgCostUsd: 0.0017 },
      { time: "09:00", costScore: 88, tokenRatio: 1.15, avgCostUsd: 0.0022 },
      { time: "12:00", costScore: 89, tokenRatio: 1.12, avgCostUsd: 0.0021 },
      { time: "15:00", costScore: 91, tokenRatio: 1.05, avgCostUsd: 0.0019 },
      { time: "18:00", costScore: 90, tokenRatio: 1.08, avgCostUsd: 0.0020 },
      { time: "21:00", costScore: 93, tokenRatio: 1.01, avgCostUsd: 0.0017 }
    ],
    "7d": [
      { time: "Day 1", costScore: 89, tokenRatio: 1.11, avgCostUsd: 0.0021 },
      { time: "Day 2", costScore: 90, tokenRatio: 1.08, avgCostUsd: 0.0020 },
      { time: "Day 3", costScore: 92, tokenRatio: 1.03, avgCostUsd: 0.0018 },
      { time: "Day 4", costScore: 91, tokenRatio: 1.05, avgCostUsd: 0.0019 },
      { time: "Day 5", costScore: 93, tokenRatio: 1.00, avgCostUsd: 0.0017 },
      { time: "Day 6", costScore: 94, tokenRatio: 0.97, avgCostUsd: 0.0015 },
      { time: "Day 7", costScore: 91, tokenRatio: 1.04, avgCostUsd: 0.0018 }
    ],
    "30d": [
      { time: "Week 1", costScore: 86, tokenRatio: 1.18, avgCostUsd: 0.0025 },
      { time: "Week 2", costScore: 88, tokenRatio: 1.12, avgCostUsd: 0.0022 },
      { time: "Week 3", costScore: 91, tokenRatio: 1.06, avgCostUsd: 0.0019 },
      { time: "Week 4", costScore: 93, tokenRatio: 1.01, avgCostUsd: 0.0017 }
    ]
  },
  safetyTrends: {
    "24h": [
      { time: "00:00", safetyScore: 96, piiFlags: 0, toxicityFlags: 0 },
      { time: "03:00", safetyScore: 98, piiFlags: 0, toxicityFlags: 0 },
      { time: "06:00", safetyScore: 95, piiFlags: 1, toxicityFlags: 0 },
      { time: "09:00", safetyScore: 91, piiFlags: 3, toxicityFlags: 1 },
      { time: "12:00", safetyScore: 93, piiFlags: 2, toxicityFlags: 0 },
      { time: "15:00", safetyScore: 95, piiFlags: 1, toxicityFlags: 1 },
      { time: "18:00", safetyScore: 94, piiFlags: 2, toxicityFlags: 0 },
      { time: "21:00", safetyScore: 97, piiFlags: 0, toxicityFlags: 0 }
    ],
    "7d": [
      { time: "Mon", safetyScore: 93, piiFlags: 6, toxicityFlags: 2 },
      { time: "Tue", safetyScore: 94, piiFlags: 5, toxicityFlags: 1 },
      { time: "Wed", safetyScore: 96, piiFlags: 3, toxicityFlags: 0 },
      { time: "Thu", safetyScore: 92, piiFlags: 8, toxicityFlags: 3 },
      { time: "Fri", safetyScore: 95, piiFlags: 4, toxicityFlags: 1 },
      { time: "Sat", safetyScore: 97, piiFlags: 1, toxicityFlags: 0 },
      { time: "Sun", safetyScore: 98, piiFlags: 1, toxicityFlags: 0 }
    ],
    "30d": [
      { time: "Week 1", safetyScore: 91, piiFlags: 28, toxicityFlags: 9 },
      { time: "Week 2", safetyScore: 93, piiFlags: 22, toxicityFlags: 7 },
      { time: "Week 3", safetyScore: 95, piiFlags: 16, toxicityFlags: 4 },
      { time: "Week 4", safetyScore: 97, piiFlags: 11, toxicityFlags: 2 }
    ]
  },
  volumeData: {
    "24h": [
      { time: "00:00", allow: 32, edit: 2, block: 1, review: 1, total: 36 },
      { time: "03:00", allow: 24, edit: 1, block: 0, review: 0, total: 25 },
      { time: "06:00", allow: 45, edit: 3, block: 2, review: 1, total: 51 },
      { time: "09:00", allow: 168, edit: 18, block: 14, review: 8, total: 208 },
      { time: "12:00", allow: 210, edit: 22, block: 16, review: 11, total: 259 },
      { time: "15:00", allow: 245, edit: 26, block: 19, review: 12, total: 302 },
      { time: "18:00", allow: 198, edit: 14, block: 12, review: 7, total: 231 },
      { time: "21:00", allow: 149, edit: 10, block: 9, review: 4, total: 172 }
    ],
    "7d": [
      { time: "Mon", allow: 152, edit: 14, block: 11, review: 6, total: 183 },
      { time: "Tue", allow: 178, edit: 16, block: 13, review: 8, total: 215 },
      { time: "Wed", allow: 184, edit: 15, block: 9, review: 7, total: 215 },
      { time: "Thu", allow: 192, edit: 19, block: 15, review: 9, total: 235 },
      { time: "Fri", allow: 165, edit: 17, block: 12, review: 8, total: 202 },
      { time: "Sat", allow: 98, edit: 7, block: 6, review: 3, total: 114 },
      { time: "Sun", allow: 102, edit: 8, block: 7, review: 3, total: 120 }
    ],
    "30d": [
      { time: "Week 1", allow: 720, edit: 68, block: 52, review: 31, total: 871 },
      { time: "Week 2", allow: 810, edit: 74, block: 59, review: 35, total: 978 },
      { time: "Week 3", allow: 940, edit: 82, block: 63, review: 39, total: 1124 },
      { time: "Week 4", allow: 1071, edit: 96, block: 73, review: 44, total: 1284 }
    ]
  },
  decisionDistribution: [
    { name: "ALLOW", value: 1071, percentage: "83.4%", color: "#10b981" },
    { name: "EDIT / REGENERATE", value: 96, percentage: "7.5%", color: "#f59e0b" },
    { name: "BLOCK", value: 73, percentage: "5.7%", color: "#ef4444" },
    { name: "HUMAN REVIEW", value: 44, percentage: "3.4%", color: "#8b5cf6" }
  ],
  riskDistribution: [
    { name: "LOW RISK", value: 1071, percentage: "83.4%", color: "#10b981" },
    { name: "MEDIUM RISK", value: 140, percentage: "10.9%", color: "#f59e0b" },
    { name: "HIGH RISK", value: 73, percentage: "5.7%", color: "#ef4444" }
  ]
};
