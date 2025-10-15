# 🧪 Testing Multi-Session

## Quick Test Script

Salve este script como `test-multi-session.ps1` ou `test-multi-session.sh` e execute.

### PowerShell (Windows)
```powershell
# test-multi-session.ps1

$baseUrl = "http://localhost:3000"

Write-Host "`n🧪 Testing Multi-Session API`n" -ForegroundColor Cyan

# 1. Health Check
Write-Host "1️⃣ Health Check..." -ForegroundColor Yellow
curl "$baseUrl/health" | ConvertFrom-Json | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2

# 2. List Sessions
Write-Host "`n2️⃣ List Sessions..." -ForegroundColor Yellow
curl "$baseUrl/sessions" | ConvertFrom-Json | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2

# 3. Create Session
Write-Host "`n3️⃣ Creating session 'test-session'..." -ForegroundColor Yellow
$body = @{
    sessionId = "test-session"
    headless = $true
} | ConvertTo-Json

curl -Method POST -Uri "$baseUrl/sessions" `
     -ContentType "application/json" `
     -Body $body | ConvertFrom-Json | ConvertTo-Json -Depth 10

Write-Host "`n⏳ Aguarde ~30 segundos para a sessão ficar pronta..." -ForegroundColor Magenta
Write-Host "   Escaneie o QR code no console do servidor!" -ForegroundColor Magenta
Start-Sleep -Seconds 30

# 4. Check Session Status
Write-Host "`n4️⃣ Checking session status..." -ForegroundColor Yellow
curl "$baseUrl/sessions/test-session/status" | ConvertFrom-Json | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2

# 5. Send Test Message (ajuste o número!)
Write-Host "`n5️⃣ Sending test message..." -ForegroundColor Yellow
$messageBody = @{
    phoneNumber = "244929782402"  # AJUSTE ESTE NÚMERO!
    message = "🎉 Teste de multi-session funcionando!"
} | ConvertTo-Json

curl -Method POST -Uri "$baseUrl/sessions/test-session/send" `
     -ContentType "application/json" `
     -Body $messageBody | ConvertFrom-Json | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2

# 6. List All Sessions Again
Write-Host "`n6️⃣ List all sessions..." -ForegroundColor Yellow
curl "$baseUrl/sessions" | ConvertFrom-Json | ConvertTo-Json -Depth 10

Start-Sleep -Seconds 2

# 7. Delete Session (opcional)
Write-Host "`n7️⃣ Delete test session? (comentado por padrão)" -ForegroundColor Yellow
# curl -Method DELETE -Uri "$baseUrl/sessions/test-session"

Write-Host "`n✅ Test completed!`n" -ForegroundColor Green
```

### Bash (Linux/Mac)
```bash
#!/bin/bash
# test-multi-session.sh

BASE_URL="http://localhost:3000"

echo -e "\n🧪 Testing Multi-Session API\n"

# 1. Health Check
echo "1️⃣ Health Check..."
curl -s "$BASE_URL/health" | jq .
sleep 2

# 2. List Sessions
echo -e "\n2️⃣ List Sessions..."
curl -s "$BASE_URL/sessions" | jq .
sleep 2

# 3. Create Session
echo -e "\n3️⃣ Creating session 'test-session'..."
curl -s -X POST "$BASE_URL/sessions" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-session","headless":true}' | jq .

echo -e "\n⏳ Aguarde ~30 segundos para a sessão ficar pronta..."
echo "   Escaneie o QR code no console do servidor!"
sleep 30

# 4. Check Session Status
echo -e "\n4️⃣ Checking session status..."
curl -s "$BASE_URL/sessions/test-session/status" | jq .
sleep 2

# 5. Send Test Message (ajuste o número!)
echo -e "\n5️⃣ Sending test message..."
curl -s -X POST "$BASE_URL/sessions/test-session/send" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber":"244929782402",
    "message":"🎉 Teste de multi-session funcionando!"
  }' | jq .
sleep 2

# 6. List All Sessions Again
echo -e "\n6️⃣ List all sessions..."
curl -s "$BASE_URL/sessions" | jq .
sleep 2

# 7. Delete Session (opcional)
echo -e "\n7️⃣ Delete test session? (comentado por padrão)"
# curl -s -X DELETE "$BASE_URL/sessions/test-session"

echo -e "\n✅ Test completed!\n"
```

## Manual Testing Steps

### Step 1: Start Server
```bash
npm start
```

### Step 2: Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T...",
  "defaultSession": {
    "status": "connected"
  },
  "multiSession": {
    "enabled": true,
    "totalSessions": 0,
    "sessions": []
  }
}
```

### Step 3: Create Session
```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"my-test","headless":false}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session created successfully",
  "session": {
    "id": "my-test",
    "isReady": false,
    "createdAt": "2025-10-15T...",
    "options": { "headless": false }
  }
}
```

**Expected Console Log:**
```
ℹ️ [INFO] 🔄 Creating session: my-test
ℹ️ [INFO] 📱 QR Code for session my-test
[QR CODE APPEARS HERE]
```

### Step 4: Scan QR Code
- Abra WhatsApp no celular
- Vá em Configurações > Aparelhos Conectados
- Escaneie o QR code exibido no console

### Step 5: Wait for Ready
```
✅ [SUCCESS] 🔐 Session my-test authenticated
✅ [SUCCESS] ✅ Session my-test is ready
```

### Step 6: Check Status
```bash
curl http://localhost:3000/sessions/my-test/status
```

**Expected Response:**
```json
{
  "success": true,
  "sessionId": "my-test",
  "isReady": true,
  "status": "ready"
}
```

### Step 7: Send Message
```bash
curl -X POST http://localhost:3000/sessions/my-test/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber":"244929782402",
    "message":"Hello from my-test session!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "sessionId": "my-test",
  "to": "244929782402"
}
```

**Expected Console Log:**
```
✅ [SUCCESS] ✅ Message sent via session my-test to 244929782402@c.us
```

### Step 8: List All Sessions
```bash
curl http://localhost:3000/sessions
```

**Expected Response:**
```json
{
  "success": true,
  "count": 1,
  "sessions": [
    {
      "id": "my-test",
      "isReady": true,
      "createdAt": "2025-10-15T...",
      "readyAt": "2025-10-15T...",
      "options": { "headless": false }
    }
  ]
}
```

### Step 9: Test Logout Handling

**No WhatsApp do celular:**
- Vá em Aparelhos Conectados
- Desconecte a sessão "my-test"

**Expected Console Log:**
```
⚠️ [WARN] ⚠️ Session my-test disconnected: LOGOUT
ℹ️ [INFO] 🗑️ Auto-cleaning session my-test after logout...
ℹ️ [INFO] 🧹 Cleaning up session: my-test
✅ [SUCCESS] ✅ Session my-test cleaned up
```

**Verify cleanup:**
```bash
curl http://localhost:3000/sessions
```

Session should be removed from the list!

### Step 10: Delete Session (Manual)
```bash
curl -X DELETE http://localhost:3000/sessions/my-test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Session my-test deleted successfully"
}
```

## 🧪 Advanced Tests

### Test Multiple Sessions
```bash
# Create 3 sessions
for i in {1..3}; do
  curl -X POST http://localhost:3000/sessions \
    -H "Content-Type: application/json" \
    -d "{\"sessionId\":\"session-$i\",\"headless\":true}"
  sleep 2
done

# List all
curl http://localhost:3000/sessions
```

### Test Load Balancing
```bash
# Send messages round-robin
for i in {1..10}; do
  SESSION_ID="session-$((i % 3 + 1))"
  curl -X POST "http://localhost:3000/sessions/$SESSION_ID/send" \
    -H "Content-Type: application/json" \
    -d "{\"phoneNumber\":\"244929782402\",\"message\":\"Message $i from $SESSION_ID\"}"
  sleep 1
done
```

### Test Webhook with Session
```bash
curl -X POST http://localhost:3000/webhook/test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber":"244929782402",
    "message":"Test via webhook",
    "sessionId":"session-1"
  }'
```

## ✅ Success Criteria

- [ ] Health check mostra `multiSession.enabled: true`
- [ ] Consegue criar sessão e receber QR code
- [ ] Sessão fica "ready" após escanear QR
- [ ] Consegue enviar mensagem pela sessão
- [ ] Logout é detectado e sessão é limpa automaticamente
- [ ] Múltiplas sessões funcionam simultaneamente
- [ ] Webhook roteia para sessão correta

## 🐛 Debug

Se algo não funcionar:

```bash
# Verificar logs completos
npm run dev

# Limpar todas as sessões
Remove-Item -Recurse -Force .wwebjs_auth/*

# Reiniciar limpo
taskkill /F /IM node.exe /T 2>$null
taskkill /F /IM chrome.exe /T 2>$null
npm start
```
