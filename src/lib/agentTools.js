import { supabase } from './supabase'

// ─── FERRAMENTAS QUE O AGENTE PODE CHAMAR ───────────────────────────
// Cada função busca dados reais do Supabase

export async function buscarAgendamentosHoje() {
  const hoje = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*, clientes(nome, telefone)')
    .eq('data', hoje)
    .order('hora', { ascending: true })
  if (error) return { erro: error.message }
  return { agendamentos: data || [], total: data?.length || 0 }
}

export async function buscarCliente(nome) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .ilike('nome', `%${nome}%`)
    .limit(3)
  if (error) return { erro: error.message }
  return { clientes: data || [] }
}

export async function clientesSemRetorno(dias = 30) {
  const limite = new Date()
  limite.setDate(limite.getDate() - dias)
  const { data, error } = await supabase
    .from('clientes')
    .select('nome, telefone, ultima_visita')
    .lt('ultima_visita', limite.toISOString().split('T')[0])
    .order('ultima_visita', { ascending: true })
    .limit(5)
  if (error) return { erro: error.message }
  return { clientes: data || [], total: data?.length || 0 }
}

export async function horariosVagosHoje() {
  const hoje = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('agendamentos')
    .select('hora')
    .eq('data', hoje)
  const ocupados = (data || []).map(a => a.hora)
  const todosHorarios = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']
  const vagos = todosHorarios.filter(h => !ocupados.includes(h))
  return { vagos, total: vagos.length }
}

export async function historicoCliente(clienteId) {
  const { data, error } = await supabase
    .from('agendamentos')
    .select('data, servico, valor, status')
    .eq('cliente_id', clienteId)
    .order('data', { ascending: false })
    .limit(5)
  if (error) return { erro: error.message }
  return { historico: data || [] }
}

// ─── MAPA DE FERRAMENTAS PARA O AGENTE ──────────────────────────────
export const ferramentas = {
  buscarAgendamentosHoje,
  buscarCliente,
  clientesSemRetorno,
  horariosVagosHoje,
  historicoCliente,
}

// ─── DEFINIÇÃO DAS FERRAMENTAS PARA A API DO CLAUDE ─────────────────
export const toolDefinitions = [
  {
    name: 'buscarAgendamentosHoje',
    description: 'Busca todos os agendamentos do dia atual com nome e telefone das clientes',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'buscarCliente',
    description: 'Busca informações de uma cliente pelo nome',
    input_schema: {
      type: 'object',
      properties: { nome: { type: 'string', description: 'Nome da cliente' } },
      required: ['nome']
    }
  },
  {
    name: 'clientesSemRetorno',
    description: 'Lista clientes que não aparecem há X dias',
    input_schema: {
      type: 'object',
      properties: { dias: { type: 'number', description: 'Número de dias sem retorno' } },
      required: []
    }
  },
  {
    name: 'horariosVagosHoje',
    description: 'Retorna os horários disponíveis para agendamento hoje',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'historicoCliente',
    description: 'Busca o histórico de serviços de uma cliente pelo ID',
    input_schema: {
      type: 'object',
      properties: { clienteId: { type: 'string', description: 'ID da cliente' } },
      required: ['clienteId']
    }
  }
]
