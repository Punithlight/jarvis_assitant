import React, { useState } from 'react'

export default function TextInput({ onSend, disabled }) {
  const [text, setText] = useState('')

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.wrapper}>
      <input
        style={styles.input}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a command or use voice..."
        disabled={disabled}
      />
      <button style={{ ...styles.btn, opacity: disabled ? 0.4 : 1 }} onClick={handleSend} disabled={disabled}>
        SEND
      </button>
    </div>
  )
}

const styles = {
  wrapper: {
    display: 'flex',
    gap: 8,
    padding: '12px 16px',
    borderTop: '1px solid rgba(0,255,255,0.15)',
    background: 'rgba(0,10,20,0.6)',
  },
  input: {
    flex: 1,
    background: 'rgba(0,20,40,0.8)',
    border: '1px solid rgba(0,255,255,0.25)',
    borderRadius: 6,
    color: '#e0f8ff',
    padding: '10px 14px',
    fontFamily: 'Courier New, monospace',
    fontSize: '0.9rem',
    outline: 'none',
  },
  btn: {
    background: 'transparent',
    border: '1px solid rgba(0,255,255,0.5)',
    color: '#00ffff',
    padding: '10px 20px',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    fontSize: '0.8rem',
    letterSpacing: '0.15em',
    transition: 'all 0.2s',
  }
}
