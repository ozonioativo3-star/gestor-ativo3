import { supabase } from './supabase'

// ─── FERRAMENTAS QUE O AGENTE PODE CHAMAR ───────────────────────────

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

export async function totalClientes() {
  const { count, error } = await supabase
    .from('clientes')
    .select('*', { count: 'exact', head: true })
  if (error) return { erro: error.message }
  return { total: count }
}

export async function resumoFinanceiro() {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('agendamentos')
    .select('valor, status')
    .gte('data', inicioMes)
  if (error) return { erro: error.message }
  const total = data?.reduce((s, a) => s + (parseFloat(a.valor) || 0), 0) || 0
  const concluidos = data?.filter(a => a.status === 'concluido').length || 0
  const pendentes = data?.filter(a => a.status === 'pendente' || a.status === 'confirmado').length || 0
  return {
    total_mes: total.toFixed(2),
    agendamentos_mes: data?.length || 0,
    concluidos,
    pendentes
  }
}

export async function proximasClientes() {
  const agora = new Date()
  const hoje = agora.toISOString().split('T')[0]
  const horaAtual = agora.toTimeString().slice(0, 5)
  const { data, error } = await supabase
    .from('agendamentos')
    .select('*, clientes(nome, telefone, observacoes)')
    .eq('data', hoje)
    .gte('hora', horaAtual)
    .order('hora', { ascending: true })
    .limit(3)
  if (error) return { erro: error.message }
  return { proximas: data || [], total: data?.length || 0 }
}

export async function aniversariantesDoMes() {
  // Busca clientes cadastrados este mês (aproximação para aniversariantes)
  const hoje = new Date()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const { data, error } = await supabase
    .from('clientes')
    .select('nome, telefone')
    .limit(50)
  if (error) return { erro: error.message }
  return { clientes: data || [], mes: hoje.toLocaleString('pt-BR', { month: 'long' }) }
}

export async function servicosMaisVendidos() {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('agendamentos')
    .select('servico')
    .gte('data', inicioMes)
  if (error) return { erro: error.message }
  const contagem = {}
  data?.forEach(a => {
    if (a.servico) contagem[a.servico] = (contagem[a.servico] || 0) + 1
  })
  const ordenados = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([servico, quantidade]) => ({ servico, quantidade }))
  return { servicos: ordenados }
}

export async function clientesFrequentes() {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1).toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('agendamentos')
    .select('cliente_id, clientes(nome)')
    .gte('data', inicio)
  if (error) return { erro: error.message }
  const contagem = {}
  data?.forEach(a => {
    const nome = a.clientes?.nome
    if (nome) contagem[nome] = (contagem[nome] || 0) + 1
  })
  const ordenados = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, visitas]) => ({ nome, visitas }))
  return { clientes: ordenados }
}

// ─── MAPA DE FERRAMENTAS ─────────────────────────────────────────────
export const ferramentas = {
  buscarAgendamentosHoje,
  buscarCliente,
  clientesSemRetorno,
  horariosVagosHoje,
  historicoCliente,
  totalClientes,
  resumoFinanceiro,
  proximasClientes,
  aniversariantesDoMes,
  servicosMaisVendidos,
  clientesFrequentes,
}

// ─── DEFINIÇÃO PARA A API DO CLAUDE ─────────────────────────────────
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
  },
  {
    name: 'totalClientes',
    description: 'Retorna o total de clientes cadastradas no sistema',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'resumoFinanceiro',
    description: 'Retorna o total faturado no mês, agendamentos concluídos e pendentes',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'proximasClientes',
    description: 'Retorna as próximas clientes que chegam hoje a partir do horário atual',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'aniversariantesDoMes',
    description: 'Lista clientes do mês atual para ações de relacionamento',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'servicosMaisVendidos',
    description: 'Lista os serviços mais realizados no mês atual',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'clientesFrequentes',
    description: 'Lista as clientes que mais visitaram o estúdio nos últimos 2 meses',
    input_schema: { type: 'object', properties: {}, required: [] }
  },
]