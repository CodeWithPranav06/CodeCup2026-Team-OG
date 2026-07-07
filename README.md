# FIFA Threat Shield

**ACM RVCE Code Cup 2026 · Cybersecurity Track · Team OG**
Pranav MP (1RV25CS129, Team Lead) · C Manmohan Gowda (1RV25CS043)

A real-time intelligence platform that scans and scores suspicious FIFA-related
domains for fraud risk — fake ticketing portals, phishing campaigns, and
impersonation sites — and surfaces the results on a live analyst dashboard.

## Problem Statement

**PS7: FIFA Scam, Fraud & Piracy Intelligence Platform.** The FIFA ecosystem is
a high-value target during major tournaments: fake ticketing portals, phishing
campaigns, illegal streams, and malware disguised as official FIFA services.
This platform detects, scores, and visualizes these threats in near real-time.

## How It Works

Four independent signals are fused into a single 0–100 risk score:

| Signal | Weight | Method |
|---|---|---|
| Domain age | 30% | WHOIS lookup — newer domains are riskier |
| SSL validity | 15% | TLS certificate inspection |
| Visual similarity | 35% | Perceptual hashing vs. official reference pages |
| OSINT mentions | 20% | Scam-campaign mention frequency |

## Project Structure
|__ Backend/    # FastAPI server + risk scoring engine
|__ Frontend/   # React dashboard (Vite + Tailwind)

## Running It

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev
```

## MVP Scope Notes (Honest Disclosure)

Built in a 48-hour sprint:
- **WHOIS + SSL checks run live** against real domains.
- **OSINT signals are simulated** via curated data for this MVP. Production
  would connect live APIs (Reddit, Telegram, X) for real-time monitoring.
- **Visual similarity** uses perceptual hashing against reference screenshots.
