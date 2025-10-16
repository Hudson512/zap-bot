require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const config = require("./config");
const logger = require("./utils/logger");
const db = require("./services/database.service");
const whatsappService = require("./services/whatsapp.service");
const sessionManager = require("./services/session.manager");
const webhookApp = require("./webhook");
const sessionsRoutes = require("./routes/sessions.routes");
const databaseRoutes = require("./routes/database.routes");

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

// Initialize database
logger.info("💾 Initializing database...");
db.initialize();

// Start default WhatsApp client (backward compatibility)
if (config.whatsapp.startDefaultSession !== false) {
  logger.info("🔄 Starting default session...");
  whatsappService.initialize();
}

// Mount routes
app.use("/webhook", webhookApp);
app.use("/sessions", sessionsRoutes);
app.use("/database", databaseRoutes);

// Root endpoint - redirect to API docs
/**
 * @swagger
 * /:
 *   get:
 *     summary: API root endpoint
 *     description: Redirects to API documentation
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Welcome message with API links
 */
app.get("/", (req, res) => {
  res.json({
    message: "🤖 Welcome to ZapNode API",
    version: "1.0.0",
    documentation: `http://localhost:${config.server.port}/api-docs`,
    endpoints: {
      health: "/health",
      sessions: "/sessions",
      database: "/database",
      webhook: "/webhook",
    },
    features: [
      "Multi-session WhatsApp support",
      "Database persistence with SQLite",
      "Command system",
      "Webhook integration",
      "RESTful API"
    ]
  });
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "ZapNode API Documentation",
}));

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and all sessions
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 defaultSession:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, disconnected]
 *                 multiSession:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     totalSessions:
 *                       type: integer
 *                     sessions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Session'
 */
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
