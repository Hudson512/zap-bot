const logger = require("../utils/logger");
const groqService = require("../services/groq.service");
const config = require("../config");

module.exports = {
  name: "ai",
  description: "Gerenciar o bot de IA (ativar/desativar/limpar histórico/status)",
  usage: "!ai <on|off|clear|status|stats>",

  async execute(message, args) {
    try {
      const action = args[0]?.toLowerCase();

      switch (action) {
        case "on":
          await this.enableAI(message);
          break;

        case "off":
          await this.disableAI(message);
          break;

        case "clear":
          await this.clearHistory(message);
          break;

        case "status":
          await this.showStatus(message);
          break;

        case "stats":
          await this.showStats(message);
          break;

        default:
          await this.showHelp(message);
          break;
      }

      return true;
    } catch (error) {
      logger.error("Error in AI command:", error.message);
      await message.reply("❌ Erro ao executar comando de IA.");
      return false;
    }
  },

  async enableAI(message) {
    if (config.features.aiResponses) {
      await message.reply("✅ O bot de IA já está ativado!");
    } else {
      await message.reply(
        "⚠️ O bot de IA está desativado nas configurações.\n" +
        "Para ativar, defina AI_RESPONSES=true no arquivo .env e reinicie o servidor."
      );
    }
  },

  async disableAI(message) {
    await message.reply(
      "⚠️ Para desativar o bot de IA, defina AI_RESPONSES=false no arquivo .env e reinicie o servidor.\n\n" +
      "Você pode usar !ai clear para limpar o histórico desta conversa."
    );
  },

  async clearHistory(message) {
    const sessionId = "default"; // TODO: Get from message context when multi-session is active
    const contactNumber = message.from;
    const chatId = `${sessionId}-${contactNumber}`;

    groqService.clearHistory(chatId);

    await message.reply(
      "🗑️ *Histórico de conversa limpo!*\n\n" +
      "O bot de IA não se lembrará de mensagens anteriores desta conversa."
    );

    logger.success(`Conversation history cleared for ${chatId}`);
  },

  async showStatus(message) {
    const isReady = groqService.isReady();
    const isEnabled = config.features.aiResponses;

    let statusEmoji = "✅";
    let statusText = "Ativo";

    if (!isEnabled) {
      statusEmoji = "⚠️";
      statusText = "Desativado (AI_RESPONSES=false)";
    } else if (!isReady) {
      statusEmoji = "❌";
      statusText = "Erro de inicialização";
    }

    const response =
      `${statusEmoji} *Status do Bot de IA*\n\n` +
      `• Status: ${statusText}\n` +
      `• Modelo: ${config.groq.model}\n` +
      `• Temperatura: ${config.groq.temperature}\n` +
      `• Max Tokens: ${config.groq.maxTokens}\n\n` +
      `_Use !ai stats para mais informações_`;

    await message.reply(response);
  },

  async showStats(message) {
    const stats = groqService.getStats();

    const response =
      `📊 *Estatísticas do Bot de IA*\n\n` +
      `• Inicializado: ${stats.initialized ? "Sim ✅" : "Não ❌"}\n` +
      `• Conversas Ativas: ${stats.activeConversations}\n` +
      `• Histórico Máx: ${stats.maxHistoryLength} mensagens\n` +
      `• Modelo: ${stats.model}\n\n` +
      `_Use !ai clear para limpar seu histórico_`;

    await message.reply(response);
  },

  async showHelp(message) {
    const response =
      `🤖 *Comandos do Bot de IA*\n\n` +
      `• !ai status - Ver status do bot\n` +
      `• !ai stats - Ver estatísticas\n` +
      `• !ai clear - Limpar histórico desta conversa\n` +
      `• !ai on - Informações sobre ativação\n` +
      `• !ai off - Informações sobre desativação\n\n` +
      `_O bot responde automaticamente mensagens que não são comandos_`;

    await message.reply(response);
  },
};
