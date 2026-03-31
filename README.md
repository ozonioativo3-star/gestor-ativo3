# Gestor Ativo — Sistema de Gestão com Agente de Voz

## Passos finais de configuração

---

### PASSO 1 — Configurar as chaves no arquivo .env

Abra o arquivo `.env` e cole suas chaves:

```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...sua chave aqui
VITE_ANTHROPIC_KEY=sk-ant-...sua chave aqui
```

**Onde pegar:**
- Supabase: acesse seu projeto → Configurações (engrenagem) → API
- Anthropic: console.anthropic.com → API Keys → Create Key

---

### PASSO 2 — Criar as tabelas no Supabase

1. Acesse seu projeto no Supabase
2. Clique em "SQL Editor" no menu lateral
3. Copie TODO o conteúdo do arquivo `database.sql`
4. Cole no editor e clique em "Run"
5. Deve aparecer "Success" — tabelas e dados de exemplo criados!

---

### PASSO 3 — Instalar dependências e rodar

Abra o terminal no VS Code (Ctrl + ') e rode:

```bash
npm install
npm run dev
```

Abra o navegador em: http://localhost:3000

---

### PASSO 4 — Subir no GitHub

```bash
git init
git add .
git commit -m "primeiro commit — gestor ativo"
git remote add origin https://github.com/SEU_USUARIO/gestor-ativo.git
git push -u origin main
```

---

### PASSO 5 — Deploy no Vercel (opcional por enquanto)

1. Acesse vercel.com → "Add New Project"
2. Conecte seu GitHub e selecione o repositório gestor-ativo
3. Em "Environment Variables" adicione as mesmas chaves do .env
4. Clique em Deploy — em 2 minutos está no ar!

---

## Estrutura do projeto

```
gestor-ativo/
├── src/
│   ├── components/
│   │   └── voice/
│   │       └── VoiceAgent.jsx    ← Botão de voz + interface
│   ├── hooks/
│   │   └── useVoiceAgent.js      ← Lógica de voz (ouvir + falar)
│   ├── lib/
│   │   ├── agent.js              ← Cérebro do agente (Claude API)
│   │   ├── agentTools.js         ← Ferramentas que o agente usa
│   │   └── supabase.js           ← Conexão com o banco de dados
│   ├── pages/
│   │   └── Dashboard.jsx         ← Tela principal
│   ├── App.jsx
│   └── main.jsx
├── database.sql                  ← SQL para criar as tabelas
├── .env                          ← Suas chaves (nunca suba no GitHub!)
├── .gitignore                    ← Garante que .env não vai pro GitHub
├── index.html
├── package.json
└── vite.config.js
```

---

## Como usar o agente de voz

1. Abra o sistema no Chrome
2. Clique no botão verde (microfone)
3. Fale naturalmente:
   - **"Bom dia"** → resumo do dia + alertas
   - **"Quem vem hoje?"** → lista de agendamentos
   - **"Tem horário vago?"** → horários disponíveis
   - **"Informação sobre a Ana"** → dados da cliente
   - **"Quem não volta há mais de 30 dias?"** → clientes sumidas

---

## Próximas funcionalidades (roadmap)

- [ ] Tela de cadastro de clientes
- [ ] Tela de novo agendamento
- [ ] Histórico financeiro
- [ ] Login por estúdio (multi-tenant)
- [ ] Notificações WhatsApp
- [ ] Relatórios mensais
