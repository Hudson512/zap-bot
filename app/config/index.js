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
  },
};
