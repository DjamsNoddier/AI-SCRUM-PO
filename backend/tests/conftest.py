import sys
from types import SimpleNamespace

# Mock complet de la lib "groq" pour les tests
sys.modules["groq"] = SimpleNamespace(Groq=lambda api_key=None: None)
