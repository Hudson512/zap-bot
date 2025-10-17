require("dotenv").config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },

  // WhatsApp configuration
  whatsapp: {
    testNumber: process.env.TEST_NUMBER || "244929782402",
    sessionName: process.env.SESSION_NAME || "zapnode-session",
    chromePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: process.env.HEADLESS === "true" || false,
    startDefaultSession: process.env.START_DEFAULT_SESSION !== "false", // Default true
  },

  // Webhook configuration
  webhook: {
    enabled: process.env.WEBHOOK_ENABLED === "true" || true,
  },

  // Features flags
  features: {
    autoReply: process.env.AUTO_REPLY === "true" || true,
    welcomeMessage: process.env.WELCOME_MESSAGE === "true" || true,
    logging: process.env.LOGGING === "true" || true,
    ignoreGroups: process.env.IGNORE_GROUPS !== "false", // Default true
    ignoreStatus: process.env.IGNORE_STATUS !== "false", // Default true
    ignoreNewsletters: process.env.IGNORE_NEWSLETTERS !== "false", // Default true
    autoCleanupOnLogout: process.env.AUTO_CLEANUP_ON_LOGOUT !== "false", // Default true
    aiResponses: process.env.AI_RESPONSES !== "false", // Default true - Enable AI auto-responses
  },

  // Groq AI configuration
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", // Default: Llama 3.3 70B
    temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.GROQ_MAX_TOKENS) || 1024,
    systemPrompt: process.env.GROQ_SYSTEM_PROMPT || 
      "Você é um assistente virtual prestativo e amigável que responde mensagens de WhatsApp. " +
      "Seja conciso, educado e útil. Responda em português, a menos que o usuário escreva em outro idioma.",
  },
};
