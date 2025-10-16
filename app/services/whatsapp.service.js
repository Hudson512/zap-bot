const { Client, LocalAuth } = require("whatsapp-web.js");
const config = require("../config");
const logger = require("../utils/logger");
const EventHandler = require("../handlers/event.handler");
const messageHandler = require("../handlers/message.handler");

class WhatsAppService {
  constructor() {
    this.client = null;
    this.eventHandler = null;
    this.isReady = false;
  }

  initialize() {
    logger.info("🔄 Creating WhatsApp client...");

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: config.whatsapp.sessionName,
      }),
      puppeteer: {
        executablePath: config.whatsapp.chromePath,
        headless: config.whatsapp.headless,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
    });

    // Initialize event handler with default sessionId
    this.eventHandler = new EventHandler(this.client, "default");

    // Setup event listeners
    this.setupEventListeners();

    // Initialize client with error handling
    logger.info("🚀 Initializing WhatsApp client...");
    
    this.client.initialize().catch((error) => {
      logger.error("Failed to initialize WhatsApp client:", error.message);
      logger.warn("Retrying in 10 seconds...");
      
      setTimeout(() => {
        logger.info("Retrying initialization...");
        this.initialize();
      }, 10000);
    });
  }

  setupEventListeners() {
    // QR Code
    this.client.on("qr", (qr) => this.eventHandler.onQR(qr));

    // Ready
    this.client.on("ready", async () => {
      this.isReady = true;
      
      // Get and log WhatsApp Web version
      try {
        const version = await this.client.getWWebVersion();
        logger.info(`📱 WhatsApp Web Version: ${version}`);
      } catch (error) {
        logger.warn("Could not get WhatsApp Web version:", error.message);
      }
      
      await this.eventHandler.onReady();
    });

    // Authentication
    this.client.on("authenticated", () => this.eventHandler.onAuthenticated());

    // Loading screen
    this.client.on("loading_screen", (percent, message) =>
      this.eventHandler.onLoadingScreen(percent, message)
    );

    // Auth failure
    this.client.on("auth_failure", (msg) => this.eventHandler.onAuthFailure(msg));

    // Disconnected
    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      
      try {
        this.eventHandler.onDisconnected(reason);
      } catch (error) {
        logger.warn("Error in disconnect handler:", error.message);
      }
      
      // If logout, warn user
      if (reason === "LOGOUT") {
        logger.warn("⚠️ Default session logged out. You'll need to scan QR code again on next restart.");
      }
    });

    // Remote session saved
    this.client.on("remote_session_saved", () =>
      this.eventHandler.onRemoteSessionSaved()
    );

    // Messages
    this.client.on("message", async (message) => {
      await messageHandler.handle(message);
    });
  }

  getClient() {
    return this.client;
  }

  isClientReady() {
    return this.isReady;
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isReady) {
      throw new Error("WhatsApp client is not ready");
    }

    try {
      await this.client.sendMessage(phoneNumber, message);
      logger.success(`Message sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error("Error sending message:", error.message);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
