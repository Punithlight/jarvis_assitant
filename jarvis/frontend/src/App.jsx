import React, { useState, useEffect, useCallback, useRef } from 'react'
import Orb from './components/Orb'
import ChatPanel from './components/ChatPanel'
import TextInput from './components/TextInput'
import { useSpeech } from './hooks/useSpeech'
import { sendMessage, fetchHistory, clearHistory } from './utils/api'

export default function App() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const pendingExecRef = useRef(null)

  // Load history from JSON on mount
  useEffect(() => {
    fetchHistory()
      .then(hist => {
        // Pair user+assistant messages to attach execution context
        setMessages(hist.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })))
        setHistoryLoaded(true)
      })
      .catch(() => setHistoryLoaded(true))
  }, [])

  const handleCommand = useCallback(async (text) => {
    // Append user message immediately
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await sendMessage(text)
      const assistantMsg = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        execution: data.execution || null
      }
      setMessages(prev => [...prev, assistantMsg])

      // Speak the response
      if (data.response) speech.speak(data.response)
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry sir, something went wrong. Is Ollama running?",
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }, [])

  const speech = useSpeech({ onResult: handleCommand })

  const handleToggleVoice = () => {
    if (speech.listening) {
      speech.stop()
    } else {
      speech.start()
      if (!messages.length) {
        speech.speak("Good evening. JARVIS is online. How may I assist you?")
      }
    }
  }

  const handleClear = async () => {
    await clearHistory()
    setMessages([])
  }

  return (
    <div style={styles.root}>
      {/* Animated background grid */}
      <div style={styles.gridBg} />

      {/* Left sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>J.A.R.V.I.S</div>
        <div style={styles.logoSub}>Offline AI Assistant</div>

        <Orb listening={speech.listening} speaking={speech.speaking} />

        {/* Activate button */}
        <button
          style={{
            ...styles.activateBtn,
            ...(speech.listening ? styles.activateBtnActive : {})
          }}
          onClick={handleToggleVoice}
        >
          {speech.listening ? '⏹ STOP LISTENING' : '🎙 ACTIVATE VOICE'}
        </button>

        <div style={styles.hint}>
          {speech.listening
            ? 'Listening... speak now'
            : 'Press button or use keyboard'}
        </div>

        {/* Status indicators */}
        <div style={styles.statusPanel}>
          <StatusRow label="OLLAMA" value="localhost:11434" ok />
          <StatusRow label="MODEL" value="llama3" ok />
          <StatusRow label="MODE" value="OFFLINE" ok />
          <StatusRow label="HISTORY" value="chat_history.json" ok />
        </div>

        <button style={styles.clearBtn} onClick={handleClear}>
          🗑 CLEAR HISTORY
        </button>
      </aside>

      {/* Main chat area */}
      <main style={styles.main}>
        <div style={styles.chatHeader}>
          <span style={styles.chatTitle}>COMMAND LOG</span>
          <span style={styles.chatCount}>{messages.length} messages</span>
        </div>

        {!historyLoaded ? (
          <div style={styles.loadingMsg}>Loading history...</div>
        ) : (
          <ChatPanel messages={messages} loading={loading} />
        )}

        <TextInput onSend={handleCommand} disabled={loading} />
      </main>

      <style>{`
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }
        @keyframes gridMove { from { background-position: 0 0; } to { background-position: 40px 40px; } }
        @keyframes glow { from { opacity: 0.7; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}

function StatusRow({ label, value, ok }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.7rem' }}>
      <span style={{ color: 'rgba(0,255,255,0.5)', letterSpacing: '0.1em' }}>{label}</span>
      <span style={{ color: ok ? '#00ff88' : '#ff4444' }}>{value}</span>
    </div>
  )
}

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    animation: 'gridMove 8s linear infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  sidebar: {
    width: 280,
    minWidth: 280,
    borderRight: '1px solid rgba(0,255,255,0.15)',
    background: 'rgba(0, 8, 20, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '28px 20px 20px',
    zIndex: 1,
    backdropFilter: 'blur(10px)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    letterSpacing: '0.4em',
    color: '#00ffff',
    textShadow: '0 0 20px rgba(0,255,255,0.7)',
    animation: 'glow 2.5s infinite alternate',
  },
  logoSub: {
    fontSize: '0.6rem',
    letterSpacing: '0.2em',
    color: 'rgba(0,255,255,0.4)',
    marginTop: 4,
    marginBottom: 8,
  },
  activateBtn: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1.5px solid rgba(0,255,255,0.5)',
    color: '#00ffff',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    fontSize: '0.8rem',
    letterSpacing: '0.1em',
    transition: 'all 0.3s',
    boxShadow: '0 0 15px rgba(0,255,255,0.15)',
    marginBottom: 8,
  },
  activateBtnActive: {
    background: 'rgba(0,255,136,0.1)',
    borderColor: '#00ff88',
    color: '#00ff88',
    boxShadow: '0 0 25px rgba(0,255,136,0.3)',
  },
  hint: {
    fontSize: '0.65rem',
    color: 'rgba(0,255,255,0.35)',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: '0.05em',
  },
  statusPanel: {
    width: '100%',
    background: 'rgba(0,20,40,0.5)',
    border: '1px solid rgba(0,255,255,0.1)',
    borderRadius: 8,
    padding: '12px 14px',
    marginBottom: 12,
    marginTop: 'auto',
  },
  clearBtn: {
    width: '100%',
    padding: '9px',
    background: 'transparent',
    border: '1px solid rgba(255,60,60,0.3)',
    color: 'rgba(255,100,100,0.7)',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1,
    overflow: 'hidden',
    background: 'rgba(0,5,15,0.7)',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid rgba(0,255,255,0.1)',
    background: 'rgba(0,10,25,0.8)',
  },
  chatTitle: {
    fontSize: '0.7rem',
    letterSpacing: '0.3em',
    color: 'rgba(0,255,255,0.6)',
  },
  chatCount: {
    fontSize: '0.65rem',
    color: 'rgba(0,255,255,0.3)',
    letterSpacing: '0.1em',
  },
  loadingMsg: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(0,255,255,0.3)',
    fontSize: '0.9rem',
    letterSpacing: '0.2em',
  }
}
