"""
OSINT Signal Module (MVP / Simulated)

Live scraping of Reddit/Telegram/Twitter requires API keys, auth
approval, and rate-limit handling that isn't realistic to build
solidly in a 48-hour sprint. For the MVP, this module reads
mention-frequency data from a curated CSV that simulates what a
real OSINT pipeline would surface.

Be upfront about this in the demo: "This is simulated for the MVP;
production would plug into live social/messaging APIs here."
"""

import csv
import os

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "osint_mentions.csv")


def load_osint_mentions() -> dict:
    """Returns {domain: mention_count} from the curated CSV."""
    mentions = {}
    if not os.path.exists(DATA_PATH):
        return mentions
    with open(DATA_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            mentions[row["domain"]] = int(row["mention_count"])
    return mentions


def osint_risk_score(domain: str, mentions: dict = None) -> int:
    """
    More scam-related social mentions -> higher risk.
    Returns 0-100.
    """
    if mentions is None:
        mentions = load_osint_mentions()
    count = mentions.get(domain, 0)

    if count == 0:
        return 5
    if count < 5:
        return 30
    if count < 20:
        return 60
    return 90


if __name__ == "__main__":
    m = load_osint_mentions()
    print(m)
