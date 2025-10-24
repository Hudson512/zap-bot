# ZapNode - WhatsApp Integration

Sistema modular e escalável para integração com WhatsApp usando Node.js.

## ✨ Características

- 🔐 Autenticação persistente com LocalAuth
- 📱 **Suporte a múltiplas sessões** (múltiplas contas WhatsApp)
- 💾 **Persistência de dados com SQLite**
- 🤖 **Bot de IA com Groq** (respostas automáticas inteligentes)
- 🎯 Sistema de comandos extensível
- 🔌 Webhook para integração externa
- 🎨 Sistema de logging estruturado
- 🚀 Arquitetura modular e escalável
- 🛡️ Filtragem de mensagens (grupos, status, newsletters)
- 📊 **Estatísticas e analytics**

## 📁 Estrutura do Projeto

```
app/
├── config/              # Configurações centralizadas
│   └── index.js
├── services/            # Serviços (WhatsApp, Database, AI, etc)
│   ├── whatsapp.service.js
│   ├── session.manager.js
│   ├── database.service.js
│   └── groq.service.js
├── handlers/            # Handlers de eventos e mensagens
│   ├── event.handler.js
│   └── message.handler.js
├── commands/            # Sistema de comandos
│   ├── index.js
│   ├── ping.command.js
│   ├── help.command.js
│   ├── info.command.js
│   ├── stats.command.js
│   └── ai.command.js
├── routes/              # Rotas da API
│   ├── sessions.routes.js
│   └── database.routes.js
├── utils/               # Utilitários
│   ├── logger.js
│   └── helpers.js
├── server.js            # Entry point
└── webhook.js           # Rotas do webhook
data/
└── zapnode.db           # SQLite database (auto-created)
```

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e ajuste as configurações:
```bash
cp .env.example .env
```

### 3. Iniciar o Servidor
```bash
npm start
```

### 4. Escanear QR Code
Ao iniciar, um QR Code será exibido no terminal. Escaneie com seu WhatsApp.

### 5. Acessar Documentação da API
Abra no navegador: **http://localhost:3000/api-docs**

## 📚 Documentação da API (Swagger)

O ZapNode inclui documentação interativa da API usando **Swagger UI**:

- **URL:** http://localhost:3000/api-docs
- **JSON:** http://localhost:3000/api-docs.json

### Recursos do Swagger:
- 📖 Documentação completa de todos os endpoints
- 🧪 Teste interativo das APIs diretamente no navegador
- � Schemas e exemplos de request/response
- 🔍 Busca e filtros por tags

### Endpoints Principais:

#### Health
- `GET /health` - Status da aplicação

#### Sessions (Multi-Sessão)
- `GET /sessions` - Listar todas as sessões
- `POST /sessions` - Criar nova sessão
- `GET /sessions/:id` - Detalhes de uma sessão
- `GET /sessions/:id/status` - Status da sessão
- `POST /sessions/:id/send` - Enviar mensagem
- `DELETE /sessions/:id` - Deletar sessão

#### Database (Persistência)
- `GET /database/stats` - Estatísticas gerais
- `GET /database/sessions` - Sessões no banco
- `GET /database/messages` - Histórico de mensagens
- `GET /database/messages/search` - Buscar mensagens
- `GET /database/contacts` - Listar contatos
- `GET /database/contacts/top` - Top contatos
- `GET /database/commands/stats` - Estatísticas de comandos
- `POST /database/cleanup` - Limpar dados antigos

#### Webhook
- `POST /webhook` - Receber mensagens externas

## 📝 Comandos Disponíveis

- `!ping` - Testa a responsividade do bot
- `!help` - Mostra todos os comandos disponíveis
- `!info` - Informações do sistema
- `!stats` - Estatísticas do database
- `!ai status` - Status do bot de IA
- `!ai stats` - Estatísticas do bot de IA
- `!ai clear` - Limpar histórico de conversação

## 🤖 Bot de IA com Groq

O ZapNode integra com a **Groq API** para fornecer respostas automáticas inteligentes usando modelos de linguagem avançados (LLMs).

### Características do Bot de IA:
- ✅ Respostas automáticas em conversas naturais
- 🧠 Mantém contexto da conversação (últimas 10 mensagens)
- 🌐 Multi-idioma (responde no idioma do usuário)
- ⚡ Velocidade ultrarrápida com Groq
- 🔧 Totalmente configurável via variáveis de ambiente

### Configuração Rápida:

1. **Obter API Key do Groq:**
   - Acesse: https://console.groq.com/
   - Crie uma conta gratuita
   - Gere sua API key

2. **Configurar no .env:**
```env
GROQ_API_KEY=sua_api_key_aqui
AI_RESPONSES=true
GROQ_MODEL=llama-3.3-70b-versatile
```

3. **Reiniciar servidor:**
```bash
npm start
```

### Comandos do Bot de IA:
```bash
!ai status  # Ver status e configurações
!ai stats   # Ver estatísticas de uso
!ai clear   # Limpar histórico desta conversa
```

### Exemplo de Conversa:
```
Você: Olá!
Bot: Olá! Como posso ajudá-lo hoje?

Você: Me fale sobre Angola
Bot: Angola é um país localizado na costa ocidental da África...

Você: Qual é a capital?
Bot: A capital de Angola é Luanda, que também é a cidade mais populosa do país.
```

**📚 Documentação completa:** [GROQ_AI.md](docs/GROQ_AI.md)

## 🔧 Adicionar Novos Comandos

1. Crie um arquivo em `app/commands/` (ex: `exemplo.command.js`):

```javascript
const logger = require("../utils/logger");

module.exports = {
  name: "exemplo",
  description: "Descrição do comando",
  usage: "!exemplo [argumentos]",
  
  async execute(message, args) {
    try {
      // Sua lógica aqui
      await message.reply("Resposta do comando");
      logger.success("Comando executado");
      return true;
    } catch (error) {
      logger.error("Erro:", error.message);
      return false;
    }
  },
};
```

2. Registre o comando em `app/commands/index.js`:

```javascript
const exemploCommand = require("./exemplo.command");
this.register(exemploCommand);
```

## 🌐 Endpoints da API

### Health Check
```
GET /health
```

Retorna o status do servidor, conexão WhatsApp e todas as sessões ativas.

### Sessões (Multi-Session Support)

#### Listar sessões
```
GET /sessions
```

#### Criar nova sessão
```
POST /sessions
Body: { "sessionId": "my-session", "headless": true }
```

#### Enviar mensagem por sessão
```
POST /sessions/:sessionId/send
Body: { "phoneNumber": "244929782402", "message": "Hello!" }
```

#### Deletar sessão
```
DELETE /sessions/:sessionId
```

**📚 Veja a documentação completa em [MULTI_SESSION.md](MULTI_SESSION.md)**

### Webhook Principal
```
POST /webhook
```

Recebe mensagens do sistema externo e envia via WhatsApp.

**Payload com sessão específica:**
```json
{
  "message_type": "outgoing",
  "private": false,
  "sessionId": "my-session",
  "conversation": {
    "meta": {
      "sender": { "phone_number": "244929782402" }
    }
  },
  "content": "Message text"
}
```

### Webhook de Teste
```
POST /webhook/test
```

Payload:
```json
{
  "phoneNumber": "244929782402",
  "message": "Mensagem de teste",
  "sessionId": "default"
}
```

## � Estrutura Modular

### Services
Camada de serviços que encapsula a lógica de negócio.

### Handlers
Processam eventos e mensagens do WhatsApp.

### Commands
Sistema extensível de comandos com registro automático.

### Utils
Funções utilitárias reutilizáveis.

### Config
Configurações centralizadas com suporte a variáveis de ambiente.

## 🛠️ Tecnologias

- Node.js
- Express
- whatsapp-web.js
- dotenv

## 📄 Licença

ISC

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configurações do Chatwoot
CHATWOOT_URL=https://app.chatwoot.com
CHATWOOT_ACCOUNT_ID=id_da_sua_conta
CHATWOOT_API_TOKEN=seu_token_aqui
CHATWOOT_INBOX_ID=id_da_caixa_de_entrada_criada

# Configurações do servidor
PORT=3000
```

### 4. Crie a pasta do banco de dados

```bash
mkdir db
```

## 🚀 Como Usar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm start
```

### Primeira execução

1. Execute o projeto
2. Escaneie o QR Code que aparecerá no terminal com o WhatsApp Web
3. Configure o webhook no Chatwoot apontando para: `http://seu-servidor:3000/webhook`

## 🏗️ Estrutura do Projeto

```text
zapnode.codigofonte.tv/
├── app/
│   ├── server.js      # Servidor principal
│   ├── whatsapp.js    # Integração com WhatsApp Web
│   └── webhook.js     # Endpoint para receber webhooks do Chatwoot
├── db/                # Banco de dados SQLite (criado automaticamente)
├── package.json       # Dependências e scripts
├── .env              # Variáveis de ambiente (criar)
└── README.md         # Este arquivo
```

## 🔧 Configuração do Chatwoot

1. Acesse as configurações da sua conta no Chatwoot
2. Vá para "Caixas de Entrada" > "Adicionar Caixa de Entrada"
3. Escolha "API"

- Nome do canal: `WhatsApp`
- URL do webhook: `http://seu-servidor:3000/webhook`

## 📝 Funcionalidades Atuais

- ✅ Conecta ao WhatsApp Web via puppeteer
- ✅ Recebe mensagens do WhatsApp e envia para o Chatwoot
- ✅ Recebe respostas do Chatwoot e envia para o WhatsApp
- ✅ Armazena contatos em banco SQLite
- ✅ Gera QR Code para autenticação

## 🐛 Problemas Conhecidos

- Autenticação do WhatsApp pode expirar e precisar ser refeita
- Sem tratamento de reconexão automática
- Logs limitados para debugging
- Falta validação de dados de entrada

## 👨‍💻 Autor

Gabriel Froes (para o Código Fonte TV)

- Video: [ZapNode - Integração WhatsApp + Chatwoot](https://www.youtube.com/@codigofontetv)

---

**⚠️ Lembrete:** Este é um protótipo experimental. Use apenas para testes e desenvolvimento. Não recomendado para produção sem os devidos aprimoramentos de segurança e estabilidade.
