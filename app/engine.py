from .models import AIDependency, AnalysisResult, RiskFinding


CRITICALITY_WEIGHT = {
    "low": 10,
    "medium": 25,
    "high": 40,
    "critical": 50,
}


def analyze_dependencies(
    dependencies: list[AIDependency],
) -> AnalysisResult:
    """
    Analyze AI dependencies and calculate a continuity score.

    Score starts at 100.
    Risk is deducted for:
    - critical business dependencies
    - missing fallbacks
    - unvalidated fallbacks
    - high financial exposure
    """

    if not dependencies:
        return AnalysisResult(
            continuity_score=100,
            total_dependencies=0,
            critical_dependencies=0,
            unvalidated_fallbacks=0,
            findings=[],
        )

    score = 100
    findings: list[RiskFinding] = []

    critical_dependencies = 0
    unvalidated_fallbacks = 0

    for dependency in dependencies:
        criticality = dependency.criticality.lower()

        if criticality in {"high", "critical"}:
            critical_dependencies += 1

        # Critical/high dependency without a fallback.
        if (
            criticality in {"high", "critical"}
            and not dependency.fallback_provider
        ):
            deduction = 25 if criticality == "critical" else 15
            score -= deduction

            findings.append(
                RiskFinding(
                    severity="CRITICAL" if criticality == "critical" else "HIGH",
                    title="No validated fallback provider",
                    explanation=(
                        f"{dependency.application} depends on "
                        f"{dependency.provider} for a {criticality}-critical "
                        "business process, but no fallback provider is configured."
                    ),
                    financial_exposure=dependency.annual_revenue_exposure,
                )
            )

        # Fallback exists but has never been validated.
        elif dependency.fallback_provider and not dependency.fallback_validated:
            unvalidated_fallbacks += 1
            score -= 10

            findings.append(
                RiskFinding(
                    severity="HIGH",
                    title="Fallback exists but is unvalidated",
                    explanation=(
                        f"{dependency.application} has "
                        f"{dependency.fallback_provider} configured as a "
                        "fallback, but the fallback has not been validated."
                    ),
                    financial_exposure=dependency.annual_revenue_exposure,
                )
            )

        # Large exposure increases risk.
        if dependency.annual_revenue_exposure >= 1_000_000:
            score -= 5

            findings.append(
                RiskFinding(
                    severity="HIGH",
                    title="High financial exposure",
                    explanation=(
                        f"{dependency.application} represents approximately "
                        f"${dependency.annual_revenue_exposure:,.0f} in "
                        "annual revenue exposure."
                    ),
                    financial_exposure=dependency.annual_revenue_exposure,
                )
            )

    score = max(0, min(100, score))

    return AnalysisResult(
        continuity_score=score,
        total_dependencies=len(dependencies),
        critical_dependencies=critical_dependencies,
        unvalidated_fallbacks=unvalidated_fallbacks,
        findings=findings,
    )