"""
consolidator.py
---------------
Consolide, nettoie, pondère et priorise automatiquement les User Stories générées.
"""

import re
from difflib import SequenceMatcher

# -------------------------
# 🧰 1. Utilitaires
# -------------------------
def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())

def _similar(a: str, b: str) -> float:
    return SequenceMatcher(None, _normalize(a), _normalize(b)).ratio()

def _looks_like_prompt_artifact(title: str) -> bool:
    """Filtre les artefacts du LLM (ex: 'Voici un titre court...')."""
    bad_prefixes = [
        "voici un titre", "exemple de titre", "titre de la user story", 
        "exemple :", "suggestion :", "titre court", "titre possible"
    ]
    t = _normalize(title)
    return any(t.startswith(p) for p in bad_prefixes)

# -------------------------
# 🧩 2. Normalisation des thèmes
# -------------------------
def normalize_theme(theme: str) -> str:
    t = _normalize(theme)
    if any(k in t for k in ["températur", "danger", "sécurité", "alerte"]):
        return "Alerte environnementale"
    elif any(k in t for k in ["prévision", "météo", "climat"]):
        return "Prévisions météo"
    elif any(k in t for k in ["randonneur", "alpiniste", "montagne"]):
        return "Expérience rando & alpinisme"
    elif any(k in t for k in ["feedback", "expérience", "interface", "fidélité"]):
        return "Expérience utilisateur"
    elif any(k in t for k in ["communauté", "profil", "partage", "notation", "contribution"]):
        return "Engagement & communauté"
    return theme.strip().capitalize()

# -------------------------
# ⚖️ 3. Attribution automatique de priorité
# -------------------------
def auto_priority(story: str, theme: str) -> str:
    s = _normalize(story)
    t = _normalize(theme)

    if any(k in s for k in ["sécurité", "alerte", "danger", "crash", "urgence"]):
        return "Haute"
    if any(k in t for k in ["météo", "prévision", "fiabilité", "maintenance"]):
        return "Moyenne"
    if any(k in t for k in ["fidélité", "chat", "contenu", "recommandation"]):
        return "Basse"
    return "Moyenne"


# -------------------------
# 🧠 4. Nouveau : calcul de pertinence (score 0–5)
# -------------------------
def compute_relevance(story: dict) -> float:
    """
    Évalue la pertinence d'une US sur une échelle de 0 à 5
    selon son impact produit et sa clarté.
    """
    text = f"{story['user_story']} {story.get('idea', '')}".lower()
    score = 0

    # Impact fort
    if any(k in text for k in ["sécurité", "alerte", "danger", "panne", "risque"]):
        score += 1.5
    if any(k in text for k in ["utilisateur", "client", "expérience", "satisfaction"]):
        score += 1
    if any(k in text for k in ["temps réel", "automatique", "intelligent", "instantané"]):
        score += 0.5
    if any(k in text for k in ["planifier", "prévision", "anticiper"]):
        score += 0.5
    if any(k in text for k in ["communauté", "partager", "collaborer", "noter"]):
        score += 0.5

    # Qualité rédactionnelle
    if len(story.get("acceptance_criteria", [])) >= 3:
        score += 1
    if len(text.split()) > 15:
        score += 0.5

    return round(min(score, 5), 2)


# -------------------------
# 🔁 5. Fusion et pondération des US similaires
# -------------------------
def consolidate_user_stories(stories: list[dict], threshold: float = 0.72) -> list[dict]:
    """
    Fusionne les US similaires, nettoie les artefacts,
    attribue priorité + pertinence, puis trie par valeur produit.
    """
    merged = []

    for s in stories:
        # Nettoyage du titre
        if _looks_like_prompt_artifact(s["title"]):
            s["title"] = s["title"].split(":", 1)[-1].strip().capitalize()

        # Normalisation et scoring
        s["theme"] = normalize_theme(s["theme"])
        s["priority"] = auto_priority(s["user_story"], s["theme"])
        s["relevance_score"] = compute_relevance(s)

        duplicate = None
        for m in merged:
            if (
                _similar(s["title"], m["title"]) > threshold
                or _similar(s["idea"], m["idea"]) > threshold
                or _similar(s["user_story"], m["user_story"]) > threshold
            ):
                duplicate = m
                break

        if duplicate:
            # Fusion des critères et pondération moyenne
            combined_criteria = list(set(duplicate["acceptance_criteria"] + s["acceptance_criteria"]))
            duplicate["acceptance_criteria"] = combined_criteria
            duplicate["relevance_score"] = round((duplicate["relevance_score"] + s["relevance_score"]) / 2, 2)
        else:
            merged.append(s)

    # Tri final par pertinence décroissante
    merged = sorted(merged, key=lambda x: x["relevance_score"], reverse=True)

    return merged
