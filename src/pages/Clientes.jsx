import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState({
    nome: '', telefone: '', email: '', observacoes: ''
  })

  useEffect(() => { carregarClientes() }, [])

  async function carregarClientes() {
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .order('nome')
    setClientes(data || [])
    setLoading(false)
  }

  async function salvarCliente(e) {
    e.preventDefault()
    if (!form.nome.trim()) return
    setSalvando(true)
    const { error } = await supabase.from('clientes').insert([{
      nome: form.nome,
      telefone: form.telefone,
      email: form.email,
      observacoes: form.observacoes,
      ultima_visita: new Date().toISOString().split('T')[0]
    }])
    if (!error) {
      setForm({ nome: '', telefone: '', email: '', observacoes: '' })
      setMostrarForm(false)
      carregarClientes()
    }
    setSalvando(false)
  }

  async function excluirCliente(id) {
    if (!confirm('Excluir esta cliente?')) return
    await supabase.from('clientes').delete().eq('id', id)
    carregarClientes()
  }

  return (
    <div style={s.page}>

      {/* HEADER DA SEÇÃO */}
      <div style={s.secHeader}>
        <div>
          <h2 style={s.secTitulo}>Clientes</h2>
          <p style={s.secSub}>{clientes.length} cadastradas</p>
        </div>
        <button style={s.btnPrimario} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Nova cliente'}
        </button>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}
      {mostrarForm && (
        <div style={s.card}>
          <h3 style={s.formTitulo}>Nova cliente</h3>
          <form onSubmit={salvarCliente}>
            <div style={s.grid2}>
              <div style={s.campo}>
                <label style={s.label}>Nome *</label>
                <input style={s.input} placeholder="Nome completo"
                  value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Telefone</label>
                <input style={s.input} placeholder="(17) 99999-0000"
                  value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
              </div>
            </div>
            <div style={s.campo}>
              <label style={s.label}>E-mail</label>
              <input style={s.input} placeholder="email@exemplo.com" type="email"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div style={s.campo}>
              <label style={s.label}>Observações</label>
              <textarea style={{...s.input, height: '80px', resize: 'vertical'}}
                placeholder="Preferências, alergias, observações..."
                value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
            </div>
            <button type="submit" style={s.btnPrimario} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar cliente'}
            </button>
          </form>
        </div>
      )}

      {/* LISTA DE CLIENTES */}
      {loading && <p style={s.vazio}>Carregando...</p>}
      {!loading && clientes.length === 0 && (
        <p style={s.vazio}>Nenhuma cliente cadastrada ainda.</p>
      )}
      {clientes.map(c => (
        <div key={c.id} style={s.clienteCard}>
          <div style={s.clienteAvatar}>
            {c.nome?.charAt(0).toUpperCase()}
          </div>
          <div style={s.clienteInfo}>
            <p style={s.clienteNome}>{c.nome}</p>
            <p style={s.clienteDetalhe}>{c.telefone || 'Sem telefone'}</p>
            {c.observacoes && <p style={s.clienteObs}>{c.observacoes}</p>}
          </div>
          <div style={s.clienteAcoes}>
            {c.ultima_visita && (
              <span style={s.dataTag}>
                {new Date(c.ultima_visita + 'T12:00:00').toLocaleDateString('pt-BR')}
              </span>
            )}
            <button style={s.btnExcluir} onClick={() => excluirCliente(c.id)}>✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}

const s = {
  page: { maxWidth: '600px', margin: '0 auto', padding: '16px' },
  secHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  secTitulo: { fontSize: '18px', fontWeight: '600', color: '#2C2C2A' },
  secSub: { fontSize: '13px', color: '#888780', marginTop: '2px' },
  btnPrimario: { background: '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  card: { background: 'white', border: '1px solid #E8E6E0', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  formTitulo: { fontSize: '15px', fontWeight: '600', color: '#2C2C2A', marginBottom: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  campo: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5F5E5A', marginBottom: '6px' },
  input: { width: '100%', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#2C2C2A', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
  clienteCard: { background: 'white', border: '1px solid #E8E6E0', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' },
  clienteAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#E1F5EE', color: '#0F6E56', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 },
  clienteInfo: { flex: 1 },
  clienteNome: { fontSize: '15px', fontWeight: '600', color: '#2C2C2A' },
  clienteDetalhe: { fontSize: '13px', color: '#888780', marginTop: '2px' },
  clienteObs: { fontSize: '12px', color: '#B4B2A9', marginTop: '4px', fontStyle: 'italic' },
  clienteAcoes: { display: 'flex', alignItems: 'center', gap: '8px' },
  dataTag: { fontSize: '11px', color: '#888780', background: '#F1EFE8', padding: '3px 8px', borderRadius: '10px' },
  btnExcluir: { background: 'none', border: 'none', color: '#B4B2A9', cursor: 'pointer', fontSize: '14px', padding: '4px 8px', borderRadius: '6px' },
  vazio: { color: '#888780', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
}
