import React from 'react'

export default function Orb({ listening, speaking }) {
  return (
    <div style={styles.container}>
      <div style={{
        ...styles.orb,
        ...(speaking ? styles.orbSpeaking : listening ? styles.orbListening : {})
      }}>
        {/* Rings */}
        <div style={{ ...styles.ring, ...styles.ring1, ...(listening || speaking ? styles.ringActive : {}) }} />
        <div style={{ ...styles.ring, ...styles.ring2, ...(listening || speaking ? styles.ringActive2 : {}) }} />
        <div style={{ ...styles.ring, ...styles.ring3 }} />

        {/* Core glow */}
        <div style={{
          ...styles.core,
          ...(speaking ? styles.coreSpeaking : listening ? styles.coreListening : {})
        }} />

        {/* Status text */}
        <div style={styles.statusText}>
          {speaking ? 'SPEAKING' : listening ? 'LISTENING' : 'STANDBY'}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px auto',
    width: 220,
    height: 220,
  },
  orb: {
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 35% 35%, rgba(0,255,255,0.15), rgba(0,0,80,0.4), transparent)',
    boxShadow: '0 0 40px rgba(0,255,255,0.3), inset 0 0 60px rgba(0,255,255,0.1)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'box-shadow 0.3s ease',
  },
  orbListening: {
    boxShadow: '0 0 60px rgba(0,255,136,0.5), inset 0 0 80px rgba(0,255,136,0.2)',
    animation: 'none',
  },
  orbSpeaking: {
    boxShadow: '0 0 80px rgba(0,255,255,0.7), 0 0 120px rgba(0,100,255,0.4), inset 0 0 80px rgba(0,255,255,0.3)',
  },
  ring: {
    position: 'absolute',
    borderRadius: '50%',
    border: '1.5px solid rgba(0,255,255,0.3)',
    animation: 'spinSlow 20s linear infinite',
  },
  ring1: {
    width: '85%', height: '85%',
    borderTop: '1.5px solid rgba(0,255,255,0.7)',
    animationDuration: '8s',
  },
  ring2: {
    width: '70%', height: '70%',
    borderRight: '1.5px solid rgba(0,255,136,0.5)',
    animationDuration: '5s',
    animationDirection: 'reverse',
  },
  ring3: {
    width: '55%', height: '55%',
    border: '1px solid rgba(0,255,255,0.2)',
    animationDuration: '12s',
  },
  ringActive: {
    borderColor: 'rgba(0,255,136,0.8)',
    boxShadow: '0 0 8px rgba(0,255,136,0.5)',
  },
  ringActive2: {
    borderColor: 'rgba(0,255,136,0.6)',
  },
  core: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,255,255,0.8), rgba(0,100,255,0.3))',
    boxShadow: '0 0 20px rgba(0,255,255,0.6)',
    transition: 'all 0.3s ease',
    zIndex: 1,
  },
  coreListening: {
    background: 'radial-gradient(circle, rgba(0,255,136,0.9), rgba(0,200,100,0.3))',
    boxShadow: '0 0 30px rgba(0,255,136,0.8)',
    transform: 'scale(1.3)',
  },
  coreSpeaking: {
    background: 'radial-gradient(circle, rgba(0,255,255,1), rgba(0,150,255,0.5))',
    boxShadow: '0 0 40px rgba(0,255,255,1)',
    transform: 'scale(1.5)',
  },
  statusText: {
    position: 'absolute',
    bottom: 28,
    fontSize: '0.55rem',
    letterSpacing: '0.25em',
    color: 'rgba(0,255,255,0.5)',
    fontFamily: 'Courier New, monospace',
  }
}
