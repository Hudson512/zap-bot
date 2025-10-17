# Script para remover chave API do histórico do Git
# ATENÇÃO: Isso reescreve o histórico! Use com cuidado.

Write-Host "⚠️  ATENÇÃO: Este script vai reescrever o histórico do Git!" -ForegroundColor Yellow
Write-Host "Todos os commits serão modificados para remover a chave API." -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione ENTER para continuar ou Ctrl+C para cancelar..." -ForegroundColor Cyan
Read-Host

Write-Host "`n🔍 Criando backup antes de modificar..." -ForegroundColor Cyan
$backupBranch = "backup-before-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupBranch
Write-Host "✅ Backup criado na branch: $backupBranch" -ForegroundColor Green

Write-Host "`n🧹 Removendo chave API do histórico..." -ForegroundColor Cyan

# Substituir a chave em todos os commits
git filter-branch --force --index-filter `
  "git ls-files -z | xargs -0 sed -i 's/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/your_groq_api_key_here/g'" `
  --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Histórico limpo com sucesso!" -ForegroundColor Green
    
    Write-Host "`n🗑️  Removendo refs antigas..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
    
    Write-Host "`n🗜️  Limpando e otimizando repositório..." -ForegroundColor Cyan
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    Write-Host "`n✅ Limpeza completa!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Verifique os arquivos com: git log --all --full-history --grep='groq'" -ForegroundColor White
    Write-Host "   2. Force push: git push --force-with-lease origin main" -ForegroundColor White
    Write-Host "   3. ⚠️  IMPORTANTE: Gere uma NOVA chave API em https://console.groq.com" -ForegroundColor Yellow
    Write-Host "   4. Atualize seu .env com a nova chave" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 A chave antiga foi exposta e deve ser revogada!" -ForegroundColor Red
} else {
    Write-Host "❌ Erro durante limpeza do histórico" -ForegroundColor Red
    Write-Host "Você pode restaurar o backup com: git checkout $backupBranch" -ForegroundColor Yellow
}
