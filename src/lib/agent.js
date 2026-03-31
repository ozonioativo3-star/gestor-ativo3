import { ferramentas, toolDefinitions } from './agentTools'

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_KEY

// ─── SYSTEM PROMPT DO AGENTE ─────────────────────────────────────────
const SYSTEM_PROMPT = `Você é a assistente virtual do estúdio, chamada Ativa.

Você fala em português brasileiro, de forma simpática, direta e profissional.
Suas respostas devem ser CURTAS — você está sendo ouvida por voz, não lida.
Máximo 3 frases por resposta.

Quando a profissional disser "bom dia", "oi", "ativar" ou qualquer saudação:
1. Use a ferramenta buscarAgendamentosHoje
2. Use a ferramenta clientesSemRetorno com 30 dias
3. Responda com um resumo falado do dia e alerte sobre clientes sumidas

Regras importantes:
- NUNCA invente dados. Se não souber, use uma ferramenta para buscar.
- Se a ferramenta retornar vazio, diga que não encontrou nada.
- Seja proativa: se detectar horário vago, mencione.
- Se um cliente deve pagamento, avise discretamente.
- Seja natural, como uma assistente real falando.

Exemplos de resposta curta:
- "Bom dia! Você tem 5 clientes hoje. A primeira é a Ana às 9h. A Carol não volta há 35 dias, quer ligar pra ela?"
- "A Maria tem agendamento às 14h para manicure. Ela veio 3 vezes esse mês."
- "Você tem horário vago às 15h e 17h hoje."`

// ─── CHAMADA PRINCIPAL DO AGENTE ────────────────────────────────────
export async function chamarAgente(mensagem, historico = []) {
  const messages = [
    ...historico,
    { role: 'user', content: mensagem }
  ]

  let response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages
    })
  })

  let data = await response.json()

  // ─── LOOP DE TOOL USE ────────────────────────────────────────────
  while (data.stop_reason === 'tool_use') {
    const assistantMessage = { role: 'assistant', content: data.content }
    const toolResults = []

    for (const block of data.content) {
      if (block.type === 'tool_use') {
        const fn = ferramentas[block.name]
        let resultado = { erro: 'Ferramenta não encontrada' }
        if (fn) {
          resultado = await fn(block.input?.nome || block.input?.dias || block.input?.clienteId)
        }
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(resultado)
        })
      }
    }

    // Envia resultado das ferramentas de volta para o Claude
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: toolDefinitions,
        messages: [...messages, assistantMessage, { role: 'user', content: toolResults }]
      })
    })
    data = await response.json()
  }

  // Extrai texto final da resposta
  const texto = data.content
    ?.filter(b => b.type === 'text')
    ?.map(b => b.text)
    ?.join(' ') || 'Não consegui processar sua solicitação.'

  return texto
}
