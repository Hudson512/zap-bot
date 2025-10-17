# Sistema de Chat - Documentação

## 📋 Visão Geral

O sistema de chat foi redesenhado para facilitar a organização e recuperação de conversas. Cada conversa é identificada por um único `chat_id` que combina o **sessionId** com o **número do outro usuário**, garantindo que cada sessão tenha seus próprios chats separados.

## 🎯 Conceito Principal

### Chat ID = SessionId + Número do Outro Usuário

```
┌─────────────────────────────────────────────────┐
│  Sessão: jpanzo (244921395315@c.us)             │
│                                                  │
│  Conversando com: 244929782402@c.us             │
│  ┌────────────────────────────────────────┐     │
│  │ chat_id: jpanzo-244929782402@c.us      │     │
│  │                                        │     │
│  │ • Eu envio → from: 244921395315       │     │
│  │             to: 244929782402          │     │
│  │             chat_id: jpanzo-244929... ✓│    │
│  │                                        │     │
│  │ • Eu recebo ← from: 244929782402      │     │
│  │              to: null                 │     │
│  │              chat_id: jpanzo-244929... ✓│   │
│  └────────────────────────────────────────┘     │
│                                                  │
│  TODAS as mensagens com 244929782402            │
│  na sessão jpanzo ficam no MESMO chat_id        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Sessão: default (244958121460@c.us)            │
│                                                  │
│  Conversando com: 244929782402@c.us (MESMO!)    │
│  ┌────────────────────────────────────────┐     │
│  │ chat_id: default-244929782402@c.us     │     │
│  │                                        │     │
│  │ CHAT DIFERENTE da sessão jpanzo! ✓    │     │
│  └────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

**Vantagem:** Duas sessões podem conversar com o mesmo número sem conflito!

## 🔄 Como Funciona

### 1. Salvamento de Mensagens

**Mensagem Enviada (você → contato):**
```javascript
{
  from: "244921395315@c.us",     // Seu número (sessão jpanzo)
  to: "244929782402@c.us",       // Destinatário
  chat_id: "jpanzo-244929782402@c.us" // ← SessionId + outro usuário
}
```

**Mensagem Recebida (contato → você):**
```javascript
{
  from: "244929782402@c.us",      // Remetente
  to: null,                       // Você (implícito)
  chat_id: "jpanzo-244929782402@c.us" // ← SessionId + outro usuário
}
```

### 2. Lógica de Determinação do chat_id

```javascript
// Em database.service.js - saveMessage()

// Se a mensagem tem campo "to", significa que VOCÊ enviou
// contactNumber = destinatário (to)

// Se a mensagem só tem "from", significa que você RECEBEU
// contactNumber = remetente (from)

const contactNumber = message.to ? message.to : message.from;
const chatId = `${sessionId}-${contactNumber}`;
```

**Resultado:** O `chat_id` é sempre `sessionId-número_do_outro_usuário`! 🎯

## 📡 Endpoints da API

### 1. Listar Todos os Chats

```http
GET /database/chats?sessionId=jpanzo&limit=50
```

**Resposta:**
```json
{
  "success": true,
  "sessionId": "jpanzo",
  "count": 3,
  "data": [
    {
      "chat_id": "jpanzo-244929782402@c.us",
      "session_id": "jpanzo",
      "contact_number": "244929782402@c.us",
      "message_count": 15,
      "last_message_time": "2025-10-17T10:30:00.000Z",
      "last_message": "Obrigado!",
      "last_message_type": "chat",
      "last_has_media": 0
    },
    {
      "chat_id": "jpanzo-244947231653@c.us",
      "session_id": "jpanzo",
      "contact_number": "244947231653@c.us",
      "message_count": 8,
      "last_message_time": "2025-10-17T09:15:00.000Z",
      "last_message": "Bom dia",
      "last_message_type": "chat",
      "last_has_media": 0
    }
  ]
}
```

**O que retorna:**
- Lista de conversas únicas (um `chat_id` por contato **na sessão**)
- `contact_number` extraído do `chat_id` para facilitar display
- Contagem de mensagens em cada chat
- Preview da última mensagem
- Timestamp da última atividade
- Ordenado por mais recente primeiro

### 2. Ver Mensagens de um Chat Específico

```http
GET /database/chats/jpanzo-244929782402@c.us/messages?sessionId=jpanzo&limit=50
```

**Resposta:**
```json
{
  "success": true,
  "sessionId": "jpanzo",
  "chatId": "jpanzo-244929782402@c.us",
  "count": 15,
  "limit": 50,
  "offset": 0,
  "data": [
    {
      "id": "msg_001",
      "session_id": "jpanzo",
      "from_number": "244929782402@c.us",
      "to_number": null,
      "chat_id": "jpanzo-244929782402@c.us",
      "body": "Oi, tudo bem?",
      "timestamp": "2025-10-17T10:00:00.000Z"
    },
    {
      "id": "msg_002",
      "session_id": "jpanzo",
      "from_number": "244921395315@c.us",  // Você respondeu
      "to_number": "244929782402@c.us",
      "chat_id": "jpanzo-244929782402@c.us",  // Mesmo chat_id!
      "body": "Sim, e você?",
      "timestamp": "2025-10-17T10:01:00.000Z"
    },
    {
      "id": "msg_003",
      "session_id": "jpanzo",
      "from_number": "244929782402@c.us",
      "to_number": null,
      "chat_id": "jpanzo-244929782402@c.us",  // Mesmo chat_id!
      "body": "Tudo ótimo!",
      "timestamp": "2025-10-17T10:02:00.000Z"
    }
  ]
}
```

**Características:**
- ✅ Todas as mensagens do mesmo contato no mesmo chat
- ✅ Ordenadas cronologicamente (ASC = mais antigas primeiro)
- ✅ Inclui mensagens enviadas E recebidas
- ✅ Paginação com `limit` e `offset`

### 3. Rotas Antigas Ainda Funcionam

```http
# Ver todas as mensagens de uma sessão
GET /database/messages?sessionId=jpanzo

# Ver mensagens de um chat específico (rota antiga)
GET /database/messages?chatId=244929782402@c.us

# Buscar mensagens
GET /database/messages/search?query=oi&sessionId=jpanzo
```

## 🎨 Exemplo de Interface de Chat

### Tela de Lista de Conversas

```
┌──────────────────────────────────────┐
│  Conversas (Sessão: jpanzo)          │
├──────────────────────────────────────┤
│                                      │
│  📱 244929782402                     │
│     Obrigado!                        │
│     10:30                       [15] │
│                                      │
│  📱 244947231653                     │
│     Bom dia                          │
│     09:15                        [8] │
│                                      │
│  📱 244921395315                     │
│     Até logo                         │
│     Ontem                        [3] │
│                                      │
└──────────────────────────────────────┘
```

### Tela de Chat Individual

```
┌──────────────────────────────────────┐
│  ← 244929782402                      │
├──────────────────────────────────────┤
│                                      │
│             Oi, tudo bem?    10:00   │
│               [244929782402]         │
│                                      │
│  10:01   Sim, e você?                │
│          [Você]                      │
│                                      │
│             Tudo ótimo!      10:02   │
│               [244929782402]         │
│                                      │
│  10:15   Que bom!                    │
│          [Você]                      │
│                                      │
└──────────────────────────────────────┘
```

## 💡 Casos de Uso

### 1. Frontend - Listar Conversas

```javascript
// 1. Buscar lista de chats
const response = await fetch('/database/chats?sessionId=jpanzo');
const { data: chats } = await response.json();

// 2. Exibir lista
chats.forEach(chat => {
  console.log(`
    Contato: ${chat.chat_id}
    Mensagens: ${chat.message_count}
    Última: ${chat.last_message}
    Quando: ${new Date(chat.last_message_time).toLocaleString()}
  `);
});
```

### 2. Frontend - Abrir Conversa

```javascript
// Usuário clica em um contato
const chatId = '244929782402@c.us';

// Buscar mensagens desse chat
const response = await fetch(
  `/database/chats/${encodeURIComponent(chatId)}/messages?sessionId=jpanzo&limit=50`
);
const { data: messages } = await response.json();

// Renderizar timeline
messages.forEach(msg => {
  const isSent = msg.to_number !== null;
  console.log(isSent ? '→' : '←', msg.body);
});
```

### 3. Backend - Webhook Integração

```javascript
// Quando recebe mensagem via webhook
app.post('/webhook', async (req, res) => {
  const { phoneNumber, message } = req.body;
  
  // Enviar mensagem
  await sessionManager.sendMessage('jpanzo', phoneNumber, message);
  
  // Automático: mensagem já foi salva no chat correto!
  // chat_id = phoneNumber
  
  res.json({ success: true });
});
```

## 🔍 Queries SQL Usadas

### Listar Chats
```sql
SELECT 
  chat_id,
  session_id,
  COUNT(*) as message_count,
  MAX(timestamp) as last_message_time,
  (SELECT body FROM messages m2 
   WHERE m2.chat_id = messages.chat_id 
     AND m2.session_id = messages.session_id 
   ORDER BY timestamp DESC LIMIT 1) as last_message
FROM messages
WHERE session_id = ?
  AND chat_type = 'private'
GROUP BY chat_id, session_id
ORDER BY last_message_time DESC
LIMIT ?
```

### Mensagens de um Chat
```sql
SELECT * FROM messages 
WHERE session_id = ? 
  AND chat_id = ?
ORDER BY timestamp ASC
LIMIT ? OFFSET ?
```

## ✅ Vantagens do Sistema

1. **Simplicidade:** Um `chat_id` = uma conversa
2. **Consistência:** Mensagens enviadas e recebidas no mesmo lugar
3. **Escalável:** Fácil paginar e buscar
4. **Intuitivo:** Estrutura natural de chat
5. **Performance:** Índices simples (session_id, chat_id)

## 🧪 Testando

### 1. Enviar algumas mensagens
```bash
# Enviar para contato 1
curl -X POST http://localhost:3000/sessions/jpanzo/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"244929782402","message":"Oi!"}'

# Enviar para contato 2
curl -X POST http://localhost:3000/sessions/jpanzo/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"244947231653","message":"Olá!"}'
```

### 2. Listar chats
```bash
curl http://localhost:3000/database/chats?sessionId=jpanzo
```

### 3. Ver mensagens de um chat
```bash
curl "http://localhost:3000/database/chats/244929782402@c.us/messages?sessionId=jpanzo"
```

## 📊 Estrutura do Banco

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  from_number TEXT NOT NULL,    -- Quem enviou
  to_number TEXT,                -- Destinatário (null se recebida)
  chat_id TEXT NOT NULL,         -- ← SEMPRE o outro usuário
  chat_type TEXT NOT NULL,
  body TEXT,
  message_type TEXT NOT NULL,
  has_media BOOLEAN DEFAULT 0,
  timestamp DATETIME NOT NULL,
  is_forwarded BOOLEAN DEFAULT 0,
  is_status BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_messages_session_chat ON messages(session_id, chat_id);
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
```

---

**Resultado:** Sistema de chat completo, organizado e fácil de usar! 🎉
