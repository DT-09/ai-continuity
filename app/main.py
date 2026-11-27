from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from .engine import analyze_dependencies
from .models import AIDependency

app = FastAPI(
    title="AI Continuity",
    description="Evidence-led inventory and triage of AI provider dependencies and continuity gaps.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ai-continuity.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


class DependencyInput(BaseModel):
    application: str = Field(min_length=1, max_length=120)
    provider: str = Field(min_length=1, max_length=120)
    model: str = Field(min_length=1, max_length=120)
    business_process: str = Field(min_length=1, max_length=160)
    annual_revenue_exposure: float = Field(ge=0, le=1_000_000_000_000)
    criticality: Literal["low", "medium", "high", "critical"]
    fallback_provider: str | None = Field(default=None, max_length=120)
    fallback_validated: bool = False

    @field_validator("application", "provider", "model", "business_process")
    @classmethod
    def reject_blank_required_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Field must contain non-whitespace text")
        return normalized

    @field_validator("fallback_provider")
    @classmethod
    def normalize_fallback_provider(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        return normalized or None


class AnalysisRequest(BaseModel):
    dependencies: list[DependencyInput] = Field(max_length=100)


@app.get("/")
def root():
    return {
        "service": "AI Continuity",
        "status": "online",
        "version": app.version,
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ai-continuity", "version": app.version}


@app.post("/api/analyze")
def analyze(request: AnalysisRequest):
    dependencies = [
        AIDependency(
            application=item.application,
            provider=item.provider,
            model=item.model,
            business_process=item.business_process,
            annual_revenue_exposure=item.annual_revenue_exposure,
            criticality=item.criticality,
            fallback_provider=item.fallback_provider,
            fallback_validated=item.fallback_validated,
        )
        for item in request.dependencies
    ]
    result = analyze_dependencies(dependencies)
    return {
        "assessment_type": "AI_PROVIDER_CONTINUITY_TRIAGE",
        "scoring_version": result.scoring_version,
        "risk_score": result.risk_score,
        "risk_band": result.risk_band,
        "score_semantics": (
            "Deterministic rule-based prioritisation index; not a probability, "
            "expected-loss estimate, audit opinion or certification."
        ),
        "total_dependencies": result.total_dependencies,
        "critical_dependencies": result.critical_dependencies,
        "unvalidated_fallbacks": result.unvalidated_fallbacks,
        "findings": [
            {
                "rule_id": finding.rule_id,
                "severity": finding.severity,
                "points": finding.points,
                "title": finding.title,
                "explanation": finding.explanation,
                "financial_exposure": finding.financial_exposure,
                "recommended_action": finding.recommended_action,
                "evidence_status": finding.evidence_status,
            }
            for finding in result.findings
        ],
    }
