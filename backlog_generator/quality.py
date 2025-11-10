"""
quality.py
----------
Utilitaires de qualité :
- Filtrer les idées non actionnables / bruit
- Dédupliquer sémantiquement
- Valider la forme d'une User Story
"""

import re
from difflib import SequenceMatcher

META_PATTERNS = [
    r"\b(j(e|’)\s*suis prêt|veuillez fournir|pas de texte|merci de fournir|j'aurais besoin du texte)\b",
    r"\b(segmenter|format spécifique|générer des sorties|ateliers? produit)\b",
    r"^en tant que \[type d’utilisateur\]",
    r"\b\.\.\.|^\s*—\s*$",
]

ACTION_PATTERNS = [
    r"\b(ajouter|améliorer|accéder|afficher|recevoir|personnaliser|configurer|prévenir|alerter|planifier|rechercher|filtrer|trier|télécharger|notifier|suggérer|mesurer|exporter|assigner)\b",
]

PLACEHOLDER_PATTERNS = [
    r"\b(en tant que .+ je veux \.\.\. afin de)\b",
    r"\b\[\s*(titre du thème|type d’utilisateur)\s*\]\b",
]


def _normalize(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"\s+", " ", s)
    return s


def is_actionable(sentence: str) -> bool:
    s = _normalize(sentence)
    if len(s.split()) < 4:
        return False
    for pat in META_PATTERNS + PLACEHOLDER_PATTERNS:
        if re.search(pat, s):
            return False
    return any(re.search(p, s) for p in ACTION_PATTERNS)


def filter_relevant_ideas(ideas: list[str], min_len: int = 10, max_len: int = 220) -> list[str]:
    """
    Garde les idées actionnables, non vides, de longueur raisonnable,
    et supprime le bruit évident.
    """
    cleaned = []
    seen = set()
    for idea in ideas:
        if not idea:
            continue
        i = idea.strip()
        if len(i) < min_len or len(i) > max_len:
            continue
        if not is_actionable(i):
            continue
        key = _normalize(i)
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(i)
    return cleaned


def _similar(a: str, b: str) -> float:
    # Similarité simple (stdlib) — suffisant pour un MVP
    return SequenceMatcher(None, _normalize(a), _normalize(b)).ratio()


def semantic_deduplicate(ideas: list[str], threshold: float = 0.82) -> list[str]:
    """
    Supprime les doublons sémantiques (idées quasi identiques).
    Conserve la première occurrence.
    """
    result = []
    for idea in ideas:
        if not any(_similar(idea, kept) >= threshold for kept in result):
            result.append(idea)
    return result


def validate_user_story_format(story: dict) -> bool:
    """
    Vérifie que la User Story est exploitable :
    - 'user_story' contient 'En tant que' et 'afin de'
    - présence de 3 à 7 critères d’acceptation
    - priorité non vide
    """
    if not story:
        return False

    us = (story.get("user_story") or "").strip()
    if not us or "en tant que" not in us.lower() or "afin de" not in us.lower():
        return False

    ac = story.get("acceptance_criteria") or []
    if not isinstance(ac, list) or not (3 <= len(ac) <= 7):
        return False

    priority = (story.get("priority") or "").strip()
    if not priority:
        return False

    # Optionnel : longueur raisonnable
    if len(us) < 40 or len(us) > 600:
        return False

    return True
