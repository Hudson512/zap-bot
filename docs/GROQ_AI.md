# Groq AI Integration

## Overview

ZapNode integra com o **Groq** para fornecer respostas automáticas inteligentes via WhatsApp usando modelos de linguagem avançados (LLMs). O sistema mantém contexto de conversação e responde automaticamente a mensagens que não são comandos.

## Arquitetura

### Camada de Serviço: `groq.service.js`

**Responsabilidades:**
- Gerenciar cliente Groq SDK
- Manter histórico de conversação (Map: chatId → messages[])
- Gerar respostas com contexto
- Limitar histórico (últimas 10 mensagens por padrão)

**Padrão:** Singleton (instância única compartilhada)

### Integração com Message Handler

```javascript
// Fluxo de Mensagem
User sends message
  → message.handler.js (handle)
  → isCommand() check
    ├─ YES → commandRegistry.execute()
    └─ NO  → handleRegularMessage()
              → groqService.generateResponse()
              → message.reply(aiResponse)
```

## Configuração

### Variáveis de Ambiente (.env)

```env
# Groq AI Configuration
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_TEMPERATURE=0.7
GROQ_MAX_TOKENS=1024
GROQ_SYSTEM_PROMPT=Você é um assistente virtual...

# Features
AI_RESPONSES=true
```

### Modelos Disponíveis

Segundo a documentação do Groq:

1. **llama-3.3-70b-versatile** (Padrão)
   - Melhor equilíbrio entre qualidade e velocidade
   - 128k tokens de contexto
   - Recomendado para uso geral

2. **llama-3.1-8b-instant**
   - Mais rápido, menor qualidade
   - 128k tokens de contexto
   - Bom para respostas rápidas

3. **mixtral-8x7b-32768**
   - Bom para tarefas complexas
   - 32k tokens de contexto

4. **gemma2-9b-it**
   - Eficiente e leve
   - 8k tokens de contexto

### Parâmetros de Configuração

**GROQ_TEMPERATURE** (0.0 - 2.0)
- `0.0` = Respostas determinísticas e conservadoras
- `0.7` = Balanceado (padrão)
- `1.5+` = Mais criativo e variado

**GROQ_MAX_TOKENS**
- Máximo de tokens na resposta
- `1024` = ~750 palavras (padrão)
- Ajuste conforme necessidade

**GROQ_SYSTEM_PROMPT**
- Define a personalidade e comportamento do bot
- Use para personalizar o tom e estilo de resposta

## Gestão de Conversação

### Chat ID Format

```javascript
chatId = `${sessionId}-${contactNumber}@c.us`
// Exemplo: "default-244929782402@c.us"
```

**Importante:** O chat_id combina sessão + contato para isolar conversas entre diferentes sessões WhatsApp.

### Histórico de Mensagens

**Estrutura:**
```javascript
conversationHistory.set(chatId, [
  { role: "user", content: "Olá!" },
  { role: "assistant", content: "Olá! Como posso ajudar?" },
  { role: "user", content: "Me fale sobre..." },
  // ... até maxHistoryLength (padrão: 10)
]);
```

**Comportamento:**
- Mantém últimas N mensagens (evita limite de tokens)
- Primeira mensagem antiga é removida quando excede limite
- Histórico independente por chat_id

### Limpeza de Histórico

```javascript
// Via comando
!ai clear

// Programaticamente
groqService.clearHistory(chatId);
```

## API do Serviço

### `groqService.initialize()`
Inicializa o cliente Groq. Chamado automaticamente quando WhatsApp está pronto.

### `groqService.generateResponse(userMessage, chatId, sessionId)`
```javascript
const response = await groqService.generateResponse(
  "Qual é a capital de Angola?",
  "default-244929782402@c.us",
  "default"
);
// Returns: "A capital de Angola é Luanda."
```

### `groqService.clearHistory(chatId)`
```javascript
groqService.clearHistory("default-244929782402@c.us");
// Limpa histórico desta conversa específica
```

### `groqService.isReady()`
```javascript
if (groqService.isReady()) {
  // Serviço inicializado e pronto
}
```

### `groqService.getStats()`
```javascript
const stats = groqService.getStats();
// {
//   initialized: true,
//   activeConversations: 5,
//   maxHistoryLength: 10,
//   model: "llama-3.3-70b-versatile"
// }
```

## Comandos do Bot

### `!ai status`
Mostra status do bot de IA e configurações.

**Resposta:**
```
✅ Status do Bot de IA

• Status: Ativo
• Modelo: llama-3.3-70b-versatile
• Temperatura: 0.7
• Max Tokens: 1024
```

### `!ai stats`
Mostra estatísticas de uso.

**Resposta:**
```
📊 Estatísticas do Bot de IA

• Inicializado: Sim ✅
• Conversas Ativas: 3
• Histórico Máx: 10 mensagens
• Modelo: llama-3.3-70b-versatile
```

### `!ai clear`
Limpa histórico de conversação do usuário atual.

**Resposta:**
```
🗑️ Histórico de conversa limpo!

O bot de IA não se lembrará de mensagens anteriores desta conversa.
```

### `!ai on/off`
Informa sobre como ativar/desativar o bot.

## Fluxo de Inicialização

```javascript
// 1. Server starts
app/server.js

// 2. WhatsApp client initializes
whatsapp.service.js → initialize()

// 3. Client ready event
client.on("ready") → {
  if (config.features.aiResponses) {
    groqService.initialize() // 4. Groq service starts
  }
}

// 5. Messages are processed
client.on("message") → messageHandler.handle()
  → handleRegularMessage()
  → groqService.generateResponse()
```

## Tratamento de Erros

### Rate Limit
Se limite de requisições for atingido:
```
Desculpe, estou recebendo muitas solicitações no momento. 
Por favor, tente novamente em alguns instantes. ⏳
```

### API Key Inválida
```
Desculpe, há um problema com minha configuração. 
Por favor, contate o administrador. 🔧
```

### Erro Genérico
```
Desculpe, não consegui processar sua mensagem no momento. 
Por favor, tente novamente. ❌
```

**Logs:** Todos os erros são registrados em `logger.error()` para debugging.

## Rate Limits (Groq)

Segundo a documentação oficial:

**Free Tier:**
- 30 requisições por minuto
- 14,400 tokens por minuto
- ~10-20 mensagens por minuto (dependendo do tamanho)

**Paid Tiers:**
- Limites maiores conforme plano
- Ver: https://console.groq.com/docs/rate-limits

**Estratégia:** O serviço retorna mensagem amigável se limite for atingido.

## Boas Práticas

### 1. System Prompt Efetivo
```env
GROQ_SYSTEM_PROMPT=Você é um atendente de suporte técnico da empresa XYZ. Seja profissional, educado e objetivo. Sempre ofereça ajuda adicional ao final da resposta.
```

### 2. Controle de Histórico
```javascript
// Aumentar limite para conversas complexas
this.maxHistoryLength = 20; // Padrão: 10

// Limpar histórico após inatividade (futura feature)
setTimeout(() => {
  groqService.clearHistory(chatId);
}, 30 * 60 * 1000); // 30 minutos
```

### 3. Desabilitar AI para Comandos
**O sistema já faz isso automaticamente:**
```javascript
if (helpers.isCommand(message.body)) {
  // Processa como comando (não envia para IA)
} else {
  // Envia para IA
}
```

### 4. Multi-Session Isolation
Chat IDs incluem sessionId, garantindo que:
- Sessão "jpanzo" → "jpanzo-244929782402@c.us"
- Sessão "default" → "default-244929782402@c.us"

**Resultado:** Históricos completamente separados!

## Exemplo de Uso

### Conversa Simples
```
User: Olá!
Bot: Olá! Como posso ajudá-lo hoje?

User: Me fale sobre Angola
Bot: Angola é um país localizado na costa ocidental da África...
```

### Com Contexto
```
User: Qual é a capital de Angola?
Bot: A capital de Angola é Luanda.

User: E quantos habitantes tem?
Bot: Luanda tem aproximadamente 8,3 milhões de habitantes, sendo a cidade mais populosa do país.
```

### Comando vs Mensagem Regular
```
User: !ai status
Bot: [Resposta sobre status do bot]

User: Como você está?
Bot: [IA responde com contexto da conversa]
```

## Troubleshooting

### Bot não responde
1. Verifique `AI_RESPONSES=true` no .env
2. Verifique se `GROQ_API_KEY` está correto
3. Veja logs: `logger.error()` mostra detalhes
4. Teste: `!ai status`

### Respostas genéricas/ruins
1. Ajuste `GROQ_TEMPERATURE` (0.7 → 1.0 para mais criatividade)
2. Melhore o `GROQ_SYSTEM_PROMPT`
3. Tente modelo diferente (ex: `llama-3.3-70b-versatile`)

### Rate limit atingido
1. Adicione delay entre mensagens
2. Considere upgrade do plano Groq
3. Implemente fila de mensagens (futura feature)

### Histórico incorreto
1. Use `!ai clear` para resetar
2. Verifique se chat_id está correto
3. Reinicie servidor se necessário

## Segurança

### API Key
- **NUNCA** commite `.env` no Git
- Use `.gitignore` para proteger
- Regenere key se exposta

### System Prompt Injection
O sistema não valida/sanitiza prompts. Para produção:
- Limite caracteres especiais
- Filtre tentativas de manipulação
- Use moderation API se disponível

### Rate Limiting
- Implemente limiter por usuário (futura feature)
- Monitore uso via `getStats()`

## Roadmap

### Futuras Melhorias
- [ ] Suporte a imagens (via Groq Vision)
- [ ] Fila de mensagens com prioridade
- [ ] Cache de respostas similares
- [ ] Analytics de conversação
- [ ] Auto-limpeza de históricos inativos
- [ ] Limiter por usuário (anti-spam)
- [ ] Webhooks para notificações
- [ ] Integração com RAG (Retrieval Augmented Generation)

## Referências

- [Groq Documentation](https://console.groq.com/docs/overview)
- [Groq Quickstart](https://console.groq.com/docs/quickstart)
- [Groq Models](https://console.groq.com/docs/models)
- [Groq Rate Limits](https://console.groq.com/docs/rate-limits)
- [Groq SDK (NPM)](https://www.npmjs.com/package/groq-sdk)
