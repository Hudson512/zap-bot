# Swagger Documentation - Arquitetura Separada

## 📋 Visão Geral

Este documento explica como a documentação Swagger foi organizada para **manter o código limpo** separando a documentação API dos arquivos de rota.

## 🎯 Problema Resolvido

**Antes:**
```javascript
// app/routes/database.routes.js
/**
 * @swagger
 * /database/stats:
 *   get:
 *     summary: Get database statistics
 *     description: Returns overall statistics...
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database statistics
 *         ... (50+ linhas de documentação)
 */
router.get("/stats", (req, res) => {
  // 10 linhas de código
});
```

❌ **Problemas:**
- Código fica poluído com comentários Swagger
- Difícil de ler e manter
- Mistura responsabilidades (lógica + documentação)

**Depois:**
```javascript
// app/routes/database.routes.js
// GET /database/stats - Get database statistics
router.get("/stats", (req, res) => {
  // 10 linhas de código
});
```

✅ **Vantagens:**
- Código limpo e focado
- Documentação separada em arquivo dedicado
- Fácil de manter ambos independentemente

## 📁 Estrutura de Arquivos

```
app/
├── config/
│   ├── swagger.js                    # Configuração principal Swagger
│   └── swagger.database.js           # Documentação das rotas /database
├── routes/
│   ├── database.routes.js            # Código limpo (SEM comentários Swagger)
│   └── sessions.routes.js            # Código limpo
└── server.js
```

## 🔧 Como Funciona

### 1. Arquivo de Documentação (`swagger.database.js`)

```javascript
module.exports = {
  paths: {
    '/database/stats': {
      get: {
        tags: ['Database'],
        summary: 'Get database statistics',
        description: '...',
        responses: {
          200: { ... },
          500: { ... }
        }
      }
    },
    '/database/messages': {
      // Documentação completa da rota
    },
    // ... todas as 9 rotas documentadas
  }
};
```

### 2. Configuração Swagger (`swagger.js`)

```javascript
const databaseDocs = require("./swagger.database");

const options = {
  definition: {
    openapi: "3.0.0",
    info: { ... },
    // Importa documentação externa
    paths: {
      ...databaseDocs.paths,  // ✅ Todas as rotas do database
    },
  },
  // NÃO inclui arquivos de rota no parsing
  apis: ["./app/server.js", "./app/webhook.js"],
};
```

### 3. Arquivo de Rota Limpo (`database.routes.js`)

```javascript
const express = require("express");
const router = express.Router();
const db = require("../services/database.service");
const logger = require("../utils/logger");

// GET /database/stats - Get database statistics
router.get("/stats", (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error("Error getting database stats:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ... mais rotas (código limpo)

module.exports = router;
```

## 📚 Rotas Documentadas

### Database Routes (`/database`)

Todas as 9 rotas estão documentadas em `app/config/swagger.database.js`:

1. **GET /database/stats** - Estatísticas gerais do database
2. **GET /database/sessions** - Lista todas as sessões
3. **GET /database/sessions/:id** - Detalhes de uma sessão específica
4. **GET /database/messages** - Mensagens com filtros (sessionId, chatId, limit, offset)
5. **GET /database/messages/search** - Busca mensagens por conteúdo
6. **GET /database/contacts** - Contatos de uma sessão
7. **GET /database/contacts/top** - Top contatos por quantidade de mensagens
8. **GET /database/commands/stats** - Estatísticas de uso de comandos
9. **POST /database/cleanup** - Limpa dados antigos

### Documentação Inclui:

✅ **Parâmetros exatos:**
- Query parameters com valores padrão corretos
- Path parameters
- Request body schemas

✅ **Respostas reais:**
- Estruturas de sucesso `{ success: true, data: ... }`
- Códigos de erro (400, 404, 500)
- Mensagens de erro exatas do código

✅ **Tipos de dados:**
- Referências aos schemas existentes (`$ref: '#/components/schemas/Message'`)
- Tipos primitivos (string, integer, boolean)
- Enums para valores permitidos

## 🚀 Acesso à Documentação

### Swagger UI (Interface Visual)
```
http://localhost:3000/api-docs
```
- Interface interativa
- Testa endpoints diretamente
- Visualiza exemplos de request/response

### OpenAPI JSON (Especificação)
```
http://localhost:3000/api-docs.json
```
- Especificação OpenAPI 3.0 completa
- Pode ser importada em ferramentas (Postman, Insomnia)

## 🔄 Adicionando Novas Rotas

### Opção 1: Criar arquivo de documentação separado

**Exemplo para `sessions.routes.js`:**

1. Criar `app/config/swagger.sessions.js`:
```javascript
module.exports = {
  paths: {
    '/sessions': {
      get: {
        tags: ['Sessions'],
        summary: 'List all sessions',
        // ... documentação completa
      }
    },
    '/sessions/start': {
      post: {
        // ... documentação
      }
    }
  }
};
```

2. Importar em `swagger.js`:
```javascript
const databaseDocs = require("./swagger.database");
const sessionsDocs = require("./swagger.sessions");

const options = {
  definition: {
    // ...
    paths: {
      ...databaseDocs.paths,
      ...sessionsDocs.paths,  // ✅ Adicionar aqui
    },
  },
};
```

### Opção 2: Adicionar no mesmo arquivo

Se a rota é simples, pode adicionar diretamente em `swagger.database.js`:

```javascript
module.exports = {
  paths: {
    // ... rotas existentes
    '/database/nova-rota': {
      get: {
        tags: ['Database'],
        summary: 'Nova funcionalidade',
        // ... documentação
      }
    }
  }
};
```

## ✅ Benefícios da Arquitetura

### Para Desenvolvedores:
1. **Código limpo** - Fácil de ler e entender a lógica
2. **Separação de responsabilidades** - Código vs Documentação
3. **Manutenção independente** - Alterar um sem afetar o outro
4. **Menos conflitos Git** - Mudanças em áreas diferentes do código

### Para a API:
1. **Documentação precisa** - Baseada no código real, não em suposições
2. **Versionamento fácil** - Documentação acompanha o código
3. **Extensível** - Fácil adicionar novas rotas documentadas
4. **Padrão OpenAPI 3.0** - Compatível com ferramentas da indústria

## 🎯 Padrões a Seguir

### Request/Response Patterns

**Sucesso (200):**
```json
{
  "success": true,
  "count": 10,           // Opcional, para listas
  "data": { ... }        // Dados principais
}
```

**Erro (400/404/500):**
```json
{
  "success": false,
  "error": "Mensagem de erro específica"
}
```

### Valores Padrão Documentados

Sempre especificar defaults no schema:
```javascript
{
  name: 'limit',
  schema: {
    type: 'integer',
    default: 50,          // ✅ Igual ao código
    example: 50
  }
}
```

### Descrições Claras

```javascript
{
  name: 'sessionId',
  description: 'Session ID (defaults to "default")',  // ✅ Comportamento explicado
  schema: {
    type: 'string',
    default: 'default'
  }
}
```

## 📝 Checklist para Novas Rotas

Ao adicionar uma nova rota documentada:

- [ ] Criar/atualizar arquivo `swagger.*.js`
- [ ] Documentar TODOS os parâmetros (query, path, body)
- [ ] Incluir valores padrão corretos
- [ ] Documentar TODAS as respostas possíveis (200, 400, 404, 500)
- [ ] Testar no código a estrutura exata de resposta
- [ ] Usar schemas existentes quando possível (`$ref`)
- [ ] Adicionar exemplos realistas
- [ ] Importar em `swagger.js` (spread operator)
- [ ] Testar em `/api-docs`

## 🔍 Debugging

### Swagger não aparece?
1. Verificar se o arquivo de docs está importado em `swagger.js`
2. Verificar se o spread operator está correto: `...databaseDocs.paths`
3. Verificar sintaxe JSON no arquivo de docs
4. Reiniciar o servidor

### Documentação desatualizada?
1. Comparar com código real em `routes/*.js`
2. Verificar valores default
3. Testar endpoint e comparar resposta com schema

### Erro de importação?
```javascript
// ❌ Errado
const docs = require("./swagger.database.js");

// ✅ Correto
const docs = require("./swagger.database");
```

## 🎓 Recursos

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/docs/open-source-tools/swagger-ui/)
- [swagger-jsdoc npm](https://www.npmjs.com/package/swagger-jsdoc)

---

**Resultado:** Código limpo + Documentação completa + Manutenção fácil ✨
