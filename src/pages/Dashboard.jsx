import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import VoiceAgent from '../components/voice/VoiceAgent'
import Clientes from './Clientes'
import Agendamentos from './Agendamentos'

export default function Dashboard() {
  const [totalHoje, setTotalHoje] = useState(0)
  const [aba, setAba] = useState('voz')

  useEffect(() => { contarHoje() }, [])

  async function contarHoje() {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('data', hoje)
    setTotalHoje(data?.length || 0)
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>Gestor Ativo</h1>
          <p style={styles.data}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div style={styles.badge}>{totalHoje} hoje</div>
      </header>

      <div style={styles.abas}>
        {['voz', 'agenda', 'clientes'].map(a => (
          <button key={a}
            style={{ ...styles.aba, ...(aba === a ? styles.abaAtiva : {}) }}
            onClick={() => setAba(a)}>
            {a === 'voz' ? 'Assistente' : a.charAt(0).toUpperCase() + a.slice(1)}
          </button>
        ))}
      </div>

      <main style={styles.main}>
        {aba === 'voz'      && <VoiceAgent />}
        {aba === 'agenda'   && <Agendamentos />}
        {aba === 'clientes' && <Clientes />}
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
}