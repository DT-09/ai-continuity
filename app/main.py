from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from .engine import analyze_dependencies
from .models import AIDependency


app = FastAPI(
    title="AI Continuity",
    description="AI dependency and business continuity risk analysis.",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ai-continuity.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "ai-continuity",
    }


@app.post("/api/analyze")
def analyze(request: AnalysisRequest):
    dependencies = [
        AIDependency(
            application=dependency.application,
            provider=dependency.provider,
            model=dependency.model,
            business_process=dependency.business_process,
            annual_revenue_exposure=dependency.annual_revenue_exposure,
            criticality=dependency.criticality,
            fallback_provider=dependency.fallback_provider,
            fallback_validated=dependency.fallback_validated,
        )
        for dependency in request.dependencies
    ]

    result = analyze_dependencies(dependencies)

    return {
        "continuity_score": result.continuity_score,
        "total_dependencies": result.total_dependencies,
        "critical_dependencies": result.critical_dependencies,
        "unvalidated_fallbacks": result.unvalidated_fallbacks,
        "findings": [
            {
                "severity": finding.severity,
                "title": finding.title,
                "explanation": finding.explanation,
                "financial_exposure": finding.financial_exposure,
            }
            for finding in result.findings
        ],
    }