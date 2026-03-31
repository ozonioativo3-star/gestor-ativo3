import { useState, useRef, useCallback } from 'react'
import { chamarAgente } from '../lib/agent'

export function useVoiceAgent() {
  const [status, setStatus] = useState('idle') // idle | ouvindo | pensando | falando
  const [transcricao, setTranscricao] = useState('')
  const [resposta, setResposta] = useState('')
  const [historico, setHistorico] = useState([])
  const recognitionRef = useRef(null)

  // ─── FALAR (text-to-speech) ──────────────────────────────────────
  const falar = useCallback((texto) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.0
    utterance.pitch = 1.1

    // Tenta usar voz feminina em português
    const vozes = window.speechSynthesis.getVoices()
    const vozPT = vozes.find(v => v.lang.includes('pt') && v.name.toLowerCase().includes('female'))
      || vozes.find(v => v.lang.includes('pt'))
    if (vozPT) utterance.voice = vozPT

    utterance.onstart = () => setStatus('falando')
    utterance.onend = () => setStatus('idle')
    window.speechSynthesis.speak(utterance)
  }, [])

  // ─── OUVIR (speech-to-text) ──────────────────────────────────────
  const ouvir = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz. Use o Google Chrome.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false
    recognitionRef.current = recognition

    recognition.onstart = () => setStatus('ouvindo')

    recognition.onresult = async (event) => {
      const texto = event.results[0][0].transcript
      setTranscricao(texto)
      setStatus('pensando')

      try {
        const novoHistorico = [
          ...historico,
          { role: 'user', content: texto }
        ]
        const respAgente = await chamarAgente(texto, historico)
        setResposta(respAgente)
        setHistorico([
          ...novoHistorico,
          { role: 'assistant', content: respAgente }
        ])
        falar(respAgente)
      } catch (err) {
        const erro = 'Desculpe, ocorreu um erro. Tente novamente.'
        setResposta(erro)
        falar(erro)
        setStatus('idle')
      }
    }

    recognition.onerror = () => setStatus('idle')
    recognition.onend = () => {
      if (status === 'ouvindo') setStatus('idle')
    }

    recognition.start()
  }, [historico, falar, status])

  const parar = useCallback(() => {
    recognitionRef.current?.stop()
    window.speechSynthesis.cancel()
    setStatus('idle')
  }, [])

  const limparHistorico = useCallback(() => {
    setHistorico([])
    setTranscricao('')
    setResposta('')
  }, [])

  return { status, transcricao, resposta, historico, ouvir, parar, limparHistorico }
}
