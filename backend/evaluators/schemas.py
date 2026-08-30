from pydantic import BaseModel, Field
from typing import List


class EvaluationResult(BaseModel):
    performance_score: int = Field(..., ge=0, le=100)
    cost_score: int = Field(..., ge=0, le=100)
    safety_score: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)
    issues: List[str] = Field(default_factory=list)
    total_tokens: int = 0
    estimated_cost_usd: float = 0.0