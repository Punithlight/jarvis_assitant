import { useRef, useState, useCallback } from 'react'

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export function useSpeech({ onResult }) {
  const recRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const activeRef = useRef(false)

  const start = useCallback(() => {
    if (!SpeechRecognition) { alert('Speech Recognition not supported in this browser.'); return }
    activeRef.current = true
    setListening(true)

    recRef.current = new SpeechRecognition()
    recRef.current.lang = 'en-US'
    recRef.current.continuous = false
    recRef.current.interimResults = false

    recRef.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim()
      if (transcript) onResult(transcript)
    }

    recRef.current.onend = () => {
      if (activeRef.current) {
        // Auto-restart loop
        setTimeout(() => {
          if (activeRef.current && recRef.current) recRef.current.start()
        }, 600)
      } else {
        setListening(false)
      }
    }

    recRef.current.start()
  }, [onResult])

  const stop = useCallback(() => {
    activeRef.current = false
    recRef.current?.stop()
    setListening(false)
  }, [])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.pitch = 0.9
    utt.rate = 1.05
    utt.onstart = () => setSpeaking(true)
    utt.onend = () => setSpeaking(false)
    window.speechSynthesis.speak(utt)
  }, [])

  return { listening, speaking, start, stop, speak }
}
