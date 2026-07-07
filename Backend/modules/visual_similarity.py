"""
Visual Similarity Module
Uses perceptual hashing (imagehash) to compare a candidate site
screenshot against a reference screenshot of the real FIFA page.

For the MVP/demo: screenshots are pre-captured images placed in
data/reference/ (official) and data/candidates/ (suspicious sites).
Live automated screenshotting (via Selenium/Playwright) is a
stretch goal -- call this out honestly in the demo if not done.
"""

from PIL import Image
import imagehash
import os

REFERENCE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "reference")


def compute_similarity(reference_path: str, candidate_path: str) -> float:
    """
    Returns a similarity score 0-100 (100 = visually identical).
    Uses perceptual hash Hamming distance.
    """
    ref_hash = imagehash.phash(Image.open(reference_path))
    cand_hash = imagehash.phash(Image.open(candidate_path))

    max_distance = len(ref_hash.hash) ** 2  # phash is typically 64 bits
    distance = ref_hash - cand_hash
    similarity_pct = max(0.0, 100 * (1 - distance / max_distance))
    return round(similarity_pct, 2)


def visual_risk_score(similarity_pct: float) -> int:
    """
    Higher visual similarity to the official page = higher risk
    (it means someone is impersonating the real site).
    """
    if similarity_pct >= 90:
        return 95
    if similarity_pct >= 75:
        return 75
    if similarity_pct >= 50:
        return 40
    return 10


if __name__ == "__main__":
    ref = os.path.join(REFERENCE_DIR, "fifa_official.png")
    # example candidate -- replace with a real screenshot for testing
    cand = os.path.join(REFERENCE_DIR, "fifa_official.png")
    sim = compute_similarity(ref, cand)
    print(f"Similarity: {sim}% -> risk: {visual_risk_score(sim)}")
