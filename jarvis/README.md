# JARVIS — Offline AI Assistant
**Django backend · React frontend · Ollama llama3 · JSON history**

---

## Project Structure

```
jarvis/
├── backend/                    ← Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── chat_history.json       ← auto-created on first chat
│   ├── jarvisproject/
│   │   ├── settings.py
│   │   └── urls.py
│   └── jarvisapp/
│       └── views.py            ← Ollama calls + JSON history
│
└── frontend/                   ← React (Vite)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx             ← main layout
        ├── components/
        │   ├── Orb.jsx         ← animated sphere
        │   ├── ChatPanel.jsx   ← message list
        │   ├── ChatMessage.jsx ← single bubble
        │   └── TextInput.jsx   ← keyboard input
        ├── hooks/
        │   └── useSpeech.js    ← voice recognition + TTS
        └── utils/
            └── api.js          ← fetch helpers
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed locally with `llama3` pulled

```bash
ollama pull llama3
```

---

## Setup & Run

### 1. Start Ollama (must be running first)

```bash
ollama serve
```

Ollama listens on `http://localhost:11434` by default.

---

### 2. Backend — Django

```bash
cd jarvis/backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

Django API will be at `http://localhost:8000`.

---

### 3. Frontend — React

```bash
cd jarvis/frontend
npm install
npm run dev
```

React app will be at `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/` | Send a message to Jarvis |
| GET | `/api/history/` | Fetch full chat history |
| DELETE | `/api/history/clear/` | Wipe the history JSON |

### POST `/api/chat/` — Request body
```json
{ "command": "Open Spotify" }
```

### Response
```json
{
  "response": "Sure thing! Opening Spotify right now.",
  "action": { "type": "open_app", "param": "spotify" },
  "execution": "✅ Opened spotify"
}
```

---

## Chat History

All conversations are stored in `backend/chat_history.json`:

```json
[
  {
    "role": "user",
    "content": "What time is it?",
    "timestamp": "2026-04-18T10:00:00"
  },
  {
    "role": "assistant",
    "content": "I don't have a clock myself, sir, but your system does!",
    "timestamp": "2026-04-18T10:00:01"
  }
]
```

---

## Voice Commands

- Speak after pressing **ACTIVATE VOICE** button
- Space bar toggles listening on/off
- Jarvis responds with speech synthesis (browser TTS)

### System Actions Jarvis Understands

| Say | What happens |
|-----|-------------|
| "Open Chrome" | Launches Chrome |
| "Close Spotify" | Kills the process |
| "Search for Python tutorials" | Opens Google search |
| "Open YouTube" | Opens browser to youtube.com |
| "Close browser" | Kills all browser windows |

---

## Changing the Model

In `backend/jarvisapp/views.py`, change this line:

```python
"model": "llama3",
```

To any model you have pulled in Ollama, e.g. `"llama3.2"`, `"mistral"`, `"phi3"`.

---

## Troubleshooting

**"Can't reach Ollama"** → Make sure `ollama serve` is running.

**Voice not working** → Use Chrome or Edge (Firefox doesn't support Web Speech API).

**CORS errors** → Make sure Django is on port 8000 and Vite on 5173.

**History not saving** → Check write permissions in the `backend/` folder.
