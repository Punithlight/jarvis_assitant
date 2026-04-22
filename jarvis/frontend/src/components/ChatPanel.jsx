import React, { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'

export default function ChatPanel({ messages, loading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div style={styles.panel}>
      {messages.length === 0 && (
        <div style={styles.empty}>
          Press <strong>ACTIVATE</strong> and speak, sir...
        </div>
      )}
      {messages.map((msg, i) => (
        <ChatMessage key={i} {...msg} />
      ))}
      {loading && (
        <div style={styles.thinking}>
          <span style={styles.dot} />
          <span style={styles.dot} />
          <span style={styles.dot} />
          <span style={{ marginLeft: 8, opacity: 0.6, fontSize: '0.8rem' }}>JARVIS is thinking...</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

const styles = {
  panel: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
  },
  empty: {
    textAlign: 'center',
    color: 'rgba(0,255,255,0.3)',
    marginTop: 'auto',
    marginBottom: 'auto',
    fontSize: '1rem',
    letterSpacing: '0.1em',
  },
  thinking: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    color: '#00ccff',
  },
  dot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#00ccff',
    margin: '0 3px',
    animation: 'blink 1.2s infinite',
  },
}
