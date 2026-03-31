import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import VoiceAgent from '../components/voice/VoiceAgent'

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [aba, setAba] = useState('voz') // voz | agenda | clientes

  useEffect(() => {
    carregarAgendamentos()
  }, [])

  async function carregarAgendamentos() {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('agendamentos')
      .select('*, clientes(nome)')
      .eq('data', hoje)
      .order('hora')
    setAgendamentos(data || [])
    setLoading(false)
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>Gestor Ativo</h1>
          <p style={styles.data}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={styles.badge}>{agendamentos.length} hoje</div>
      </header>

      {/* ABAS */}
      <div style={styles.abas}>
        {['voz', 'agenda', 'clientes'].map(a => (
          <button
            key={a}
            style={{ ...styles.aba, ...(aba === a ? styles.abaAtiva : {}) }}
            onClick={() => setAba(a)}
          >
            {a === 'voz' ? 'Assistente' : a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <main style={styles.main}>

        {/* ABA: ASSISTENTE DE VOZ */}
        {aba === 'voz' && <VoiceAgent />}

        {/* ABA: AGENDA */}
        {aba === 'agenda' && (
          <div style={styles.lista}>
            <h2 style={styles.secTitulo}>Agenda de hoje</h2>
            {loading && <p style={styles.vazio}>Carregando...</p>}
            {!loading && agendamentos.length === 0 && (
              <p style={styles.vazio}>Nenhum agendamento para hoje.</p>
            )}
            {agendamentos.map(ag => (
              <div key={ag.id} style={styles.card}>
                <div style={styles.hora}>{ag.hora?.slice(0,5)}</div>
                <div style={styles.cardInfo}>
                  <p style={styles.clienteNome}>{ag.clientes?.nome || 'Cliente'}</p>
                  <p style={styles.servico}>{ag.servico}</p>
                </div>
                <div style={{ ...styles.statusBadge, background: ag.status === 'confirmado' ? '#E1F5EE' : '#FAEEDA' }}>
                  <span style={{ color: ag.status === 'confirmado' ? '#0F6E56' : '#854F0B', fontSize: '11px' }}>
                    {ag.status || 'pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA: CLIENTES */}
        {aba === 'clientes' && (
          <div style={styles.lista}>
            <h2 style={styles.secTitulo}>Clientes</h2>
            <p style={styles.vazio}>Em breve — cadastro completo de clientes.</p>
          </div>
        )}
      </main>

    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8faf9' },
  header: { background: '#0F6E56', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: 'white', fontSize: '20px', fontWeight: '700' },
  data: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '2px', textTransform: 'capitalize' },
  badge: { background: 'rgba(255,255,255,0.2)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' },
  abas: { display: 'flex', background: 'white', borderBottom: '1px solid #E8E6E0', padding: '0 16px' },
  aba: { padding: '14px 20px', background: 'none', border: 'none', fontSize: '14px', color: '#888780', cursor: 'pointer', borderBottom: '2px solid transparent' },
  abaAtiva: { color: '#0F6E56', borderBottom: '2px solid #0F6E56', fontWeight: '600' },
  main: { padding: '16px' },
  lista: { maxWidth: '600px', margin: '0 auto' },
  secTitulo: { fontSize: '16px', fontWeight: '600', color: '#2C2C2A', marginBottom: '16px' },
  card: { background: 'white', border: '1px solid #E8E6E0', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px' },
  hora: { fontSize: '16px', fontWeight: '700', color: '#0F6E56', minWidth: '48px' },
  cardInfo: { flex: 1 },
  clienteNome: { fontSize: '15px', fontWeight: '600', color: '#2C2C2A' },
  servico: { fontSize: '13px', color: '#888780', marginTop: '2px' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px' },
  vazio: { color: '#888780', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
}
