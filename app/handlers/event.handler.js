const logger = require("../utils/logger");
const config = require("../config");
const helpers = require("../utils/helpers");
const db = require("../services/database.service");

class EventHandler {
  constructor(client, sessionId = "default") {
    this.client = client;
    this.sessionId = sessionId;
  }

  onQR(qr) {
    logger.info("\n🔐 QR Code received! Scan with your phone:\n");
    const qrcode = require("qrcode-terminal");
    qrcode.generate(qr, { small: true });
  }

  async onReady() {
    logger.success("\n✅✅✅ WhatsApp Client is READY! ✅✅✅\n");

    try {
      // Get client info
      const info = this.client.info;
      logger.info(`📱 Connected as: ${info.pushname}`);
      logger.info(`📞 Phone: ${info.wid.user}`);

      // Get WhatsApp Web version
      let whatsappVersion = null;
      try {
        whatsappVersion = await this.client.getWWebVersion();
      } catch (error) {
        logger.warn("Could not get WhatsApp version:", error.message);
      }

      // Save session to database
      try {
        db.updateSessionStatus(this.sessionId, "connected", new Date().toISOString());
        db.saveSession(this.sessionId, {
          phoneNumber: info.wid.user,
          status: "connected",
          whatsappVersion: whatsappVersion
        });
        logger.debug(`💾 Saved session ${this.sessionId} to database`);
      } catch (dbError) {
        logger.warn("Failed to save session to database:", dbError.message);
      }

      // Send welcome message if enabled
      if (config.features.welcomeMessage) {
        await this.sendWelcomeMessage();
      }
    } catch (error) {
      logger.error("Error in ready event:", error.message);
    }
  }

  async sendWelcomeMessage() {
    try {
      const testNumber = helpers.formatPhoneNumber(config.whatsapp.testNumber);
      await this.client.sendMessage(
        testNumber,
        "🤖 *Bot WhatsApp Online!*\n\n" +
        "✅ Connected successfully!\n" +
        "📱 Ready to receive messages\n\n" +
        "Send *!help* for available commands."
      );
      logger.success("Welcome message sent!");
    } catch (error) {
      // Silently fail - welcome message is not critical
      logger.warn("Could not send welcome message:", error.message);
    }
  }

  onAuthenticated() {
    logger.success("Client authenticated!");
    logger.info("⏳ Waiting for ready event...");
  }

  onLoadingScreen(percent, message) {
    logger.info(`⏳ Loading: ${percent}% - ${message}`);
  }

  onAuthFailure(msg) {
    logger.error("Authentication failure:", msg);
  }

  onDisconnected(reason) {
    logger.warn("Client disconnected:", reason);
    
    // Update session status in database
    try {
      db.updateSessionStatus(this.sessionId, "disconnected", new Date().toISOString());
      logger.debug(`💾 Updated session ${this.sessionId} status to disconnected`);
    } catch (dbError) {
      logger.warn("Failed to update session status:", dbError.message);
    }
  }

  onRemoteSessionSaved() {
    logger.success("💾 Session saved!");
  }
}

module.exports = EventHandler;
