from fastapi import FastAPI
from pydantic import BaseModel

from evaluators.orchestrator import run_control_plane
from storage import get_dashboard_data


app = FastAPI(title="ControlPlane.ai")


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