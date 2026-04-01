import { useState, useRef, useCallback, useEffect } from 'react'
import { chamarAgente } from '../lib/agent'

export function useVoiceAgent() {
  const [status, setStatus] = useState('idle')
  const [transcricao, setTranscricao] = useState('')
  const [resposta, setResposta] = useState('')
  const [historico, setHistorico] = useState([])
  const recognitionRef = useRef(null)
  const statusRef = useRef('idle')

  // Mantém o ref sincronizado com o estado
  useEffect(() => { statusRef.current = status }, [status])

  const falar = useCallback((texto) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.4
    utterance.pitch = 1.1
    const vozes = window.speechSynthesis.getVoices()
    const vozPT = vozes.find(v => v.name.includes('Francisca'))
      || vozes.find(v => v.name.includes('Luciana'))
      || vozes.find(v => v.lang === 'pt-BR')
      || vozes.find(v => v.lang.includes('pt'))
      || vozes[0]
    if (vozPT) utterance.voice = vozPT
    utterance.onstart = () => {
      setStatus('falando')
      // Inicia escuta em segundo plano para detectar interrupção
      iniciarEscutaInterrupcao()
    }
    utterance.onend = () => {
      if (statusRef.current === 'falando') setStatus('idle')
    }
    utterance.onerror = () => setStatus('idle')
    window.speechSynthesis.speak(utterance)
  }, [])

  // Escuta em segundo plano enquanto fala — detecta interrupção
  const iniciarEscutaInterrupcao = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = async (event) => {
      const texto = event.results[0][0].transcript
      if (!texto || texto.length < 2) return

      // Para a fala imediatamente
      window.speechSynthesis.cancel()
      recognition.stop()
      setStatus('pensando')
      setTranscricao(texto)

      try {
        const novoHistorico = [...historico, { role: 'user', content: texto }]
        const respAgente = await chamarAgente(texto, historico)
        setResposta(respAgente)
        setHistorico([...novoHistorico, { role: 'assistant', content: respAgente }])
        falar(respAgente)
      } catch {
        setResposta('Erro. Tente novamente.')
        setStatus('idle')
      }
    }

    recognition.onerror = () => {}
    try { recognition.start() } catch {}
  }, [historico, falar])

  const ouvir = useCallback(() => {
    window.speechSynthesis.cancel()

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Use o Google Chrome.')
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
      window.speechSynthesis.cancel()
      setTranscricao(texto)
      setStatus('pensando')
      try {
        const novoHistorico = [...historico, { role: 'user', content: texto }]
        const respAgente = await chamarAgente(texto, historico)
        setResposta(respAgente)
        setHistorico([...novoHistorico, { role: 'assistant', content: respAgente }])
        falar(respAgente)
      } catch {
        setResposta('Erro. Tente novamente.')
        setStatus('idle')
      }
    }

    recognition.onerror = () => setStatus('idle')
    recognition.onend = () => {
      if (statusRef.current === 'ouvindo') setStatus('idle')
    }

    recognition.start()
  }, [historico, falar])

  const parar = useCallback(() => {
    window.speechSynthesis.cancel()
    recognitionRef.current?.stop()
    setStatus('idle')
  }, [])

  const limparHistorico = useCallback(() => {
    window.speechSynthesis.cancel()
    recognitionRef.current?.stop()
    setHistorico([])
    setTranscricao('')
    setResposta('')
    setStatus('idle')
  }, [])

  return { status, transcricao, resposta, historico, ouvir, parar, limparHistorico }
}