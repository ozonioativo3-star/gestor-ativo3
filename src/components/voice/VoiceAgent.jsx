import { useVoiceAgent } from '../../hooks/useVoiceAgent'

const statusConfig = {
  idle:      { cor: '#0F6E56', label: 'Toque para ativar a Ativa', pulso: false },
  ouvindo:   { cor: '#185FA5', label: 'Ouvindo...', pulso: true },
  pensando:  { cor: '#854F0B', label: 'Pensando...', pulso: true },
  falando:   { cor: '#534AB7', label: 'Falando...', pulso: true },
}

export default function VoiceAgent() {
  const { status, transcricao, resposta, ouvir, parar, limparHistorico } = useVoiceAgent()
  const cfg = statusConfig[status]

  return (
    <div style={styles.container}>
      <div style={styles.titulo}>
        <span style={styles.nome}>Ativa</span>
        <span style={styles.subtitulo}>Assistente de voz do estúdio</span>
      </div>

      <div style={styles.btnWrap}>
        {cfg.pulso && <div style={{ ...styles.pulso, borderColor: cfg.cor }} />}
        <button
          style={{ ...styles.btn, background: cfg.cor }}
          onClick={status === 'idle' ? ouvir : parar}
        >
          {status === 'idle'     && <MicIcon />}
          {status === 'ouvindo'  && <OndasIcon />}
          {status === 'pensando' && <SpinnerIcon />}
          {status === 'falando'  && <SpeakerIcon />}
        </button>
      </div>

      <p style={{ ...styles.statusLabel, color: cfg.cor }}>{cfg.label}</p>

      {transcricao && (
        <div style={styles.card}>
          <span style={styles.cardLabel}>Você disse</span>
          <p style={styles.cardText}>"{transcricao}"</p>
        </div>
      )}

      {resposta && (
        <div style={{ ...styles.card, background: '#E1F5EE', borderColor: '#9FE1CB' }}>
          <span style={{ ...styles.cardLabel, color: '#0F6E56' }}>Ativa respondeu</span>
          <p style={styles.cardText}>{resposta}</p>
        </div>
      )}

      {(transcricao || resposta) && (
        <button style={styles.limpar} onClick={limparHistorico}>Limpar conversa</button>
      )}

      {status === 'idle' && !transcricao && (
        <p style={styles.dica}>
          Diga "bom dia" para o resumo do dia,{'\n'}
          ou pergunte sobre uma cliente específica.
        </p>
      )}
    </div>
  )
}

const MicIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="2" width="6" height="11" rx="3"/>
    <path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)
const OndasIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <path d="M2 12h2M6 8v8M10 5v14M14 8v8M18 10v4M22 12h-2"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{ animation: 'spin 1s linear infinite' }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)
const SpeakerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
)

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', gap: '16px', maxWidth: '420px', margin: '0 auto' },
  titulo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  nome: { fontSize: '28px', fontWeight: '700', color: '#0F6E56', letterSpacing: '-0.5px' },
  subtitulo: { fontSize: '13px', color: '#888780' },
  btnWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '8px 0' },
  pulso: { position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid', opacity: 0.3, animation: 'pulso 1.5s ease-out infinite' },
  btn: { width: '80px', height: '80px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
  statusLabel: { fontSize: '14px', fontWeight: '500', transition: 'color 0.3s' },
  card: { width: '100%', background: '#F1EFE8', border: '1px solid #D3D1C7', borderRadius: '12px', padding: '14px 16px' },
  cardLabel: { fontSize: '11px', color: '#888780', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
  cardText: { fontSize: '15px', color: '#2C2C2A', marginTop: '6px', lineHeight: '1.6' },
  limpar: { background: 'none', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', color: '#888780', cursor: 'pointer' },
  dica: { fontSize: '12px', color: '#B4B2A9', textAlign: 'center', lineHeight: '1.8', whiteSpace: 'pre-line' }
}