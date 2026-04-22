import json
import os
import subprocess
import platform
import webbrowser
import requests
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

# ─── JSON History helpers ────────────────────────────────────────────────────

HISTORY_FILE = os.path.join(settings.BASE_DIR, 'chat_history.json')

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def save_history(history):
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

# ─── System automation ───────────────────────────────────────────────────────

def execute_system_action(action_type, param):
    system = platform.system()
    try:
        if action_type == 'open_app':
            if system == 'Windows':
                subprocess.Popen(f'start {param}', shell=True)
            elif system == 'Darwin':
                subprocess.Popen(['open', '-a', param])
            else:
                subprocess.Popen([param])
            return f'✅ Opened {param}'

        elif action_type == 'close_app':
            if system == 'Windows':
                subprocess.call(f'taskkill /IM {param}.exe /F', shell=True)
            else:
                subprocess.call(['pkill', '-f', param])
            return f'✅ Closed {param}'

        elif action_type == 'open_browser':
            webbrowser.open(param)
            return f'✅ Opened browser: {param}'

        elif action_type == 'search':
            query = param.replace(' ', '+')
            webbrowser.open(f'https://www.google.com/search?q={query}')
            return f'✅ Searched Google for "{param}"'

        elif action_type == 'close_browser':
            if system == 'Windows':
                subprocess.call('taskkill /IM chrome.exe /F', shell=True)
                subprocess.call('taskkill /IM msedge.exe /F', shell=True)
            else:
                subprocess.call(['pkill', '-f', 'chrome'])
            return '✅ Closed all browsers'

        return '✅ Action completed'

    except Exception as e:
        return f'❌ Could not perform action: {str(e)}'


# ─── API endpoints ───────────────────────────────────────────────────────────

@csrf_exempt
def process_command(request):
    """Send a message to Jarvis; stores history in chat_history.json."""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=400)

    try:
        data = json.loads(request.body)
        command = data.get('command', '').strip()
        if not command:
            return JsonResponse({'response': "I didn't catch that, sir!"})

        # Load persisted history
        history = load_history()

        system_prompt = {
            "role": "system",
            "content": (
                "You are Jarvis, a witty, friendly, sarcastic-but-helpful offline AI assistant "
                "like Iron Man. Always talk like a cool friend. "
                "If the user wants to open/close any app, browser, or search something, "
                "reply with EXACTLY this format at the VERY BEGINNING of your reply:\n"
                "[ACTION:open_app:APPNAME] or [ACTION:close_app:APPNAME] or "
                "[ACTION:open_browser:URL] or [ACTION:search:QUERY] or [ACTION:close_browser]\n"
                "Then give a friendly spoken reply. Never mention the [ACTION] tag to the user."
            )
        }

        # Only pass role+content to Ollama (strip metadata fields)
        ollama_history = [{"role": m["role"], "content": m["content"]} for m in history]
        messages = [system_prompt] + ollama_history + [{"role": "user", "content": command}]

        # Call local Ollama API
        ollama_response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "phi",
                "messages": messages,
                "stream": False,
                "options": {"temperature": 0.7, "num_ctx": 4096}
            },
            timeout=120
        )
        ollama_response.raise_for_status()
        ai_full_text = ollama_response.json()["message"]["content"].strip()

        # Parse ACTION tag
        action = None
        execution_result = ""
        if '[ACTION:' in ai_full_text:
            start = ai_full_text.find('[ACTION:') + 8
            end = ai_full_text.find(']', start)
            action_str = ai_full_text[start:end].strip()
            ai_full_text = ai_full_text[:ai_full_text.find('[ACTION:')].strip()

            if ':' in action_str:
                action_type, param = action_str.split(':', 1)
                action = {'type': action_type.strip(), 'param': param.strip()}
            else:
                action = {'type': action_str.strip(), 'param': ''}

            execution_result = execute_system_action(action['type'], action['param'])

        # Persist both turns to JSON file
        timestamp = datetime.utcnow().isoformat()
        history.append({"role": "user", "content": command, "timestamp": timestamp})
        history.append({"role": "assistant", "content": ai_full_text, "timestamp": timestamp})
        save_history(history)

        return JsonResponse({
            'response': ai_full_text,
            'action': action,
            'execution': execution_result
        })

    except requests.exceptions.ConnectionError:
        return JsonResponse({'response': "Can't reach Ollama. Make sure it's running: `ollama serve`"})
    except Exception as e:
        return JsonResponse({'response': f'Error: {str(e)}'})


@csrf_exempt
def get_history(request):
    """Return full chat history from JSON file."""
    if request.method != 'GET':
        return JsonResponse({'error': 'GET only'}, status=400)
    return JsonResponse({'history': load_history()})


@csrf_exempt
def clear_history(request):
    """Wipe the chat history JSON file."""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'DELETE only'}, status=400)
    save_history([])
    return JsonResponse({'status': 'cleared'})
