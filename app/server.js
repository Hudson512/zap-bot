require("dotenv").config();
const express = require("express");
const config = require("./config");
const logger = require("./utils/logger");
const whatsappService = require("./services/whatsapp.service");

const app = express();

// Log startup
logger.info("🚀 Starting ZapNode Application...");
logger.info(`Environment: ${config.server.env}`);

// Start WhatsApp client
whatsappService.initialize();


// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    whatsapp: whatsappService.isClientReady() ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Start Express server
app.listen(config.server.port, () => {
  logger.success(`🌐 Webhook server running on port ${config.server.port}`);
  logger.info(`📍 Health check: http://localhost:${config.server.port}/health`);
});
