🧠 AI Scrum PO Assistant

AI Scrum PO Assistant is an intelligent product management tool that automatically transforms meeting audio into actionable User Stories — ready to be pushed directly into Jira.

It listens, understands, and structures product discussions just like a Product Owner would, saving hours of manual note-taking and backlog writing.

🚀 Overview

AI Scrum PO Assistant leverages speech-to-text, semantic segmentation, and LLM reasoning to extract real product needs from audio recordings or workshop discussions.
It then generates complete User Stories — including title, description, acceptance criteria, and priority — and can automatically export them to Jira.

This version (V1) is a fully functional MVP that works end-to-end from the terminal.

🧩 Core Features

| 🎙️ **Audio Transcription**  | Converts audio recordings (MP3, WAV, M4A…) into clean, readable text using Whisper (Groq API).       |
| 🧠 **Semantic Segmentation** | Automatically detects and separates discussion topics into coherent product segments.                |
| 💡 **Idea Extraction**       | Identifies concrete product needs or improvement ideas using LLM-based reasoning.                    |
| 🧱 **User Story Generation** | Produces full User Stories (`As a... I want... so that...`) with acceptance criteria and priorities. |
| 🔁 **Consolidation**         | Merges duplicate or highly similar stories to avoid redundancy.                                      |
| ⚖️ **Auto-Prioritization**   | Assigns a priority level (High / Medium / Low) based on theme and context.                           |
| 🚀 **Jira Integration**      | Automatically creates Jira tickets for each generated User Story.                                    |
| 📊 **Quality Scoring**       | Evaluates the batch by confidence, diversity, and relevance (average score shown at the end).        |

🧱 Architecture

ai_scrum_po/
│
├── audio_transcriber.py     # Main pipeline (Audio → Segmentation → Ideas → US → Jira)
├── consolidator.py           # Story merging, normalization, and prioritization
├── generator.py              # Generates User Stories and acceptance criteria
├── jira_client.py            # Handles Jira API authentication and push
├── test_audio_to_jira.py     # CLI test runner for end-to-end validation
├── .env                      # API keys (Groq, Jira, etc.)
└── README.md                 # Documentation


⚙️ How It Works (Step by Step)

Audio Transcription
The system uses Whisper via Groq API to transcribe spoken discussions.

Semantic Segmentation
The text is split into logical themes or topics by LLM reasoning.

Idea Extraction
For each segment, product-relevant ideas are extracted (ignoring greetings, chatter, etc.).

User Story Generation
Each idea is transformed into a fully structured User Story with acceptance criteria.

Consolidation & Scoring
Duplicate stories are merged and quality metrics are computed.

Jira Export (Optional)
All validated stories are pushed directly to Jira via the REST API.

🧩 Example Output

Input:

Audio meeting about Danger Wild product (149 words).

Output:
✅ 3 segments detected
✅ 4 User Stories generated
✅ All stories exported to Jira (P1-44 → P1-47)

| Title                                           | Priority  | Jira Key |
| ----------------------------------------------- | --------- | -------- |
| Real-time abnormal temperature alerts           | 🔴 High   | P1-45    |
| Sensitivity improvement for temperature sensors | 🟡 Medium | P1-47    |
| Weather forecasts for outdoor planning          | 🟡 Medium | P1-46    |
| Detailed hiking routes with real-time weather   | 🔴 High   | P1-44    |

Quality score: 0.74 (Confidence: 0.78 / Relevance: 1.0 / Diversity: 0.5)

🧠 Roadmap
✅ Current Version (V1)

Full pipeline working end-to-end in terminal

Clean Jira integration

Automatic scoring and consolidation

🔜 Upcoming (V2)

“AI Contextual Product Copilot” — A version that understands the project context before listening.

🧩 Context Loader: analyze project specs, Jira tickets, and sprint history

🧠 Context Reasoner: understand what’s new vs. already known

🎧 Live Meeting Listener: detect real decisions and product needs

📊 Decision Tracker: map meeting outcomes to Jira

💬 Auto-Brief Generator: prepare meeting summaries and discussion points

🔄 Continuous Learning: model improves from scoring feedback

🧰 Requirements

Python 3.10+

Groq API key (for transcription & LLM)

Jira API credentials (for export)

Dependencies (see requirements.txt)

🧑‍💻 Usage

From your terminal:
python test_audio_to_jira.py

Or to push directly to Jira:
python test_audio_to_jira.py --push

Environment variables are stored in .env:

GROQ_API_KEY=your_groq_key
JIRA_API_TOKEN=your_jira_token
JIRA_URL=https://yourcompany.atlassian.net
JIRA_PROJECT_KEY=P1


🧩 Example Use Cases

Product workshops or brainstorming sessions

Sprint reviews and planning meetings

Client feedback or voice notes analysis

User interviews and discovery calls

🧭 Vision

“A Product Management copilot that listens, understands, and remembers.”

The long-term goal is to build a context-aware and continuously learning AI Product Assistant capable of:

Reading project specs and history before each meeting,

Understanding conversations with full context,

Generating structured outputs aligned with existing roadmaps,

Learning from user feedback to improve future sessions.

👨‍💻 Author

Djamil — Product Manager passionate about AI for Product Intelligence.
🚀 Project developed as part of AI Scrum PO Assistant initiative.

🪪 License

MIT License — free to use, modify and distribute for both personal and professional purposes.