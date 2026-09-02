from dataclasses import dataclass, field
from typing import List


@dataclass
class AIDependency:
    application: str
    provider: str
    model: str
    business_process: str
    annual_revenue_exposure: float
    criticality: str
    fallback_provider: str | None = None
    fallback_validated: bool = False


@dataclass
class RiskFinding:
    severity: str
    title: str
    explanation: str
    financial_exposure: float


@dataclass
class AnalysisResult:
    continuity_score: int
    total_dependencies: int
    critical_dependencies: int
    unvalidated_fallbacks: int
    findings: List[RiskFinding] = field(default_factory=list)