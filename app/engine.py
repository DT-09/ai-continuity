from .models import AIDependency, AnalysisResult, RiskFinding

# Transparent rule weights. These are triage heuristics, not calibrated probabilities.
CRITICALITY_POINTS = {"low": 5, "medium": 10, "high": 20, "critical": 30}
EXPOSURE_THRESHOLD = 1_000_000


def analyze_dependencies(dependencies: list[AIDependency]) -> AnalysisResult:
    """Return a deterministic, explainable dependency-risk assessment.

    The score is a prioritisation index (0-100), not a probability of outage,
    expected loss, or assurance certification. Empty inventories are UNKNOWN.
    """
    if not dependencies:
        return AnalysisResult(
            risk_score=None,
            risk_band="UNKNOWN",
            total_dependencies=0,
            critical_dependencies=0,
            unvalidated_fallbacks=0,
            findings=[],
            scoring_version="1.0",
        )

    findings: list[RiskFinding] = []
    critical_dependencies = 0
    unvalidated_fallbacks = 0
    raw_points = 0

    for dependency in dependencies:
        criticality = dependency.criticality.lower()
        if criticality in {"high", "critical"}:
            critical_dependencies += 1

        def add(rule_id: str, points: int, severity: str, title: str,
                explanation: str, action: str) -> None:
            nonlocal raw_points
            raw_points += points
            findings.append(RiskFinding(
                rule_id=rule_id,
                severity=severity,
                points=points,
                title=title,
                explanation=explanation,
                financial_exposure=dependency.annual_revenue_exposure,
                recommended_action=action,
                evidence_status="USER_SUPPLIED",
            ))

        if criticality in {"high", "critical"} and not dependency.fallback_provider:
            points = 30 if criticality == "critical" else 20
            add(
                "CONT-001", points,
                "CRITICAL" if criticality == "critical" else "HIGH",
                "No fallback provider is configured",
                f"{dependency.application} depends on {dependency.provider} "
                f"for a {criticality}-critical process and has no fallback recorded.",
                "Document an alternative provider or an explicit manual continuity procedure; "
                "then test the recovery path.",
            )
        elif dependency.fallback_provider and not dependency.fallback_validated:
            unvalidated_fallbacks += 1
            add(
                "CONT-002", 15, "HIGH", "Fallback is not validated",
                f"{dependency.fallback_provider} is recorded as a fallback for "
                f"{dependency.application}, but no validation is recorded.",
                "Run and retain a controlled failover test, including quality, latency, "
                "capacity, data portability and rollback checks.",
            )

        if dependency.annual_revenue_exposure >= EXPOSURE_THRESHOLD:
            add(
                "CONT-003", 10, "MEDIUM", "Material revenue exposure is declared",
                f"The dependency is associated with "
                f"${dependency.annual_revenue_exposure:,.0f} in user-declared annual "
                "revenue exposure. This is prioritisation context, not estimated loss.",
                "Confirm the exposure basis, time period, attribution and business owner.",
            )

    risk_score = min(100, round(raw_points / len(dependencies)))
    risk_band = (
        "LOW" if risk_score < 20 else
        "MODERATE" if risk_score < 40 else
        "HIGH" if risk_score < 70 else "CRITICAL"
    )
    return AnalysisResult(
        risk_score=risk_score,
        risk_band=risk_band,
        total_dependencies=len(dependencies),
        critical_dependencies=critical_dependencies,
        unvalidated_fallbacks=unvalidated_fallbacks,
        findings=findings,
        scoring_version="1.0",
    )
