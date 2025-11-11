# ===============================
# 🧠 AI Scrum PO Assistant - Makefile
# ===============================
# Chargement automatique du fichier .env
ifneq (,$(wildcard .env))
    include .env
    export $(shell sed 's/=.*//' .env)
endif

.PHONY: listen api test clean

# -------------------------------
# 🎧 Lancer le listener d'audio
# -------------------------------
listen:
	@echo "🎙️  Démarrage du listener..."
	PYTHONPATH=backend python -m backlog_generator.audio_listener

# -------------------------------
# 🚀 Lancer l'API FastAPI
# -------------------------------
api:
	@echo "🚀 Lancement de l'API FastAPI..."
	PYTHONPATH=backend uvicorn api.main:app --reload --app-dir backend

# -------------------------------
# 🧪 Exécuter les tests
# -------------------------------
test:
	@echo "🧪 Exécution des tests..."
	PYTHONPATH=backend pytest -s backend/tests

# -------------------------------
# 🧹 Nettoyer les fichiers temporaires
# -------------------------------
clean:
	@echo "🧹 Suppression des fichiers temporaires..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.log" -delete
