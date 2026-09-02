from app.engine import analyze_dependencies
from app.models import AIDependency


def test_critical_dependency_without_fallback_is_high_risk():
    dependencies = [
        AIDependency(
            application="Customer Support AI",
            provider="Provider A",
            model="Model X",
            business_process="Customer Support",
            annual_revenue_exposure=2_100_000,
            criticality="critical",
        )
    ]

    result = analyze_dependencies(dependencies)

    assert result.total_dependencies == 1
    assert result.critical_dependencies == 1
    assert result.continuity_score <= 70

    assert any(
        finding.title == "No validated fallback provider"
        for finding in result.findings
    )


def test_unvalidated_fallback_is_detected():
    dependencies = [
        AIDependency(
            application="Sales AI",
            provider="Provider A",
            model="Model X",
            business_process="Sales",
            annual_revenue_exposure=500_000,
            criticality="high",
            fallback_provider="Provider B",
            fallback_validated=False,
        )
    ]

    result = analyze_dependencies(dependencies)

    assert result.unvalidated_fallbacks == 1

    assert any(
        finding.title == "Fallback exists but is unvalidated"
        for finding in result.findings
    )


def test_validated_fallback_reduces_risk():
    dependencies = [
        AIDependency(
            application="Internal Assistant",
            provider="Provider A",
            model="Model X",
            business_process="Internal Operations",
            annual_revenue_exposure=100_000,
            criticality="medium",
            fallback_provider="Provider B",
            fallback_validated=True,
        )
    ]

    result = analyze_dependencies(dependencies)

    assert result.continuity_score == 100
    assert result.findings == []


def test_empty_dependency_list_is_safe():
    result = analyze_dependencies([])

    assert result.continuity_score == 100
    assert result.total_dependencies == 0
    assert result.findings == []