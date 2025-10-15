require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const config = require("./config");
const logger = require("./utils/logger");
const whatsappService = require("./services/whatsapp.service");
const sessionManager = require("./services/session.manager");
const webhookApp = require("./webhook");
const sessionsRoutes = require("./routes/sessions.routes");

const app = express();

// Middleware
app.use(bodyParser.json());

// Log startup
logger.info("🚀 Starting ZapNode Application...");
logger.info(`Environment: ${config.server.env}`);
logger.info(`📊 Multi-session support: ENABLED`);

// Start default WhatsApp client (backward compatibility)
if (config.whatsapp.startDefaultSession !== false) {
  logger.info("🔄 Starting default session...");
  whatsappService.initialize();
}

// Mount routes
app.use("/webhook", webhookApp);
app.use("/sessions", sessionsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  const allSessions = sessionManager.getAllSessions();
  const defaultSession = {
    status: whatsappService.isClientReady() ? "connected" : "disconnected",
  };

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    defaultSession,
    multiSession: {
      enabled: true,
      totalSessions: allSessions.length,
      sessions: allSessions,
    },
  });
});

// Start Express server
app.listen(config.server.port, () => {
  logger.success(`🌐 Webhook server running on port ${config.server.port}`);
  logger.info(`📍 Health check: http://localhost:${config.server.port}/health`);
});
