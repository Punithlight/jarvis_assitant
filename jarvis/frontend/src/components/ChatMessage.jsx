import React from 'react'

export default function ChatMessage({ role, content, timestamp, execution }) {
  const isUser = role === 'user'
  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div style={{ ...styles.row, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '78%' }}>
        <div style={{ ...styles.label, textAlign: isUser ? 'right' : 'left', color: isUser ? '#00ff88' : '#00ccff' }}>
          {isUser ? 'YOU' : 'JARVIS'} {time && <span style={styles.time}>{time}</span>}
        </div>
        <div style={{ ...styles.bubble, ...(isUser ? styles.userBubble : styles.jarvisBubble) }}>
          {content}
        </div>
        {execution && (
          <div style={styles.execution}>⚡ {execution}</div>
        )}
      </div>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    marginBottom: 16,
  },
  label: {
    fontSize: '0.65rem',
    letterSpacing: '0.2em',
    marginBottom: 4,
    opacity: 0.8,
  },
  time: {
    opacity: 0.5,
    marginLeft: 6,
    fontSize: '0.6rem',
  },
  bubble: {
    padding: '10px 15px',
    borderRadius: 8,
    fontSize: '0.95rem',
    lineHeight: 1.6,
    fontFamily: 'Courier New, monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  userBubble: {
    background: 'rgba(0,255,136,0.08)',
    border: '1px solid rgba(0,255,136,0.3)',
    color: '#e0ffe8',
    textShadow: '0 0 6px rgba(0,255,136,0.3)',
  },
  jarvisBubble: {
    background: 'rgba(0,200,255,0.07)',
    border: '1px solid rgba(0,200,255,0.25)',
    color: '#e0f8ff',
    textShadow: '0 0 6px rgba(0,200,255,0.3)',
  },
  execution: {
    marginTop: 5,
    fontSize: '0.75rem',
    color: '#00ff88',
    opacity: 0.8,
    paddingLeft: 4,
  }
}
