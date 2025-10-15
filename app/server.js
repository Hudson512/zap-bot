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

// Global error handlers to prevent server crashes
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Promise Rejection:', reason);
  logger.debug('Promise:', promise);
  // Don't crash the server, just log it
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error.message);
  logger.debug('Stack:', error.stack);
  // Don't crash for Puppeteer protocol errors
  if (error.message?.includes('Protocol error') || error.message?.includes('Session closed')) {
    logger.warn('⚠️ Ignoring Puppeteer protocol error (likely from closed session)');
    return;
  }
  // For other critical errors, still crash after logging
  logger.error('💥 Critical error - server will restart');
  process.exit(1);
});

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
