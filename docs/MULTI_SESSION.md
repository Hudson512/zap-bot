# Multi-Session Support - ZapNode

## 📱 Visão Geral

O ZapNode agora suporta **múltiplas sessões** do WhatsApp simultaneamente! Cada sessão representa uma conexão independente com o WhatsApp Web, permitindo gerenciar múltiplas contas ou clientes.

## 🚀 Como Funciona

### Arquitetura
- **Session Manager**: Gerencia múltiplas instâncias de clientes WhatsApp
- **Backward Compatibility**: A sessão única original continua funcionando (sessão "default")
- **API RESTful**: Endpoints para criar, listar, deletar e enviar mensagens por sessão

### Estrutura
```
SessionManager
├── Session 1 (clientId: "zapnode-session")    → Default session
├── Session 2 (clientId: "customer-abc")       → Custom session
├── Session 3 (clientId: "customer-xyz")       → Custom session
└── ...
```

## 📚 API Endpoints

### 1. Listar Todas as Sessões
```bash
GET /sessions
```

**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "sessions": [
    {
      "id": "zapnode-session",
      "isReady": true,
      "createdAt": "2025-10-15T10:00:00.000Z",
      "readyAt": "2025-10-15T10:00:30.000Z",
      "options": {}
    },
    {
      "id": "customer-abc",
      "isReady": true,
      "createdAt": "2025-10-15T10:05:00.000Z",
      "readyAt": "2025-10-15T10:05:25.000Z",
      "options": { "headless": true }
    }
  ]
}
```

### 2. Criar Nova Sessão
```bash
POST /sessions
Content-Type: application/json

{
  "sessionId": "customer-abc",
  "headless": true,
  "chromePath": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "session": {
    "id": "customer-abc",
    "isReady": false,
    "createdAt": "2025-10-15T10:05:00.000Z",
    "options": { "headless": true }
  }
}
```

**Nota:** Após criar a sessão, você precisa escanear o QR code (se não estiver autenticado).

### 3. Obter Info de uma Sessão
```bash
GET /sessions/:sessionId
```

**Exemplo:**
```bash
GET /sessions/customer-abc
```

**Resposta:**
```json
{
  "success": true,
  "session": {
    "id": "customer-abc",
    "isReady": true,
    "createdAt": "2025-10-15T10:05:00.000Z",
    "readyAt": "2025-10-15T10:05:25.000Z"
  }
}
```

### 4. Verificar Status de uma Sessão
```bash
GET /sessions/:sessionId/status
```

**Exemplo:**
```bash
GET /sessions/customer-abc/status
```

**Resposta:**
```json
{
  "success": true,
  "sessionId": "customer-abc",
  "isReady": true,
  "status": "ready"
}
```

### 5. Enviar Mensagem por Sessão Específica
```bash
POST /sessions/:sessionId/send
Content-Type: application/json

{
  "phoneNumber": "244929782402",
  "message": "Hello from customer-abc session!"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "sessionId": "customer-abc",
  "to": "244929782402"
}
```

### 6. Deletar uma Sessão
```bash
DELETE /sessions/:sessionId
```

**Exemplo:**
```bash
DELETE /sessions/customer-abc
```

**Resposta:**
```json
{
  "success": true,
  "message": "Session customer-abc deleted successfully"
}
```

## 🔧 Webhook com Múltiplas Sessões

O webhook agora suporta o parâmetro `sessionId`:

### Webhook Principal
```bash
POST /webhook
Content-Type: application/json

{
  "message_type": "outgoing",
  "private": false,
  "sessionId": "customer-abc",
  "conversation": {
    "meta": {
      "sender": { "phone_number": "244929782402" }
    }
  },
  "content": "Message text"
}
```

Se `sessionId` não for especificado, usa a sessão "default".

### Webhook de Teste
```bash
POST /webhook/test
Content-Type: application/json

{
  "phoneNumber": "244929782402",
  "message": "Test message",
  "sessionId": "customer-abc"
}
```

## 📊 Health Check

O endpoint `/health` agora mostra informações de todas as sessões:

```bash
GET /health
```

**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T10:00:00.000Z",
  "defaultSession": {
    "status": "connected"
  },
  "multiSession": {
    "enabled": true,
    "totalSessions": 2,
    "sessions": [...]
  }
}
```

## 🎯 Casos de Uso

### 1. Múltiplos Clientes
```bash
# Criar sessão para Cliente A
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"cliente-a","headless":true}'

# Criar sessão para Cliente B
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"cliente-b","headless":true}'

# Enviar mensagem via Cliente A
curl -X POST http://localhost:3000/sessions/cliente-a/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"244929782402","message":"Olá do Cliente A"}'
```

### 2. Ambientes Diferentes
```bash
# Sessão de Produção
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"production","headless":true}'

# Sessão de Teste
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"testing","headless":false}'
```

### 3. Load Balancing
Distribua mensagens entre múltiplas sessões para melhor performance:

```javascript
const sessions = ["session-1", "session-2", "session-3"];
const sessionIndex = Math.floor(Math.random() * sessions.length);
const selectedSession = sessions[sessionIndex];

// Enviar via sessão selecionada
await fetch(`http://localhost:3000/sessions/${selectedSession}/send`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phoneNumber: "244929782402",
    message: "Message distributed across sessions"
  })
});
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Iniciar sessão padrão automaticamente
START_DEFAULT_SESSION=true

# Se false, apenas sessões criadas via API serão iniciadas
START_DEFAULT_SESSION=false
```

### Desabilitar Sessão Default

Se você quiser usar **apenas** múltiplas sessões (sem a sessão default):

1. Edite `.env`:
   ```env
   START_DEFAULT_SESSION=false
   ```

2. Reinicie o servidor

3. Crie suas sessões via API

## 🔐 Autenticação de Sessões

### Primeira Vez (Nova Sessão)
1. Crie a sessão via API
2. O QR code será exibido no console do servidor
3. Escaneie com WhatsApp
4. A sessão ficará "ready"

### Sessões Existentes
- As sessões são salvas em `.wwebjs_auth/session-{sessionId}/`
- Na próxima inicialização, não precisará escanear QR code novamente

### Limpar Sessão Específica
```bash
Remove-Item -Recurse -Force .wwebjs_auth/session-customer-abc/
```

## 📝 Boas Práticas

1. **Naming Convention**: Use IDs descritivos para sessões
   ```
   ✅ "customer-abc", "prod-main", "test-env"
   ❌ "session1", "s2", "temp"
   ```

2. **Monitoring**: Verifique regularmente o status das sessões
   ```bash
   curl http://localhost:3000/health
   ```

3. **Cleanup**: Delete sessões não utilizadas
   ```bash
   curl -X DELETE http://localhost:3000/sessions/old-session
   ```

4. **Error Handling**: Sempre verifique se a sessão está ready antes de enviar
   ```bash
   curl http://localhost:3000/sessions/customer-abc/status
   ```

## 🐛 Troubleshooting

### Problema: Sessão não fica "ready"
**Solução:** 
- Verifique os logs do console
- Certifique-se de que o QR code foi escaneado
- Delete a sessão e recrie

### Problema: "Session not found"
**Solução:**
- Liste todas as sessões: `GET /sessions`
- Verifique se o sessionId está correto

### Problema: Muitas sessões abertas
**Solução:**
- Feche sessões não utilizadas
- Cada sessão consome recursos (CPU, RAM)
- Recomendado: máximo 5-10 sessões simultâneas

### Problema: Erro EBUSY lockfile após logout
**Solução:**
- O sistema agora faz auto-cleanup após 2 segundos
- Configure `AUTO_CLEANUP_ON_LOGOUT=true` no `.env` (padrão)
- Veja [LOGOUT_HANDLING.md](LOGOUT_HANDLING.md) para mais detalhes

### Problema: Sessão foi removida após logout mas eu queria mantê-la
**Solução:**
- Configure `AUTO_CLEANUP_ON_LOGOUT=false` no `.env`
- A sessão ficará no Map mesmo após logout

## 🚀 Exemplo Completo

```bash
# 1. Verificar saúde
curl http://localhost:3000/health

# 2. Criar nova sessão
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"my-session","headless":true}'

# 3. Aguardar ~30s e verificar status
curl http://localhost:3000/sessions/my-session/status

# 4. Enviar mensagem
curl -X POST http://localhost:3000/sessions/my-session/send \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"244929782402","message":"Hello!"}'

# 5. Listar todas as sessões
curl http://localhost:3000/sessions

# 6. Deletar sessão quando não precisar mais
curl -X DELETE http://localhost:3000/sessions/my-session
```

## 📚 Referências

- [whatsapp-web.js Documentation](https://wwebjs.dev/guide/creating-your-bot/authentication.html#multiple-sessions)
- [ZapNode Architecture](../ARCHITECTURE.md)
- [ZapNode README](../README.md)
