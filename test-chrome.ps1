# Script para testar o Chrome/Puppeteer antes de criar sessões
# Execute: .\test-chrome.ps1

Write-Host "🔍 Verificando instalação do Chrome..." -ForegroundColor Cyan

# 1. Verificar se Chrome existe
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (Test-Path $chromePath) {
    Write-Host "✅ Chrome encontrado em: $chromePath" -ForegroundColor Green
} else {
    Write-Host "❌ Chrome NÃO encontrado em: $chromePath" -ForegroundColor Red
    Write-Host "   Por favor, instale o Google Chrome ou atualize o caminho no .env" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar se Node.js está instalado
Write-Host "`n🔍 Verificando Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js NÃO encontrado" -ForegroundColor Red
    exit 1
}

# 3. Verificar dependências
Write-Host "`n🔍 Verificando dependências..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules encontrado" -ForegroundColor Green
    
    if (Test-Path "node_modules\puppeteer") {
        Write-Host "✅ Puppeteer instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ Puppeteer NÃO instalado" -ForegroundColor Red
        Write-Host "   Execute: npm install" -ForegroundColor Yellow
        exit 1
    }
    
    if (Test-Path "node_modules\whatsapp-web.js") {
        Write-Host "✅ whatsapp-web.js instalado" -ForegroundColor Green
    } else {
        Write-Host "❌ whatsapp-web.js NÃO instalado" -ForegroundColor Red
        Write-Host "   Execute: npm install" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ node_modules NÃO encontrado" -ForegroundColor Red
    Write-Host "   Execute: npm install" -ForegroundColor Yellow
    exit 1
}

# 4. Criar script de teste temporário
Write-Host "`n🔍 Testando Chrome com Puppeteer..." -ForegroundColor Cyan

$testScript = @"
const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Iniciando Chrome...');
    const browser = await puppeteer.launch({
      executablePath: '$chromePath',
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    console.log('✅ Chrome aberto com sucesso!');
    
    const page = await browser.newPage();
    console.log('Navegando para WhatsApp Web...');
    
    await page.goto('https://web.whatsapp.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ WhatsApp Web carregado!');
    console.log('Aguardando 5 segundos...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await browser.close();
    console.log('✅ Teste concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
})();
"@

$testScript | Out-File -FilePath "test-puppeteer-temp.js" -Encoding UTF8

# Executar teste
try {
    node test-puppeteer-temp.js
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n✅ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
        Write-Host "Seu sistema está pronto para criar sessões WhatsApp" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Teste falhou" -ForegroundColor Red
        Write-Host "Verifique os erros acima" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Erro ao executar teste: $_" -ForegroundColor Red
} finally {
    # Limpar arquivo temporário
    if (Test-Path "test-puppeteer-temp.js") {
        Remove-Item "test-puppeteer-temp.js"
    }
}

Write-Host "`n📋 Resumo:" -ForegroundColor Cyan
Write-Host "   - Chrome: $(if (Test-Path $chromePath) { '✅' } else { '❌' })" -ForegroundColor $(if (Test-Path $chromePath) { 'Green' } else { 'Red' })
Write-Host "   - Node.js: ✅" -ForegroundColor Green
Write-Host "   - Dependências: ✅" -ForegroundColor Green
Write-Host "   - Puppeteer: $(if ($exitCode -eq 0) { '✅' } else { '❌' })" -ForegroundColor $(if ($exitCode -eq 0) { 'Green' } else { 'Red' })

Write-Host "`n💡 Próximo passo:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host "   Depois crie uma sessão via API" -ForegroundColor White
