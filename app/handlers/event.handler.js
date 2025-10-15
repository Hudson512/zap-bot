const logger = require("../utils/logger");
const config = require("../config");
const helpers = require("../utils/helpers");

class EventHandler {
  constructor(client) {
    this.client = client;
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
      logger.error("Error sending welcome message:", error.message);
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
  }

  onRemoteSessionSaved() {
    logger.success("💾 Session saved!");
  }
}

module.exports = EventHandler;
