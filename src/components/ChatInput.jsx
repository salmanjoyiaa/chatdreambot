import { useState, useRef, useEffect } from 'react'

export default function ChatInput({ onSend, isDark = false }) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const [supportsSpeech, setSupportsSpeech] = useState(true)

  const handleSend = async () => {
    const message = value.trim()
    if (!message || sending) return
    setSending(true)
    setValue('')
    try {
      await onSend(message)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupportsSpeech(Boolean(SpeechRecognition))
    if (!SpeechRecognition) return

    const recog = new SpeechRecognition()
    recog.continuous = false
    recog.interimResults = true
    recog.lang = navigator.language || 'en-US'

    recog.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) final += transcript
        else interim += transcript
      }
      setValue((prev) => {
        if (final) {
          if (recognitionRef.current) recognitionRef.current.lastTranscript = final
          return final
        }
        if (interim) {
          if (recognitionRef.current) recognitionRef.current.lastTranscript = interim
          return interim
        }
        return prev
      })
    }

    recog.onend = () => {
      setListening(false)
      if (recognitionRef.current && recognitionRef.current.lastTranscript && recognitionRef.current.lastTranscript.trim()) {
        const textToSend = recognitionRef.current.lastTranscript.trim()
        recognitionRef.current.lastTranscript = ''
        handleSendVoice(textToSend)
      }
    }

    recog.onerror = (err) => {
      console.error('SpeechRecognition error', err)
      setListening(false)
    }

    recognitionRef.current = recog

    return () => {
      try {
        recog.stop()
      } catch (e) {}
      recognitionRef.current = null
    }
  }, [])

  const handleSendVoice = async (text) => {
    if (!text) return
    setSending(true)
    setValue('')
    try {
      await onSend(text)
    } finally {
      setSending(false)
    }
  }

  const toggleListening = () => {
    const recog = recognitionRef.current
    if (!recog) {
      console.warn('SpeechRecognition not supported')
      return
    }

    if (listening) {
      try {
        recog.stop()
      } catch (e) {
        console.warn(e)
      }
      setListening(false)
    } else {
      recognitionRef.current.lastTranscript = ''
      recog.start()
      setListening(true)
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-white/98 dark:from-slate-900/98 via-white/95 dark:via-slate-900/95 to-transparent pt-4 pb-4 sm:pb-6 border-t border-slate-200/60 dark:border-slate-700/40 backdrop-blur-xl">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-black/8 dark:shadow-black/30 hover:shadow-2xl hover:shadow-black/12 dark:hover:shadow-black/40 transition-all duration-200 p-3 sm:p-4 border border-slate-300/60 dark:border-slate-700/60 backdrop-blur-sm ring-1 ring-black/5 dark:ring-white/5">
            <textarea
              className="flex-1 resize-none outline-none p-3 rounded-lg h-11 max-h-32 text-sm sm:text-base font-medium bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700/60 transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-600/40 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-blue-500/30"
              placeholder="Ask about properties, amenities, pricing..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />

            {/* Microphone button */}
            <button
              onClick={toggleListening}
              type="button"
              aria-pressed={listening}
              aria-label={listening ? 'Stop recording' : 'Start voice input'}
              className={`shrink-0 inline-flex items-center justify-center rounded-xl p-2.5 text-sm font-medium transition-all duration-150 ${
                listening
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/40'
                  : 'bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/40 hover:bg-slate-200 dark:hover:bg-slate-700 hover:shadow-md hover:shadow-slate-400/20'
              }`}
            >
              {listening ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 animate-pulse"
                >
                  <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3z" />
                  <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 5 5 0 004 4.9V19a1 1 0 102 0v-3.1A5 5 0 0019 11z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 14a3 3 0 003-3V6a3 3 0 00-6 0v5a3 3 0 003 3z" />
                  <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 5 5 0 004 4.9V19a1 1 0 102 0v-3.1A5 5 0 0019 11z" />
                </svg>
              )}
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || !value.trim()}
              className="shrink-0 inline-flex items-center justify-center rounded-xl px-4 py-2.5 h-11 text-sm font-bold bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:via-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:text-slate-500 transition-all duration-200 active:scale-95 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none ring-1 ring-blue-400/30 disabled:ring-0"
              aria-label="Send message"
            >
              {sending ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5 animate-spin"
                >
                  <circle cx="12" cy="12" r="10" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M2.94 2.94a.75.75 0 01.82-.17l13.5 5.4a.75.75 0 010 1.38l-13.5 5.4a.75.75 0 01-1.03-.87l1.33-4.67a.75.75 0 01.52-.52l7.11-2.1-7.11-2.1a.75.75 0 01-.52-.52L2.73 3.1a.75.75 0 01.21-.16z" />
                </svg>
              )}
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {['Check availability', 'Room details', 'Amenities', 'Pricing'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setValue(suggestion)
                }}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200/60 dark:border-slate-700/60 hover:shadow-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!supportsSpeech && (
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-6xl mt-1">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Voice input not supported. Try Chrome, Edge, or Safari.
          </div>
        </div>
      )}
    </>
  )
}