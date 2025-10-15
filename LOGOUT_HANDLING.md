# Tratamento de Logout e Cleanup de Sessões

## 🐛 Problema Original

Quando uma sessão faz logout (voluntário ou involuntário), o WhatsApp Web.js tentava deletar o arquivo `lockfile` que ainda estava em uso, causando o erro:

```
Error: EBUSY: resource busy or locked, unlink '.wwebjs_auth\session-xxx\lockfile'
```

Isso causava um crash na aplicação.

## ✅ Solução Implementada

### 1. Auto-Cleanup Após Logout

Quando uma sessão é desconectada com razão `LOGOUT`, o sistema agora:

1. **Detecta o logout** no evento `disconnected`
2. **Aguarda 3 segundos** para liberar recursos (aumentado de 2s)
3. **Faz cleanup gracioso** usando `client.destroy()` sem tentar fazer logout novamente
4. **Usa timeout de 5 segundos** para forçar cleanup se `destroy()` travar
5. **Remove a sessão do Map** para liberar memória
6. **Captura TODOS os erros** para evitar crash do servidor

### 2. Tratamento de Erros Melhorado

#### No `SessionManager`:

**Método `cleanupSession()`** (interno):
- Usado após logout automático
- Não tenta fazer logout novamente (já está desconectado)
- **Race condition com timeout**: Se `destroy()` não responder em 5s, força continuação
- Captura erros de Puppeteer (página fechada, contexto destruído)
- Remove do Map mesmo se houver erros fatais
- Silencia erros não-críticos (apenas loga warnings)

**Handler `disconnected`**:
- Captura erros do `eventHandler.onDisconnected()`
- Force-remove do Map se cleanup falhar completamente
- Tempo de espera aumentado para 3 segundos (mais seguro)

**Método `deleteSession()`** (API pública):
- Usado quando você quer deletar manualmente uma sessão
- Tenta fazer logout primeiro (se estiver conectado)
- Se logout falhar, continua com o destroy
- Remove do Map mesmo se houver erros

### 3. Configuração

Nova variável de ambiente para controlar o comportamento:

```env
# Auto-cleanup de sessões após logout
AUTO_CLEANUP_ON_LOGOUT=true
```

Se `true` (padrão): Sessões são automaticamente removidas após logout  
Se `false`: Sessões permanecem no Map mesmo após logout (você pode reconectá-las)

## 🔧 Fluxo de Eventos

### Logout Detectado
```
WhatsApp Web detecta logout
  ↓
Evento "disconnected" com reason="LOGOUT"
  ↓
session.isReady = false
  ↓
[AUTO_CLEANUP_ON_LOGOUT?]
  ├─ true → Aguarda 2s → cleanupSession()
  └─ false → Sessão fica desconectada mas no Map
```

### Cleanup Gracioso
```
cleanupSession(sessionId)
  ↓
client.destroy() (sem logout)
  ↓
[Erro no destroy?]
  ├─ Sim → Loga aviso e continua
  └─ Não → Sucesso
  ↓
sessions.delete(sessionId)
  ↓
Memória liberada
```

## 📝 Uso

### Deixar Auto-Cleanup Ativo (Recomendado)
```env
AUTO_CLEANUP_ON_LOGOUT=true
```

- ✅ Libera memória automaticamente
- ✅ Evita erros de lockfile
- ✅ Sessões "mortas" não ficam no sistema

### Desativar Auto-Cleanup
```env
AUTO_CLEANUP_ON_LOGOUT=false
```

Use caso:
- Você quer reconectar sessões desconectadas
- Está testando comportamento de logout
- Quer gerenciar manualmente o ciclo de vida

## 🚨 Diferenças Entre Métodos

### `cleanupSession()` - Uso Interno
```javascript
// Chamado automaticamente após logout
// Não faz logout (já está desconectado)
// Apenas libera recursos
await sessionManager.cleanupSession("customer-abc");
```

### `deleteSession()` - API Pública
```javascript
// Chamado via DELETE /sessions/:id
// Tenta fazer logout primeiro
// Depois destrói e remove
await sessionManager.deleteSession("customer-abc");
```

## 🔍 Logs

### Logout Detectado
```
⚠️ [WARN] ⚠️ Session customer-abc disconnected: LOGOUT
ℹ️ [INFO] 🗑️ Auto-cleaning session customer-abc after logout...
```

### Cleanup Bem-Sucedido
```
ℹ️ [INFO] 🧹 Cleaning up session: customer-abc
✅ [SUCCESS] ✅ Session customer-abc cleaned up
```

### Erro Durante Cleanup (Não-Fatal)
```
⚠️ [WARN] Error destroying client for session customer-abc: [erro]
✅ [SUCCESS] ✅ Session customer-abc cleaned up
```

## 🎯 Benefícios

1. **Sem Crashes**: Erros de lockfile não causam mais crash
2. **Memória Limpa**: Sessões desconectadas são removidas
3. **Configurável**: Você controla o comportamento via `.env`
4. **Gracioso**: Aguarda tempo suficiente para liberar recursos
5. **Logs Claros**: Você sabe exatamente o que está acontecendo

## 💡 Troubleshooting

### Problema: Sessão não é removida após logout
**Solução**: Verifique se `AUTO_CLEANUP_ON_LOGOUT=true` no `.env`

### Problema: Ainda vejo erro de lockfile
**Solução**: 
- Aumente o timeout (2s → 5s) em `session.manager.js`
- Delete manualmente: `Remove-Item -Recurse -Force .wwebjs_auth/session-xxx/`

### Problema: Quero manter sessões após logout
**Solução**: Configure `AUTO_CLEANUP_ON_LOGOUT=false`

## 🔗 Arquivos Modificados

- `app/services/session.manager.js` - Lógica de cleanup
- `app/services/whatsapp.service.js` - Tratamento de logout na sessão default
- `app/config/index.js` - Nova feature flag
- `.env.example` - Documentação da variável
