# 🧠 AI Scrum PO Assistant — Backend

**AI Scrum PO Assistant** is an intelligent Product Management assistant that automatically transforms workshop discussions and meeting recordings into **actionable User Stories** — ready for Jira integration.
It listens, understands, and structures product conversations like a real Product Owner — in seconds.

---

## 🚀 Overview

This **backend (V1)** handles:

* 🎤 Real-time audio recording from the terminal
* 🧠 Transcription via **Groq Whisper API**
* 🧩 Semantic segmentation & User Story generation
* 📊 Session analysis and structured summaries
* 🌐 REST API exposure via **FastAPI**

---

## 🧩 Architecture

```
ai_scrum_po/
├── backend/
│   ├── api/                      # REST API (FastAPI)
│   │   └── main.py
│   ├── backlog_generator/        # Main processing pipeline
│   │   ├── audio_listener.py     # Audio recording + orchestration
│   │   ├── audio_transcriber.py  # Transcription & segmentation
│   │   ├── generator.py          # User Story generation (LLM)
│   │   ├── session_summary.py    # Session summary & validation
│   │   ├── logger_manager.py     # Structured logging manager
│   │   └── __init__.py
│   ├── tests/                    # Unit & integration tests
│   │   ├── test_api_sessions.py
│   │   ├── test_audio_listener.py
│   │   ├── test_audio_logger.py
│   │   ├── test_audio_summary.py
│   │   └── test_logger_manager.py
│   └── __init__.py
├── Makefile                      # Simplified CLI commands
├── requirements.txt              # Python dependencies
├── pytest.ini                    # Pytest configuration
└── README.md                     # Documentation
```

---

## ⚙️ Installation

### 🧮 Requirements

* **Python 3.10+**
* **Groq API key** (for transcription)
* *(Optional)* Jira API credentials for story export

### 🔧 Setup

```bash
git clone <repo_url>
cd ai_scrum_po
python -m venv venv
source venv/bin/activate   # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

### 🔐 Environment Configuration

Create a `.env` file at the root:

```bash
GROQ_API_KEY=your_groq_api_key
```

> ⚠️ Don’t push this file to GitHub (already ignored in `.gitignore`).

---

## 🧑‍💻 Usage

### 🎧 Record an Audio Session (Terminal)

Start listening and trigger the full pipeline:

```bash
make listen
```

Resulting output:

```
input/sessions/session_2025-11-11_1219/
├── audio.wav
├── metadata.json
└── summary.json
```

Each session is automatically transcribed, segmented, scored, and summarized.

---

### 🌐 REST API (FastAPI)

Start the API server:

```bash
make api
```

Access the API here:
🔗 [http://127.0.0.1:8000](http://127.0.0.1:8000)

#### Main Endpoint

```
GET /api/sessions/latest
```

#### Example JSON Response

```json
{
  "session_id": "session_2025-11-11_1219",
  "audio_path": "input/sessions/session_2025-11-11_1219/audio.wav",
  "score_global": 0.85,
  "user_stories_count": 0,
  "themes": [],
  "duration_sec": 2
}
```

---

## 🤪 Automated Tests

Run all tests:

```bash
make test
```

### 🗂️ Test Coverage

| File                     | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `test_audio_listener.py` | Tests full pipeline (recording + transcription) |
| `test_api_sessions.py`   | Tests the `/api/sessions/latest` endpoint       |
| `test_audio_summary.py`  | Validates `summary.json` consistency            |
| `test_logger_manager.py` | Checks structured logging integrity             |
| `test_audio_logger.py`   | Validates session log completeness              |

🧩 **All tests must pass before merging any PR.**

---

## 📊 Processing Pipeline

| Step                            | Description                                  |
| ------------------------------- | -------------------------------------------- |
| 🎤 Audio Recording              | Captures live audio input                    |
| 🧠 Transcription (Groq Whisper) | Converts audio to text                       |
| 🫩 Segmentation                 | Splits text into product-relevant themes     |
| 💡 User Story Generation        | Builds complete User Stories (with criteria) |
| 🔁 Consolidation                | Merges duplicates and scores quality         |
| 📊 Summary Generation           | Outputs `metadata.json` and `summary.json`   |
| 🌐 REST API                     | Exposes structured results to frontend       |

---

## 🧱️ Makefile — Quick Commands

| Command       | Description                           |
| ------------- | ------------------------------------- |
| `make listen` | Start recording and run full pipeline |
| `make api`    | Run FastAPI server                    |
| `make test`   | Run all tests with Pytest             |

---

## 🧠 Roadmap

| Version   | Description                                            |
| --------- | ------------------------------------------------------ |
| ✅ **V1**  | Complete backend — Audio → US + API + tests            |
| 🔜 **V2** | React Frontend (User Story visualization & validation) |
| 🚀 **V3** | Jira integration + contextual learning engine          |

---

## 🧩 Example Use Cases

* 🎯 Product workshops & sprint reviews
* 👤 Client feedback and discovery calls
* 💬 User interviews & brainstorming sessions
* 📋 Backlog grooming and prioritization meetings

---

## 🦭 Vision

> “A Product Management copilot that **listens, understands, and structures** ideas into action.”

Long-term goal:

* Read project context before each session
* Understand discussions within their roadmap
* Auto-generate structured backlog items
* Learn from user validation feedback

---

## 👨‍💼 Author

**Djamil**
Product Manager passionate about **AI, Agile methods, and Product Intelligence**.
Developed as part of the **AI Scrum PO Assistant** initiative.

---

## 🛋️ License

**MIT License** — free to use, modify, and distribute for both personal and professional purposes.

---

## 📘 Next Step — Frontend (V2)

The upcoming **React Frontend** will allow users to:

* View and filter generated User Stories
* Validate or reject proposals
* Push stories directly to Jira

> 🧱️ A separate repository (`ai_scrum_po_front/`) will host the frontend, connected to this backend via the REST API.
