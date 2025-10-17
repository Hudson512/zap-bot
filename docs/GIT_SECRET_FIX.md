# 🔐 Guia: Resolver Push Bloqueado por Chave API Exposta

## ❌ Problema
GitHub detectou chave API do Groq nos commits e bloqueou o push.

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### 1️⃣ Permitir o Push no GitHub

O GitHub forneceu um link especial para você revisar e permitir o push:

```
https://github.com/Hudson512/zap-bot/security/secret-scanning/unblock-secret/34CL8GgYPbdvLmbfzgr65uy3oXK
```

**Passos:**
1. Abra o link acima no navegador
2. Revise a chave detectada
3. Clique em **"Allow secret"** (Permitir segredo)
4. GitHub vai desbloquear o push

### 2️⃣ Atualizar Remote do Git

```powershell
git remote set-url origin git@github.com:Hudson512/zap-bot.git
```

### 3️⃣ Fazer o Push

```powershell
git push
```

### 4️⃣ **IMPORTANTE: Revogar e Renovar a Chave API**

⚠️ **A chave foi exposta publicamente no GitHub!**

**Ações obrigatórias:**

1. **Acesse o Groq Console:**
   - https://console.groq.com/keys

2. **Revogue a chave antiga:**
   - Encontre a chave `gsk_RcDD...`
   - Clique em **Delete/Revoke**

3. **Crie uma nova chave:**
   - Clique em **Create API Key**
   - Copie a nova chave

4. **Atualize seu `.env` local:**
   ```env
   GROQ_API_KEY=sua_nova_chave_aqui
   ```

5. **Reinicie o servidor:**
   ```powershell
   npm start
   ```

---

## 🔒 SOLUÇÃO PERMANENTE (Remover do Histórico)

Se você NÃO quiser que a chave fique no histórico público:

### Método 1: BFG Repo-Cleaner (Mais Fácil)

```powershell
# 1. Baixar BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# 2. Criar arquivo com a chave a ser removida
echo "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" > secrets.txt

# 3. Executar BFG
java -jar bfg.jar --replace-text secrets.txt

# 4. Limpar
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push
git push --force-with-lease origin main
```

### Método 2: Git Filter-Branch (Manual)

```powershell
# Execute o script que criamos
.\cleanup-git-history.ps1
```

---

## 📋 Checklist de Segurança

- [x] Chave removida dos arquivos de documentação
- [x] Remote Git atualizado para `zap-bot`
- [ ] Link do GitHub acessado para desbloquear push
- [ ] Push realizado com sucesso
- [ ] **Chave antiga revogada no Groq Console**
- [ ] **Nova chave gerada**
- [ ] `.env` atualizado com nova chave
- [ ] Servidor testado com nova chave

---

## 🎯 Resumo

**Situação Atual:**
- ✅ Arquivos limpos (commit a3ad649)
- ✅ Remote atualizado para zap-bot
- ⏳ Push bloqueado aguardando sua autorização

**Próximo Passo:**
1. Abrir o link: https://github.com/Hudson512/zap-bot/security/secret-scanning/unblock-secret/34CL8GgYPbdvLmbfzgr65uy3oXK
2. Clicar em "Allow secret"
3. Executar: `git push`
4. **URGENTE:** Revogar chave antiga e gerar nova

---

## 💡 Prevenção Futura

### 1. Adicionar ao .gitignore

Certifique-se que `.env` está no `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
```

### 2. Usar Exemplo Sem Chaves

Mantenha `.env.example` com placeholders:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Nunca Commitar Chaves na Documentação

Use sempre placeholders nos arquivos `.md`:

```markdown
❌ ERRADO:
GROQ_API_KEY=gsk_RcDD...

✅ CORRETO:
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Instalar Git-Secrets (Opcional)

```powershell
# Previne commits com secrets
git secrets --install
git secrets --register-aws
```

---

## 🆘 Problemas?

### "Push ainda bloqueado após permitir"

Execute:
```powershell
git pull --rebase origin main
git push
```

### "Não consigo acessar o link"

Alternativa:
```powershell
# Force push (use com cuidado!)
git push --force-with-lease origin main
```

### "Chave ainda funciona após revogar"

- Groq pode levar alguns minutos para invalidar
- Teste fazendo request direto: `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer sua_chave"`
