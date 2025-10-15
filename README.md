# ZapNode - WhatsApp Integration

Sistema modular e escalável para integração com WhatsApp usando Node.js.

## 📁 Estrutura do Projeto

```
app/
├── config/              # Configurações centralizadas
│   └── index.js
├── services/            # Serviços (WhatsApp, etc)
│   └── whatsapp.service.js
├── handlers/            # Handlers de eventos e mensagens
│   ├── event.handler.js
│   └── message.handler.js
├── commands/            # Sistema de comandos
│   ├── index.js
│   ├── ping.command.js
│   └── help.command.js
├── utils/               # Utilitários
│   ├── logger.js
│   └── helpers.js
├── server.js            # Entry point
└── webhook.js           # Rotas do webhook
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

## 📝 Comandos Disponíveis

- `!ping` - Testa a responsividade do bot
- `!help` - Mostra todos os comandos disponíveis

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

Retorna o status do servidor e conexão WhatsApp.

### Webhook Principal
```
POST /webhook
```

Recebe mensagens do sistema externo e envia via WhatsApp.

### Webhook de Teste
```
POST /webhook/test
```

Payload:
```json
{
  "phoneNumber": "244929782402",
  "message": "Mensagem de teste"
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
