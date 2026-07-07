"""
SSL/TLS Certificate Validation Module
Connects to the domain on port 443 and inspects the certificate
for validity, issuer, and expiry.
"""

import ssl
import socket
from datetime import datetime


def get_ssl_info(domain: str, timeout: float = 5.0) -> dict:
    """
    Returns a dict with:
        domain, ssl_valid (bool), issuer, expires, days_to_expiry
    """
    context = ssl.create_default_context()
    try:
        with socket.create_connection((domain, 443), timeout=timeout) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()

        issuer = dict(x[0] for x in cert.get("issuer", []))
        issuer_name = issuer.get("organizationName", issuer.get("commonName", "Unknown"))

        expires_str = cert.get("notAfter")
        expires = datetime.strptime(expires_str, "%b %d %H:%M:%S %Y %Z")
        days_to_expiry = (expires - datetime.utcnow()).days

        return {
            "domain": domain,
            "ssl_valid": True,
            "issuer": issuer_name,
            "expires": str(expires.date()),
            "days_to_expiry": days_to_expiry,
        }

    except Exception as e:
        return {
            "domain": domain,
            "ssl_valid": False,
            "issuer": None,
            "expires": None,
            "days_to_expiry": None,
            "error": str(e),
        }


def ssl_risk_score(ssl_info: dict) -> int:
    """
    A valid, well-known cert lowers risk. No/self-signed cert raises it.
    Note: scammers increasingly DO get valid SSL certs (e.g. via Let's
    Encrypt), so this signal alone is weak -- that's exactly why we
    combine it with domain age + visual similarity in the final score.
    """
    if not ssl_info.get("ssl_valid"):
        return 90
    issuer = (ssl_info.get("issuer") or "").lower()
    if "let's encrypt" in issuer or "letsencrypt" in issuer:
        return 55  # valid but free/instant issuance -> mildly elevated
    return 15


if __name__ == "__main__":
    for d in ["google.com", "fifa.com"]:
        info = get_ssl_info(d)
        print(info, "-> risk:", ssl_risk_score(info))
