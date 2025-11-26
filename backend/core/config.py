from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 🔐 Auth / JWT
    JWT_SECRET: str = "change-me-in-prod"
    JWT_ALGO: str = "HS256"  # ✅ ajouté ici
    JWT_EXPIRE_MIN: int = 60

    # 🎧 APIs externes
    GROQ_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None

    # 🧩 Jira Integration
    JIRA_URL: str | None = None
    JIRA_EMAIL: str | None = None
    JIRA_API_TOKEN: str | None = None
    JIRA_PROJECT_KEY: str | None = None

    # 🗂️ Base de données
    MINDLOOP_DB_PATH: str = "input/db/mindloop.sqlite"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
