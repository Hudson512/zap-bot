# Arquitetura do ZapNode

## 📐 Visão Geral

O ZapNode foi refatorado para seguir uma arquitetura modular, escalável e baseada em camadas, seguindo princípios SOLID e clean code.

## 🏗️ Camadas da Aplicação

### 1. **Config Layer** (`app/config/`)
Responsável por centralizar todas as configurações da aplicação.

**Arquivos:**
- `index.js` - Configurações centralizadas usando variáveis de ambiente

**Benefícios:**
- Single source of truth para configurações
- Fácil mudança entre ambientes (dev, prod, test)
- Validação centralizada de variáveis de ambiente

---

### 2. **Utils Layer** (`app/utils/`)
Funções auxiliares reutilizáveis em toda a aplicação.

**Arquivos:**
- `logger.js` - Sistema de logging estruturado
- `helpers.js` - Funções utilitárias (formatação, parsing, etc)

**Responsabilidades:**
- Logging consistente e estruturado
- Funções de formatação de dados
- Validações comuns
- Parsing de comandos

---

### 3. **Services Layer** (`app/services/`)
Camada de serviços que encapsula a lógica de negócio.

**Arquivos:**
- `whatsapp.service.js` - Gerencia o cliente WhatsApp

**Responsabilidades:**
- Inicialização e configuração do cliente WhatsApp
- Gerenciamento de eventos do cliente
- Interface para envio de mensagens
- Verificação de status da conexão

**Padrões:**
- Singleton pattern para instância única do serviço
- Encapsulamento da biblioteca whatsapp-web.js
- API limpa e simples para uso em outras camadas

---

### 4. **Handlers Layer** (`app/handlers/`)
Processadores de eventos e mensagens.

**Arquivos:**
- `event.handler.js` - Lida com eventos do WhatsApp (ready, qr, auth, etc)
- `message.handler.js` - Processa mensagens recebidas e roteia para comandos

**Responsabilidades:**
- Processar eventos do ciclo de vida do WhatsApp
- Rotear mensagens para handlers apropriados
- Distinguir entre comandos e mensagens regulares
- Tratamento de erros em tempo de execução

---

### 5. **Commands Layer** (`app/commands/`)
Sistema extensível de comandos.

**Arquivos:**
- `index.js` - Registry de comandos (padrão Registry)
- `ping.command.js` - Comando de teste
- `help.command.js` - Lista todos os comandos

**Estrutura de um Comando:**
```javascript
module.exports = {
  name: "comando",              // Nome do comando
  description: "Descrição",      // Descrição para ajuda
  usage: "!comando [args]",      // Como usar
  execute: async (message, args) => {} // Lógica
};
```

**Benefícios:**
- Adição de novos comandos sem modificar código existente (Open/Closed Principle)
- Auto-registro de comandos
- Estrutura padronizada
- Fácil manutenção e teste

---

## 🔄 Fluxo de Dados

### Fluxo de Inicialização
```
server.js
  ↓
config/index.js (carrega configurações)
  ↓
commands/index.js (registra comandos)
  ↓
services/whatsapp.service.js (inicializa WhatsApp)
  ↓
handlers/event.handler.js (configura eventos)
```

### Fluxo de Mensagem Recebida
```
WhatsApp → message event
  ↓
services/whatsapp.service.js (captura evento)
  ↓
handlers/message.handler.js (processa mensagem)
  ↓
[É comando?]
  ├─ SIM → commands/index.js (busca comando)
  │          ↓
  │       comando.execute() (executa)
  │
  └─ NÃO → handleRegularMessage() (processa como mensagem normal)
```

### Fluxo de Mensagem Enviada (Webhook)
```
POST /webhook
  ↓
webhook.js (valida payload)
  ↓
helpers.formatPhoneNumber() (formata número)
  ↓
services/whatsapp.service.js
  ↓
client.sendMessage() (envia via WhatsApp)
```

---

## 🎯 Padrões de Design Utilizados

### 1. **Singleton Pattern**
Usado em:
- `whatsappService` - Garante uma única instância do cliente WhatsApp
- `commandRegistry` - Um único registro de comandos
- `logger` - Um único logger para toda aplicação

### 2. **Registry Pattern**
Usado em:
- `commands/index.js` - Registro dinâmico de comandos

### 3. **Command Pattern**
Usado em:
- Sistema de comandos - Cada comando é um objeto com interface comum

### 4. **Dependency Injection**
Usado em:
- `EventHandler` recebe client no constructor
- Handlers recebem dependencies via require

### 5. **Factory Pattern**
Usado em:
- `whatsappService.initialize()` - Cria e configura cliente WhatsApp

---

## 📦 Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)
✅ Cada módulo tem uma responsabilidade única:
- `logger` - apenas logging
- `commandRegistry` - apenas registro de comandos
- `messageHandler` - apenas processamento de mensagens

### Open/Closed Principle (OCP)
✅ Extensível sem modificação:
- Novos comandos podem ser adicionados sem modificar `messageHandler`
- Novas funcionalidades via novos serviços

### Liskov Substitution Principle (LSP)
✅ Comandos seguem interface comum e são intercambiáveis

### Interface Segregation Principle (ISP)
✅ Interfaces pequenas e específicas para cada módulo

### Dependency Inversion Principle (DIP)
✅ Módulos dependem de abstrações:
- `webhook.js` depende de `whatsappService`, não da implementação
- Handlers dependem de interfaces, não de implementações concretas

---

## 🚀 Benefícios da Arquitetura

### 1. **Manutenibilidade**
- Código organizado e fácil de encontrar
- Cada módulo tem responsabilidade clara
- Mudanças localizadas (mudança em um lugar não afeta outros)

### 2. **Escalabilidade**
- Fácil adicionar novos comandos
- Fácil adicionar novos serviços
- Fácil adicionar novos handlers

### 3. **Testabilidade**
- Módulos isolados facilitam testes unitários
- Mocking simplificado
- Testes independentes entre si

### 4. **Reusabilidade**
- Utils podem ser reutilizados em todo o código
- Serviços podem ser usados em múltiplos contextos
- Comandos são independentes e reutilizáveis

### 5. **Legibilidade**
- Estrutura clara e intuitiva
- Nomeação consistente
- Separação de conceitos

---

## 🔮 Próximos Passos para Escala

### Curto Prazo
1. Adicionar mais comandos úteis
2. Implementar sistema de permissões
3. Adicionar rate limiting
4. Implementar cache (Redis)

### Médio Prazo
1. Migrar para TypeScript
2. Adicionar testes automatizados
3. Implementar CI/CD
4. Adicionar documentação automática (Swagger)
5. Implementar sistema de plugins

### Longo Prazo
1. Migrar para microserviços (se necessário)
2. Adicionar message queue (RabbitMQ/Kafka)
3. Implementar sistema de analytics
4. Adicionar integrações com outros serviços
5. Dashboard administrativo

---

## 📚 Referências

- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
