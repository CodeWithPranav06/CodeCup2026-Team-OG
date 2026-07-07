"""
Weighted Risk Scoring Engine
Combines domain age, SSL, visual similarity, and OSINT mention
frequency into a single 0-100 risk score plus a threat classification.
"""

WEIGHTS = {
    "domain_age": 0.30,
    "ssl": 0.15,
    "visual": 0.35,
    "osint": 0.20,
}


def compute_risk_score(domain_age_score, ssl_score, visual_score, osint_score) -> dict:
    """
    Each input score is 0-100 (higher = riskier).
    Returns overall score + classification + explanation breakdown.
    """
    overall = (
        domain_age_score * WEIGHTS["domain_age"]
        + ssl_score * WEIGHTS["ssl"]
        + visual_score * WEIGHTS["visual"]
        + osint_score * WEIGHTS["osint"]
    )
    overall = round(overall, 1)

    if overall >= 75:
        classification = "High Risk - Likely Scam"
    elif overall >= 45:
        classification = "Medium Risk - Investigate"
    else:
        classification = "Low Risk"

    return {
        "overall_risk_score": overall,
        "classification": classification,
        "breakdown": {
            "domain_age_contribution": round(domain_age_score * WEIGHTS["domain_age"], 1),
            "ssl_contribution": round(ssl_score * WEIGHTS["ssl"], 1),
            "visual_contribution": round(visual_score * WEIGHTS["visual"], 1),
            "osint_contribution": round(osint_score * WEIGHTS["osint"], 1),
        },
    }


if __name__ == "__main__":
    result = compute_risk_score(
        domain_age_score=100, ssl_score=55, visual_score=95, osint_score=80
    )
    print(result)
