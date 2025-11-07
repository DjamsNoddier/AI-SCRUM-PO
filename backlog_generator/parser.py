"""
parser.py
---------
Module responsable du nettoyage et de la segmentation du feedback utilisateur brut.
Fait partie du projet : AI Scrum PO Assistant
Auteur : Djamil
"""

import re

def clean_text(text: str) -> str:
    """
    Nettoie un texte brut :
    - supprime les puces ( -, *, •, 1. etc.)
    - normalise les espaces et retours à la ligne
    - enlève les espaces inutiles avant la ponctuation
    """
    if not text:
        return ""

    # Supprimer les retours Windows et uniformiser
    t = text.replace("\r", "\n")

    # Supprimer les puces et numéros de liste
    t = re.sub(r"^\s*([-*•]|\d+[.)])\s+", "", t, flags=re.MULTILINE)

    # Supprimer les espaces multiples
    t = re.sub(r"[ \t]+", " ", t)

    # Réduire les sauts de ligne consécutifs à un seul
    t = re.sub(r"\n{3,}", "\n\n", t)

    # Nettoyer les espaces avant la ponctuation
    t = re.sub(r"\s+([.,!?;:])", r"\1", t)

    # Supprimer les espaces au début et à la fin
    return t.strip()

def split_ideas(text: str, min_len: int = 8) -> list[str]:
    """
    Découpe le texte nettoyé en idées exploitables pour la génération d'US.
    - Si des puces sont présentes, découpe par lignes
    - Sinon, découpe par ponctuation (.!?;)
    - Ignore les fragments trop courts (< min_len)
    - Supprime les doublons en gardant l'ordre
    - Supprime les fragments non pertinents comme 'ok', '+1', etc.
    """
    if not text:
        return []

    # Détection de puces dans le texte
    has_bullets = any(sym in text for sym in ["-", "*", "•", "\n-"])

    # Découpage
    if has_bullets:
        candidates = [line.strip(" -*•\t") for line in text.splitlines()]
    else:
        # On remplace les retours ligne par un séparateur de phrase
        text = re.sub(r"\n+", ". ", text)
        candidates = re.split(r"[.!?;]+", text)

    # Nettoyage et filtrage
    ignore_list = {"ok", "+1", "oui", "non", "rien"}
    ideas = []
    seen = set()

    for c in candidates:
        c = c.strip()
        if len(c) >= min_len and c.lower() not in ignore_list:
            key = c.lower()
            if key not in seen:
                seen.add(key)
                ideas.append(c)

    return ideas

def parse_feedback(text: str, min_len: int = 8) -> list[str]:
    """
    Pipeline complet : nettoie le texte et en extrait les idées principales.
    - Utilise clean_text() puis split_ideas()
    - Ignore les fragments trop courts
    """
    cleaned = clean_text(text)
    ideas = split_ideas(cleaned, min_len=min_len)
    # Dernier filtre de sécurité
    final = [i for i in ideas if len(i) >= min_len]
    return final
