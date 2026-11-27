from dataclasses import dataclass, field


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
    rule_id: str
    severity: str
    points: int
    title: str
    explanation: str
    financial_exposure: float
    recommended_action: str
    evidence_status: str


@dataclass
class AnalysisResult:
    risk_score: int | None
    risk_band: str
    total_dependencies: int
    critical_dependencies: int
    unvalidated_fallbacks: int
    findings: list[RiskFinding] = field(default_factory=list)
    scoring_version: str = "1.0"
