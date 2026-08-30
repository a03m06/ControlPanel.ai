from fastapi import FastAPI
from pydantic import BaseModel

from evaluators.orchestrator import run_control_plane
from storage import (
    get_dashboard_data,
    get_escalated_interactions,
    resolve_escalated_interaction
)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ControlPlane.ai")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ControlPlaneRequest(BaseModel):
    prompt: str
    reference_docs: str | None = None


@app.post("/api/control-plane")
async def control_plane(request: ControlPlaneRequest):

    result = await run_control_plane(
        prompt=request.prompt,
        reference_docs=request.reference_docs
    )

    return result


@app.get("/api/dashboard")
def dashboard():

    return get_dashboard_data()

@app.get("/api/escalate")
def escalate():

    return get_escalated_interactions()

@app.patch("/api/escalate/{interaction_id}/{new_decision}")
def resolve_escalation(
    interaction_id: int,
    new_decision: str
):

    return resolve_escalated_interaction(
        interaction_id,
        new_decision
    )