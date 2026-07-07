"""
Domain Intelligence Module
Fetches WHOIS data for a domain: registration age, registrar.
Includes a fallback mock mode so the demo never breaks if the network
or the WHOIS server is unavailable during a live presentation.
"""

import whois
from datetime import datetime, timezone


def _coerce_date(value):
    """python-whois sometimes returns a list of dates instead of one."""
    if isinstance(value, list):
        value = value[0]
    if value and value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value


def get_domain_info(domain: str) -> dict:
    """
    Returns a dict with:
        domain, age_days, registrar, creation_date, whois_ok (bool)
    Falls back to a clearly-marked mock result if the lookup fails,
    so a flaky network never kills a live demo.
    """
    try:
        w = whois.whois(domain)
        creation_date = _coerce_date(w.creation_date)

        if creation_date is None:
            raise ValueError("No creation date returned")

        age_days = (datetime.now(timezone.utc) - creation_date).days
        registrar = w.registrar or "Unknown"

        return {
            "domain": domain,
            "age_days": age_days,
            "registrar": registrar,
            "creation_date": str(creation_date.date()),
            "whois_ok": True,
        }

    except Exception as e:
        # Fallback: mark clearly as unresolved rather than guessing.
        return {
            "domain": domain,
            "age_days": None,
            "registrar": "Lookup failed",
            "creation_date": None,
            "whois_ok": False,
            "error": str(e),
        }


def domain_age_risk_score(age_days) -> int:
    """
    Newer domains are riskier. Returns 0-100 (higher = riskier).
    Tuned for demo purposes; thresholds can be adjusted with real data.
    """
    if age_days is None:
        return 50  # unknown -> moderate default, don't silently pass it
    if age_days < 7:
        return 100
    if age_days < 30:
        return 85
    if age_days < 90:
        return 60
    if age_days < 365:
        return 30
    return 5


if __name__ == "__main__":
    # quick manual test
    for d in ["google.com", "fifa.com"]:
        print(get_domain_info(d))
