"""
FIFA Threat Shield - Backend API
ACM RVCE Code Cup 2026 - Team OG - Cybersecurity Track

Run with: uvicorn main:app --reload --port 8000
Docs auto-generated at: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os

from modules.domain_intel import get_domain_info, domain_age_risk_score
from modules.ssl_check import get_ssl_info, ssl_risk_score
from modules.osint_signal import load_osint_mentions, osint_risk_score
from modules.scoring import compute_risk_score

app = FastAPI(title="FIFA Threat Shield API")

# Allow the frontend (running on a different port/origin) to call this API.
# Wide open for hackathon speed -- tighten allow_origins before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "sample_domains.csv")


class ScanRequest(BaseModel):
    domains: list[str]


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/domains")
def list_domains():
    df = pd.read_csv(DATA_PATH)
    return {"domains": df["domain"].tolist()}


@app.post("/api/scan")
def scan_domains(req: ScanRequest):
    mentions = load_osint_mentions()
    results = []

    for domain in req.domains:
        whois_info = get_domain_info(domain)
        ssl_info = get_ssl_info(domain)

        age_score = domain_age_risk_score(whois_info["age_days"])
        ssl_score = ssl_risk_score(ssl_info)
        osint_score = osint_risk_score(domain, mentions)

        # Visual similarity placeholder until screenshot pipeline is wired in --
        # see modules/visual_similarity.py for the real imagehash comparison.
        visual_score = 85 if "fifa" in domain and domain != "fifa.com" else 10

        risk = compute_risk_score(age_score, ssl_score, visual_score, osint_score)

        results.append({
            "domain": domain,
            "risk_score": risk["overall_risk_score"],
            "classification": risk["classification"],
            "domain_age_days": whois_info["age_days"],
            "registrar": whois_info["registrar"],
            "ssl_valid": ssl_info["ssl_valid"],
            "osint_mentions": mentions.get(domain, 0),
        })

    return {"results": results}
