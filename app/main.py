from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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
    application: str
    provider: str
    model: str
    business_process: str
    annual_revenue_exposure: float = Field(ge=0)
    criticality: str
    fallback_provider: str | None = None
    fallback_validated: bool = False


class AnalysisRequest(BaseModel):
    dependencies: list[DependencyInput]


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