# ZapNode - Estrutura do Projeto

## 📂 Árvore de Arquivos

```
zapnode/
│
├── app/
│   ├── config/
│   │   └── index.js                    # Configurações centralizadas
│   │
│   ├── services/
│   │   └── whatsapp.service.js         # Serviço do WhatsApp
│   │
│   ├── handlers/
│   │   ├── event.handler.js            # Handler de eventos WhatsApp
│   │   └── message.handler.js          # Handler de mensagens
│   │
│   ├── commands/
│   │   ├── index.js                    # Registry de comandos
│   │   ├── ping.command.js             # Comando !ping
│   │   ├── help.command.js             # Comando !help
│   │   └── info.command.js             # Comando !info
│   │
│   ├── utils/
│   │   ├── logger.js                   # Sistema de logs
│   │   └── helpers.js                  # Funções auxiliares
│   │
│   ├── server.js                       # Entry point da aplicação
│   └── webhook.js                      # Rotas do webhook
│
├── node_modules/                       # Dependências
├── .wwebjs_auth/                       # Sessão do WhatsApp (auto-gerado)
├── .env                                # Variáveis de ambiente (não commitar!)
├── .env.example                        # Exemplo de .env
├── .gitignore                          # Arquivos ignorados pelo git
├── package.json                        # Configuração do projeto
├── package-lock.json                   # Lock de dependências
├── README.md                           # Documentação principal
└── ARCHITECTURE.md                     # Documentação da arquitetura
```

## 📝 Descrição dos Módulos

### **config/**
Centraliza todas as configurações usando variáveis de ambiente.

### **services/**
Camada de serviços com lógica de negócio encapsulada.

### **handlers/**
Processadores de eventos e mensagens do WhatsApp.

### **commands/**
Sistema extensível de comandos com auto-registro.

### **utils/**
Ferramentas utilitárias reutilizáveis (logging, helpers).

### **server.js**
Ponto de entrada que inicializa todos os serviços.

### **webhook.js**
Endpoints da API REST para integração externa.

## 🚀 Comandos Rápidos

```bash
# Instalar dependências
npm install

# Iniciar aplicação
npm start

# Verificar saúde da aplicação
curl http://localhost:3000/health

# Enviar mensagem de teste via webhook
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"244929782402","message":"Teste"}'
```

## 🔌 Extensibilidade

### Adicionar Novo Comando

1. **Criar arquivo** `app/commands/meucomando.command.js`:
```javascript
module.exports = {
  name: "meucomando",
  description: "O que o comando faz",
  usage: "!meucomando [args]",
  async execute(message, args) {
    await message.reply("Resposta do comando");
    return true;
  },
};
```

2. **Registrar em** `app/commands/index.js`:
```javascript
const meuComando = require("./meucomando.command");
this.register(meuComando);
```

### Adicionar Novo Serviço

1. Criar arquivo em `app/services/meuservico.service.js`
2. Implementar lógica como singleton
3. Exportar e importar onde necessário

### Adicionar Novo Handler

1. Criar arquivo em `app/handlers/meuhandler.handler.js`
2. Implementar lógica de processamento
3. Conectar ao serviço WhatsApp conforme necessário

## 📊 Fluxo de Dados

```
Usuário envia mensagem
        ↓
WhatsApp Web
        ↓
whatsapp.service.js (captura evento "message")
        ↓
message.handler.js (processa mensagem)
        ↓
┌───────────────┐
│ É um comando? │
└───────────────┘
    │           │
   Sim         Não
    │           │
    ↓           ↓
commands/    handleRegularMessage()
index.js
    │
    ↓
comando.execute()
    │
    ↓
Resposta ao usuário
```

## 🛡️ Segurança

- Nunca commitar arquivo `.env`
- Usar variáveis de ambiente para dados sensíveis
- Validar inputs de webhooks
- Implementar rate limiting em produção

## 📚 Documentação Adicional

- [README.md](README.md) - Guia de uso
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura detalhada
