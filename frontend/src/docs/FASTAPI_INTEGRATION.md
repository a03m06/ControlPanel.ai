# ControlPlane.ai — FastAPI Integration Guide

This document outlines the API contracts and instructions for connecting the **ControlPlane.ai** React frontend with your FastAPI backend.

---

## 1. Environment Configuration

To point the frontend to your live FastAPI backend, create a `.env` file in the project root:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
```

When `VITE_API_BASE_URL` is omitted or empty, the frontend automatically runs in **Mock Simulation Mode** with session persistence in `localStorage`.

---

## 2. API Endpoints Contract

### A. Run Evaluation (Real-Time Pipeline)
- **Method**: `POST`
- **Path**: `/api/v1/evaluate`
- **Request Body**:
```json
{
  "prompt": "Can you retrieve customer John Doe's identity verification records for audit filing?",
  "response": "Customer John Doe has SSN: 334-12-8891, Phone: +1 555-892-1029."
}
```
- **Response (200 OK)**:
```json
{
  "performance_score": 82,
  "cost_score": 91,
  "safety_score": 95,
  "issues": [
    "possible hallucination"
  ],
  "confidence": 74,
  "decision": "HUMAN REVIEW",
  "reason": "Unverified numerical claim detected in financial response."
}
```

---

### B. Dashboard Telemetry
- **Method**: `GET`
- **Path**: `/api/v1/dashboard/stats`
- **Response (200 OK)**:
```json
{
  "summary": {
    "totalEvaluations": 1284,
    "allow": 1071,
    "block": 73,
    "humanReview": 44,
    "editRegenerate": 96
  },
  "scores": {
    "performance": {
      "score": 82,
      "riskLevel": "MEDIUM",
      "explanation": "Good semantic relevance across responses."
    },
    "cost": {
      "score": 91,
      "riskLevel": "LOW",
      "explanation": "Token generation efficiency remains optimal."
    },
    "responsibility": {
      "score": 95,
      "riskLevel": "LOW",
      "explanation": "Robust safety filters. Presidio PII scanning active."
    }
  },
  "recentHighRiskEvents": [
    {
      "id": "1025",
      "title": "PII detected",
      "description": "Direct SSN detected in response.",
      "risk": "HIGH",
      "decision": "BLOCK",
      "timestamp": "2 mins ago",
      "performanceScore": 90,
      "costScore": 88,
      "responsibilityScore": 25,
      "issues": ["SSN detected"]
    }
  ]
}
```

---

### C. Event Detail
- **Method**: `GET`
- **Path**: `/api/v1/events/{id}`
- **Response (200 OK)**:
```json
{
  "request": {
    "id": "1025",
    "timestamp": "2026-08-25T20:58:12Z",
    "prompt": "Can you retrieve customer records?",
    "application": "Customer Support",
    "model": "gpt-4o-enterprise"
  },
  "llm_response": {
    "fullText": "Full model response text...",
    "tokenCount": 48,
    "latencyMs": 210
  },
  "performance": {
    "score": 90,
    "confidence": 96,
    "issues": [],
    "explanation": "Adhered to user directives."
  },
  "cost": {
    "score": 88,
    "expectedTokens": 40,
    "actualTokens": 48,
    "tokenRatio": 1.2,
    "costUsd": 0.00072
  },
  "responsibility": {
    "score": 25,
    "riskLevel": "HIGH",
    "detectedPii": [
      { "type": "US_SSN", "text": "334-12-8891", "confidence": 0.99, "severity": "CRITICAL" }
    ],
    "sensitiveInfo": "PII leaked in payload.",
    "unsafeContent": "GDPR violation"
  },
  "decision": {
    "finalDecision": "BLOCK",
    "ruleMatched": "RULE-RESP-001",
    "reason": "High-risk PII detected in raw response."
  }
}
```

---

### D. Human Review Queue
- **Method**: `GET`
- **Path**: `/api/v1/review/queue`
- **Method**: `POST`
- **Path**: `/api/v1/review/{id}`
- **Request Body**:
```json
{
  "action": "APPROVE", 
  "notes": "Verified rate prospectus"
}
```
*(Action values: `APPROVE` or `REJECT`)*

---

### E. Analytics
- **Method**: `GET`
- **Path**: `/api/v1/analytics?range=24h`
- **Response**: Historical trends for performance, cost, safety, throughput volume, and decision distributions.
