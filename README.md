
# ControlPlane.ai 
> **Accenture Innovation Challenge 2026 — Round 2 Prototype Development**
> An Enterprise-Grade Responsible AI Checker Layer for Real-Time Governance, Security, and Cost Telemetry.

---

##  Project Overview
`ControlPlane.ai` is a lightweight, real-time middleware abstraction layer built to solve enterprise-level Generative AI operational vulnerabilities. In a production environment, different enterprise applications (e.g., public customer bots vs. internal HR copilots) demand vastly unique latency budgets and risk profiles. 

This repository provides a modular, policy-governed control pipeline that sits between application entry points and downstream LLM orchestration layers to dynamically validate context metrics, enforce PII/Safety guards, optimize token economics, and orchestrate Human-in-the-Loop workflows.

###  Key Features Demonstrated
*   **Multi-Vector Real-Time Checks:** Intercepts prompt/response sequences to evaluate formatting anomalies, hallucinations, and safety triggers concurrently.
*   **Context-Aware Routing & Policies:** Uses custom guardrail thresholds depending on the active enterprise endpoint type.
*   **Financial Cost Telemetry:** Real-time optimization and tracking of prompt token parameters, budget efficiency, and financial consumption patterns.
*   **Human-in-the-Loop (HITL) Operations:** Seamless orchestration routing for low-confidence data structures to step-up manual review desks without interrupting system runtimes.

---

## 🛠️ Architecture & System Design
`ControlPlane.ai` strictly isolates application clients from Direct Foundation APIs, ensuring zero untrusted queries penetrate model boundaries without contextual evaluation.


[ Client App Terminals ]│▼┌──────────────────────────────┐│      ControlPlane.ai Gate    │ ◄─── (Local Governance Policies)└──────────────┬───────────────┘├──────────────────────────────┐▼ (High-Confidence)            ▼ (Low Confidence Edge Case)┌─────────────────────┐        ┌─────────────────────┐│  Foundation API/LLM │        │ Human Review Queue  │└─────────────────────┘        └─────────────────────┘


## 📦 Directory Structure
controlplane-ai/├── backend/                  # Fast API/NodeJS Core Controller│   ├── app/│   │   ├── config/           # Dynamic Policy Configurations│   │   ├── models/           # Analytical Heuristics & Embedding Logic│   │   ├── routes/           # Conversation & Telemetry Endpoints│   │   └── main.py           # Application Gateway Entry Point├── frontend/                 # React UI Dashboard Application│   ├── src/│   │   ├── components/       # Metric Gauges, Telemetry Renderers│   │   ├── views/            # Dashboard, Chat Canvas, Audit Review Desk│   │   └── App.jsx├── README.md                 # Project Documentation└── requirements.txt          # System Dependencies
---

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18.x or higher)
*   **Python** (v3.10+ or equivalent system backend runtimes)

### 1. Environment Setup
Create an `.env` file in your root workspace:
```env
PORT=5173
BACKEND_URL=http://localhost:8000
SECRET_ENCRYPTION_KEY=your_secure_hash
```

### 2. Upstream Backend Installation
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

### 3. Downstream Frontend Installation
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173/dashboard` to verify the execution trace.

---

## 💻 Technical Implementation Details

### Multi-Vector Evaluation Blueprint
Instead of utilizing standard sequential string lookups, `ControlPlane.ai` targets incoming requests through a matrixed grading process:
1. **Semantic Fit Fitment:** Evaluates text vectors to ensure prompt alignments fall within bounds.
2. **Cost Anomalies Gauge:** Instantly drops queries exceeding maximum threshold parameters before token ingestion.
3. **Escalation Trigger Verification:** Prompts falling into unstable vectors automatically yield fallback handling to prevent prompt injection loops.

---

## 📊 Live Prototype Preview
Our visual framework maps incoming signals instantly across centralized infrastructure telemetry widgets:

| View Component | Tracked Parameters | Core Functional Intent |
| :--- | :--- | :--- |
| **System Dashboard** | Total Interaction Counts, Allow/Shield Logs, Financial Estimations | Live-stream oversight metrics for administrative inspection teams. |
| **Conversation Center** | Prompts, Response Stream, Sanitization Targets | Interactive verification sandbox mapping client integrations. |
| **Human Review Desk** | Risk Score Weights, Source Auditing Lines, Override Logs | Resolves structural variance anomalies without run interruptions. |

---

## 🤝 Acknowledgments
Developed for the **Accenture Innovation Challenge 2026**. Engineered to address
