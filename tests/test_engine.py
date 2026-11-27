from app.engine import analyze_dependencies
from app.models import AIDependency


def dependency(**overrides):
    values = dict(
        application="Customer Support AI",
        provider="Provider A",
        model="Model X",
        business_process="Customer Support",
        annual_revenue_exposure=0,
        criticality="critical",
        fallback_provider=None,
        fallback_validated=False,
    )
    values.update(overrides)
    return AIDependency(**values)


def test_empty_inventory_is_unknown_not_perfect():
    result = analyze_dependencies([])
    assert result.risk_score is None
    assert result.risk_band == "UNKNOWN"
    assert result.total_dependencies == 0
    assert result.findings == []


def test_critical_dependency_without_fallback_is_flagged():
    result = analyze_dependencies([dependency()])
    assert result.risk_score == 30
    assert result.risk_band == "MODERATE"
    assert result.critical_dependencies == 1
    assert result.findings[0].rule_id == "CONT-001"
    assert result.findings[0].recommended_action


def test_unvalidated_fallback_is_flagged():
    result = analyze_dependencies([dependency(
        criticality="high",
        fallback_provider="Provider B",
        fallback_validated=False,
    )])
    assert result.unvalidated_fallbacks == 1
    assert any(f.rule_id == "CONT-002" for f in result.findings)


def test_validated_fallback_does_not_create_fallback_finding():
    result = analyze_dependencies([dependency(
        criticality="medium",
        fallback_provider="Provider B",
        fallback_validated=True,
    )])
    assert result.risk_score == 0
    assert result.findings == []


def test_high_declared_exposure_is_context_not_claimed_loss():
    result = analyze_dependencies([dependency(
        criticality="low",
        annual_revenue_exposure=2_100_000,
        fallback_provider="Provider B",
        fallback_validated=True,
    )])
    finding = next(f for f in result.findings if f.rule_id == "CONT-003")
    assert finding.financial_exposure == 2_100_000
    assert "not estimated loss" in finding.explanation


def test_score_is_bounded_and_average_normalized():
    result = analyze_dependencies([
        dependency(),
        dependency(application="Second", annual_revenue_exposure=2_000_000),
    ])
    assert 0 <= result.risk_score <= 100
    assert result.total_dependencies == 2
