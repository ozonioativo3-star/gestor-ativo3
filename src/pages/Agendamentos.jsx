import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [form, setForm] = useState({
    cliente_id: '', data: new Date().toISOString().split('T')[0],
    hora: '09:00', servico: '', valor: '', status: 'confirmado'
  })

  useEffect(() => {
    carregarAgendamentos()
    carregarClientes()
  }, [dataSelecionada])

  async function carregarAgendamentos() {
    const { data } = await supabase
      .from('agendamentos')
      .select('*, clientes(nome, telefone)')
      .eq('data', dataSelecionada)
      .order('hora')
    setAgendamentos(data || [])
    setLoading(false)
  }

  async function carregarClientes() {
    const { data } = await supabase.from('clientes').select('id, nome').order('nome')
    setClientes(data || [])
  }

  async function salvarAgendamento(e) {
    e.preventDefault()
    if (!form.cliente_id || !form.servico) return
    setSalvando(true)

    // Atualiza ultima_visita da cliente
    await supabase.from('clientes')
      .update({ ultima_visita: form.data })
      .eq('id', form.cliente_id)

    const { error } = await supabase.from('agendamentos').insert([{
      cliente_id: form.cliente_id,
      data: form.data,
      hora: form.hora,
      servico: form.servico,
      valor: form.valor ? parseFloat(form.valor) : null,
      status: form.status
    }])

    if (!error) {
      setForm({ cliente_id: '', data: dataSelecionada, hora: '09:00', servico: '', valor: '', status: 'confirmado' })
      setMostrarForm(false)
      carregarAgendamentos()
    }
    setSalvando(false)
  }

  async function mudarStatus(id, status) {
    await supabase.from('agendamentos').update({ status }).eq('id', id)
    carregarAgendamentos()
  }

  async function excluirAgendamento(id) {
    if (!confirm('Excluir este agendamento?')) return
    await supabase.from('agendamentos').delete().eq('id', id)
    carregarAgendamentos()
  }

  const statusCores = {
    confirmado: { bg: '#E1F5EE', color: '#0F6E56' },
    pendente:   { bg: '#FAEEDA', color: '#854F0B' },
    concluido:  { bg: '#E6F1FB', color: '#185FA5' },
    cancelado:  { bg: '#FCEBEB', color: '#A32D2D' },
  }

  const horarios = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']

  return (
    <div style={s.page}>

      {/* HEADER */}
      <div style={s.secHeader}>
        <div>
          <h2 style={s.secTitulo}>Agenda</h2>
          <p style={s.secSub}>{agendamentos.length} agendamentos</p>
        </div>
        <button style={s.btnPrimario} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Novo agendamento'}
        </button>
      </div>

      {/* SELETOR DE DATA */}
      <div style={s.dateBar}>
        <input
          type="date"
          style={s.dateInput}
          value={dataSelecionada}
          onChange={e => { setDataSelecionada(e.target.value); setLoading(true) }}
        />
        <button style={s.btnHoje} onClick={() => {
          setDataSelecionada(new Date().toISOString().split('T')[0])
          setLoading(true)
        }}>Hoje</button>
      </div>

      {/* FORMULÁRIO */}
      {mostrarForm && (
        <div style={s.card}>
          <h3 style={s.formTitulo}>Novo agendamento</h3>
          <form onSubmit={salvarAgendamento}>
            <div style={s.campo}>
              <label style={s.label}>Cliente *</label>
              <select style={s.input} value={form.cliente_id}
                onChange={e => setForm({...form, cliente_id: e.target.value})} required>
                <option value="">Selecione a cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div style={s.grid2}>
              <div style={s.campo}>
                <label style={s.label}>Data *</label>
                <input type="date" style={s.input} value={form.data}
                  onChange={e => setForm({...form, data: e.target.value})} required />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Horário *</label>
                <select style={s.input} value={form.hora}
                  onChange={e => setForm({...form, hora: e.target.value})}>
                  {horarios.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <div style={s.grid2}>
              <div style={s.campo}>
                <label style={s.label}>Serviço *</label>
                <input style={s.input} placeholder="Ex: Manicure, Pedicure..."
                  value={form.servico} onChange={e => setForm({...form, servico: e.target.value})} required />
              </div>
              <div style={s.campo}>
                <label style={s.label}>Valor (R$)</label>
                <input type="number" step="0.01" style={s.input} placeholder="0,00"
                  value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
              </div>
            </div>
            <div style={s.campo}>
              <label style={s.label}>Status</label>
              <select style={s.input} value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}>
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            <button type="submit" style={s.btnPrimario} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar agendamento'}
            </button>
          </form>
        </div>
      )}

      {/* LISTA */}
      {loading && <p style={s.vazio}>Carregando...</p>}
      {!loading && agendamentos.length === 0 && (
        <p style={s.vazio}>Nenhum agendamento para este dia.</p>
      )}
      {agendamentos.map(ag => {
        const cor = statusCores[ag.status] || statusCores.pendente
        return (
          <div key={ag.id} style={s.agCard}>
            <div style={s.horaCol}>
              <span style={s.hora}>{ag.hora?.slice(0,5)}</span>
            </div>
            <div style={s.agInfo}>
              <p style={s.agNome}>{ag.clientes?.nome}</p>
              <p style={s.agServico}>{ag.servico}</p>
              {ag.valor && <p style={s.agValor}>R$ {parseFloat(ag.valor).toFixed(2)}</p>}
            </div>
            <div style={s.agAcoes}>
              <select
                style={{...s.statusSelect, background: cor.bg, color: cor.color}}
                value={ag.status}
                onChange={e => mudarStatus(ag.id, e.target.value)}
              >
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="concluido">Concluido</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <button style={s.btnExcluir} onClick={() => excluirAgendamento(ag.id)}>✕</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const s = {
  page: { maxWidth: '600px', margin: '0 auto', padding: '16px' },
  secHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  secTitulo: { fontSize: '18px', fontWeight: '600', color: '#2C2C2A' },
  secSub: { fontSize: '13px', color: '#888780', marginTop: '2px' },
  btnPrimario: { background: '#0F6E56', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  dateBar: { display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center' },
  dateInput: { border: '1px solid #D3D1C7', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', color: '#2C2C2A', flex: 1 },
  btnHoje: { background: '#F1EFE8', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#5F5E5A', cursor: 'pointer', fontWeight: '600' },
  card: { background: 'white', border: '1px solid #E8E6E0', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  formTitulo: { fontSize: '15px', fontWeight: '600', color: '#2C2C2A', marginBottom: '16px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  campo: { marginBottom: '12px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: '#5F5E5A', marginBottom: '6px' },
  input: { width: '100%', border: '1px solid #D3D1C7', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', color: '#2C2C2A', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: 'white' },
  agCard: { background: 'white', border: '1px solid #E8E6E0', borderRadius: '12px', padding: '14px 16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' },
  horaCol: { minWidth: '50px' },
  hora: { fontSize: '16px', fontWeight: '700', color: '#0F6E56' },
  agInfo: { flex: 1 },
  agNome: { fontSize: '15px', fontWeight: '600', color: '#2C2C2A' },
  agServico: { fontSize: '13px', color: '#888780', marginTop: '2px' },
  agValor: { fontSize: '12px', color: '#0F6E56', fontWeight: '600', marginTop: '2px' },
  agAcoes: { display: 'flex', alignItems: 'center', gap: '8px' },
  statusSelect: { border: 'none', borderRadius: '10px', padding: '4px 8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' },
  btnExcluir: { background: 'none', border: 'none', color: '#B4B2A9', cursor: 'pointer', fontSize: '14px', padding: '4px 8px' },
  vazio: { color: '#888780', fontSize: '14px', textAlign: 'center', padding: '40px 0' },
}
