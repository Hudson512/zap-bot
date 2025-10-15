# 📚 Comandos PowerShell para Multi-Session API

## 🚀 Quick Reference

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET | ConvertTo-Json -Depth 10
```

### Listar Sessões
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method GET | ConvertTo-Json -Depth 10
```

### Criar Sessão
```powershell
$body = @{
    sessionId = "minha-sessao"
    headless = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/sessions" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body $body | ConvertTo-Json -Depth 10
```

### Criar Sessão (modo visível - debug)
```powershell
$body = @{
    sessionId = "debug-session"
    headless = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/sessions" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body $body | ConvertTo-Json -Depth 10
```

### Verificar Status de Sessão
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/sessions/minha-sessao/status" -Method GET | ConvertTo-Json
```

### Info de Sessão
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/sessions/minha-sessao" -Method GET | ConvertTo-Json -Depth 10
```

### Enviar Mensagem
```powershell
$messageBody = @{
    phoneNumber = "244929782402"
    message = "Olá! Mensagem de teste."
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/sessions/minha-sessao/send" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body $messageBody | ConvertTo-Json
```

### Enviar Mensagem via Webhook Test
```powershell
$webhookBody = @{
    phoneNumber = "244929782402"
    message = "Teste via webhook"
    sessionId = "minha-sessao"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/webhook/test" `
                  -Method POST `
                  -ContentType "application/json" `
                  -Body $webhookBody | ConvertTo-Json
```

### Deletar Sessão
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/sessions/minha-sessao" -Method DELETE | ConvertTo-Json
```

## 🔄 Workflows Completos

### Criar e Testar Nova Sessão
```powershell
# 1. Criar
$body = @{ sessionId = "teste"; headless = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method POST -ContentType "application/json" -Body $body

# 2. Aguardar e escanear QR code (verifique console do servidor)
Start-Sleep -Seconds 30

# 3. Verificar status
Invoke-RestMethod -Uri "http://localhost:3000/sessions/teste/status" -Method GET

# 4. Enviar mensagem
$msg = @{ phoneNumber = "244929782402"; message = "Teste!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/sessions/teste/send" -Method POST -ContentType "application/json" -Body $msg
```

### Criar Múltiplas Sessões
```powershell
@("sessao-1", "sessao-2", "sessao-3") | ForEach-Object {
    $body = @{ sessionId = $_; headless = $true } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:3000/sessions" `
                      -Method POST `
                      -ContentType "application/json" `
                      -Body $body
    Start-Sleep -Seconds 2
}

# Listar todas
Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method GET | ConvertTo-Json -Depth 10
```

### Enviar Mensagens em Lote
```powershell
$sessoes = @("sessao-1", "sessao-2", "sessao-3")
$numeros = @("244929782402", "244958121460")

foreach ($sessao in $sessoes) {
    foreach ($numero in $numeros) {
        $body = @{
            phoneNumber = $numero
            message = "Mensagem automática de $sessao"
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "http://localhost:3000/sessions/$sessao/send" `
                              -Method POST `
                              -ContentType "application/json" `
                              -Body $body
            Write-Host "✅ Enviado para $numero via $sessao" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erro ao enviar para $numero via $sessao" -ForegroundColor Red
        }
        
        Start-Sleep -Seconds 1
    }
}
```

### Limpar Todas as Sessões
```powershell
$sessions = (Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method GET).sessions

foreach ($session in $sessions) {
    Write-Host "🗑️ Deletando sessão: $($session.id)" -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "http://localhost:3000/sessions/$($session.id)" -Method DELETE
        Write-Host "✅ Deletado: $($session.id)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao deletar: $($session.id)" -ForegroundColor Red
    }
}
```

### Monitorar Status de Todas as Sessões
```powershell
while ($true) {
    Clear-Host
    Write-Host "📊 Status das Sessões - $(Get-Date -Format 'HH:mm:ss')`n" -ForegroundColor Cyan
    
    $sessions = (Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method GET).sessions
    
    foreach ($session in $sessions) {
        $status = if ($session.isReady) { "✅ READY" } else { "⏳ LOADING" }
        Write-Host "$status - $($session.id)" -ForegroundColor $(if ($session.isReady) { "Green" } else { "Yellow" })
    }
    
    Start-Sleep -Seconds 5
}
```

## 🐛 Debug e Troubleshooting

### Ver Detalhes Completos de Erro
```powershell
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/sessions/teste" -Method GET
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    Write-Host "Erro: $_" -ForegroundColor Red
}
```

### Testar Conectividade
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

### Ver Resposta Completa (Headers + Body)
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Headers:" -ForegroundColor Yellow
$response.Headers | Format-Table
Write-Host "`nBody:" -ForegroundColor Yellow
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## 💾 Salvar Resposta em Arquivo
```powershell
# Salvar lista de sessões
Invoke-RestMethod -Uri "http://localhost:3000/sessions" -Method GET | 
    ConvertTo-Json -Depth 10 | 
    Out-File "sessions-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

Write-Host "✅ Backup salvo!" -ForegroundColor Green
```

## 🔧 Variáveis para Facilitar
```powershell
# Definir variáveis globais
$global:apiUrl = "http://localhost:3000"
$global:defaultPhone = "244929782402"

# Função helper
function Send-WhatsAppMessage {
    param(
        [string]$SessionId,
        [string]$PhoneNumber,
        [string]$Message
    )
    
    $body = @{
        phoneNumber = $PhoneNumber
        message = $Message
    } | ConvertTo-Json
    
    Invoke-RestMethod -Uri "$global:apiUrl/sessions/$SessionId/send" `
                      -Method POST `
                      -ContentType "application/json" `
                      -Body $body
}

# Usar
Send-WhatsAppMessage -SessionId "minha-sessao" -PhoneNumber $global:defaultPhone -Message "Teste!"
```

## 📝 Script de Inicialização Completo
```powershell
# Salve como: init-sessions.ps1

param(
    [string[]]$SessionIds = @("default", "backup"),
    [bool]$Headless = $true
)

Write-Host "🚀 Inicializando sessões..." -ForegroundColor Cyan

foreach ($sessionId in $SessionIds) {
    Write-Host "`n📱 Criando sessão: $sessionId" -ForegroundColor Yellow
    
    $body = @{
        sessionId = $sessionId
        headless = $Headless
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/sessions" `
                                       -Method POST `
                                       -ContentType "application/json" `
                                       -Body $body
        Write-Host "✅ Sessão $sessionId criada!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao criar $sessionId : $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "`n✅ Inicialização completa!" -ForegroundColor Green
Write-Host "📝 Não esqueça de escanear os QR codes no console do servidor!" -ForegroundColor Yellow

# Uso:
# .\init-sessions.ps1
# .\init-sessions.ps1 -SessionIds @("cliente-a", "cliente-b", "cliente-c")
# .\init-sessions.ps1 -SessionIds @("debug") -Headless $false
```
