# 🧪 Test Multi-Session - PowerShell Script
# Para Windows PowerShell

$baseUrl = "http://localhost:3000"

Write-Host "`n🧪 Testando Multi-Session API`n" -ForegroundColor Cyan

# 1. Health Check
Write-Host "1️⃣ Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 2. List Sessions
Write-Host "`n2️⃣ Listando sessões..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/sessions" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 3. Create Session
Write-Host "`n3️⃣ Criando sessão 'test-session'..." -ForegroundColor Yellow
try {
    $body = @{
        sessionId = "test-session"
        headless = $true
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/sessions" `
                                   -Method POST `
                                   -ContentType "application/json" `
                                   -Body $body
    $response | ConvertTo-Json -Depth 10
    
    Write-Host "`n⏳ Aguarde ~30 segundos para a sessão ficar pronta..." -ForegroundColor Magenta
    Write-Host "   Verifique o console do servidor e escaneie o QR code se necessário!" -ForegroundColor Magenta
    Write-Host "   Pressione ENTER para continuar quando a sessão estiver pronta..." -ForegroundColor Magenta
    Read-Host
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detalhes: $responseBody" -ForegroundColor Red
    }
}

# 4. Check Session Status
Write-Host "`n4️⃣ Verificando status da sessão..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/sessions/test-session/status" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 5. Send Test Message
Write-Host "`n5️⃣ Enviando mensagem de teste..." -ForegroundColor Yellow
Write-Host "   ⚠️ IMPORTANTE: Edite o número de telefone antes de enviar!" -ForegroundColor Yellow

$phoneNumber = Read-Host "   Digite o número de telefone (ex: 244929782402)"

if ($phoneNumber) {
    try {
        $messageBody = @{
            phoneNumber = $phoneNumber
            message = "🎉 Teste de multi-session funcionando!"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/sessions/test-session/send" `
                                       -Method POST `
                                       -ContentType "application/json" `
                                       -Body $messageBody
        $response | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "❌ Erro ao enviar mensagem: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⏭️ Pulando envio de mensagem..." -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# 6. List All Sessions Again
Write-Host "`n6️⃣ Listando todas as sessões novamente..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/sessions" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 7. Delete Session (opcional)
Write-Host "`n7️⃣ Deseja deletar a sessão de teste?" -ForegroundColor Yellow
$delete = Read-Host "   Digite 'sim' para deletar (enter para pular)"

if ($delete -eq "sim") {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/sessions/test-session" -Method DELETE
        $response | ConvertTo-Json -Depth 10
        Write-Host "✅ Sessão deletada com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao deletar sessão: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⏭️ Sessão mantida. Delete manualmente quando necessário." -ForegroundColor Gray
}

Write-Host "`n✅ Teste completo!`n" -ForegroundColor Green
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "   - Verifique os logs do servidor" -ForegroundColor Gray
Write-Host "   - Teste enviar mensagens pela sessão criada" -ForegroundColor Gray
Write-Host "   - Execute: Invoke-RestMethod -Uri 'http://localhost:3000/sessions' -Method GET" -ForegroundColor Gray
