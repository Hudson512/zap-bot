const express = require("express");
const bodyParser = require("body-parser");
const whatsappService = require("./services/whatsapp.service");
const sessionManager = require("./services/session.manager");
const logger = require("./utils/logger");
const helpers = require("./utils/helpers");
const config = require("./config");

const app = express();
app.use(bodyParser.json());

// Webhook principal
app.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;

    logger.debug("Webhook received:", payload);

    // Validate webhook is enabled
    if (!config.webhook.enabled) {
      logger.warn("Webhook is disabled");
      return res.status(503).json({ error: "Webhook is disabled" });
    }

    // Ignora mensagens que não são de saída
    if (payload.message_type !== "outgoing") {
      logger.debug("Ignoring non-outgoing message");
      return res.sendStatus(200);
    }

    // Ignora mensagens privadas (ex: anotações internas dos agentes)
    if (payload.private === true) {
      logger.debug("Ignoring private message");
      return res.sendStatus(200);
    }

    const conversation = payload.conversation;
    const whatsappNumber =
      conversation.meta?.sender?.phone_number ||
      conversation.meta?.sender?.identifier;
    const messageContent = payload.content;
    const sessionId = payload.sessionId || "default"; // Use specified session or default

    if (!whatsappNumber || !messageContent) {
      logger.warn("Missing phone number or message content");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Format phone number
    const chatId = helpers.formatPhoneNumber(whatsappNumber);

    // Determine which service to use (multi-session or default)
    let messageSent = false;
    
    if (sessionId === "default") {
      // Use default single session
      if (!whatsappService.isClientReady()) {
        logger.error("WhatsApp client is not ready");
        return res.status(503).json({ error: "WhatsApp client not ready" });
      }
      await whatsappService.sendMessage(chatId, messageContent);
      messageSent = true;
    } else {
      // Use multi-session manager
      if (!sessionManager.isSessionReady(sessionId)) {
        logger.error(`Session ${sessionId} is not ready`);
        return res.status(503).json({ error: `Session ${sessionId} not ready` });
      }
      await sessionManager.sendMessage(sessionId, chatId, messageContent);
      messageSent = true;
    }
    
    if (messageSent) {
      logger.success(`Message sent via ${sessionId} session to ${whatsappNumber}`);
      res.status(200).json({ success: true, message: "Message sent", sessionId });
    }

  } catch (error) {
    logger.error("Error in webhook:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Webhook test endpoint
app.post("/webhook/test", async (req, res) => {
  try {
    const { phoneNumber, message, sessionId = "default" } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: "Missing phoneNumber or message" });
    }

    const chatId = helpers.formatPhoneNumber(phoneNumber);
    
    // Use specified session or default
    if (sessionId === "default") {
      if (!whatsappService.isClientReady()) {
        return res.status(503).json({ error: "WhatsApp client not ready" });
      }
      await whatsappService.sendMessage(chatId, message);
    } else {
      if (!sessionManager.isSessionReady(sessionId)) {
        return res.status(503).json({ error: `Session ${sessionId} not ready` });
      }
      await sessionManager.sendMessage(sessionId, chatId, message);
    }

    res.status(200).json({ 
      success: true, 
      message: "Test message sent",
      sessionId 
    });
  } catch (error) {
    logger.error("Error in test webhook:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
