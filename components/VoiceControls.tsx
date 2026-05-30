'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  text?: string
  lang?: string
  onTranscript?: (text: string) => void
  agentColor?: string
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 3000))
    utterance.lang = lang
    utterance.rate = 0.92
    utterance.pitch = 1.05
    utterance.volume = 1

    // Prefer a natural-sounding voice
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith(lang.split('-')[0]) &&
      (v.name.includes('Natural') || v.name.includes('Neural') || v.name.includes('Enhanced') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) ?? voices.find(v => v.lang.startsWith(lang.split('-')[0]))
    if (preferred) utterance.voice = preferred

    utterance.onstart  = () => setSpeaking(true)
    utterance.onend    = () => setSpeaking(false)
    utterance.onerror  = () => setSpeaking(false)
    synthRef.current.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    synthRef.current?.cancel()
    setSpeaking(false)
  }, [])

  return { speak, stop, speaking }
}

export default function VoiceControls({ text, lang = 'en-US', onTranscript, agentColor = '#f59e0b' }: Props) {
  const { speak, stop, speaking } = useSpeech()
  const [listening, setListening]   = useState(false)
  const [supported, setSupported]   = useState(false)
  const recogRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSupported('speechSynthesis' in window)
    }
  }, [])

  function toggleListen() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) return
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const r = new SR()
    r.lang = lang
    r.continuous = false
    r.interimResults = true
    r.onstart  = () => setListening(true)
    r.onend    = () => setListening(false)
    r.onerror  = () => setListening(false)
    r.onresult = (e: any) => {
      const transcript = Array.from(e.results as SpeechRecognitionResultList)
        .map((res: SpeechRecognitionResult) => res[0].transcript)
        .join('')
      onTranscript?.(transcript)
    }
    r.start()
    recogRef.current = r
  }

  if (!supported) return null

  return (
    <div className="flex items-center gap-2">
      {/* Text-to-speech */}
      {text && (
        <button
          onClick={() => speaking ? stop() : speak(text, lang)}
          title={speaking ? 'Stop speaking' : 'Listen to response'}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300',
            speaking
              ? 'bg-white/10 text-white ring-1 ring-white/20 animate-[breathe_2s_ease-in-out_infinite]'
              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
          )}
        >
          {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          {speaking ? 'Stop' : 'Listen'}
        </button>
      )}

      {/* Voice input */}
      {onTranscript && (
        <button
          onClick={toggleListen}
          title={listening ? 'Stop listening' : 'Speak your question'}
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
            listening
              ? 'ring-2 ring-red-400 animate-[breathe_1s_ease-in-out_infinite]'
              : 'bg-slate-800 hover:bg-slate-700'
          )}
          style={listening ? { backgroundColor: `${agentColor}22`, color: agentColor } : {}}
        >
          {listening
            ? <Mic className="w-4 h-4 text-red-400 animate-pulse" />
            : <Mic className="w-4 h-4 text-slate-400" />}
        </button>
      )}
    </div>
  )
}
