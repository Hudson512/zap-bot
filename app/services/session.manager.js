const logger = require("../utils/logger");
const { Client, LocalAuth } = require("whatsapp-web.js");
const config = require("../config");
const EventHandler = require("../handlers/event.handler");
const messageHandler = require("../handlers/message.handler");

/**
 * SessionManager - Manages multiple WhatsApp client sessions
 */
class SessionManager {
  constructor() {
    this.sessions = new Map(); // Map<sessionId, WhatsAppSession>
  }

  /**
   * Create a new WhatsApp session
   * @param {string} sessionId - Unique identifier for the session
   * @param {Object} options - Session configuration options
   * @returns {Promise<Object>} Session info
   */
  async createSession(sessionId, options = {}) {
    if (this.sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`);
    }

    logger.info(`🔄 Creating session: ${sessionId}`);

    const session = {
      id: sessionId,
      client: null,
      eventHandler: null,
      isReady: false,
      createdAt: new Date(),
      options,
    };

    // Create WhatsApp client
    session.client = new Client({
      authStrategy: new LocalAuth({
        clientId: sessionId,
      }),
      puppeteer: {
        executablePath: options.chromePath || config.whatsapp.chromePath,
        headless: options.headless !== undefined ? options.headless : config.whatsapp.headless,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      webVersionCache: {
        type: "remote",
        remotePath: "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
      },
    });

    // Initialize event handler
    session.eventHandler = new EventHandler(session.client);

    // Setup event listeners
    this.setupEventListeners(session);

    // Store session
    this.sessions.set(sessionId, session);

    // Initialize client
    try {
      await session.client.initialize();
      logger.success(`✅ Session ${sessionId} initialized`);
    } catch (error) {
      logger.error(`Failed to initialize session ${sessionId}:`, error.message);
      this.sessions.delete(sessionId);
      throw error;
    }

    return this.getSessionInfo(sessionId);
  }

  /**
   * Setup event listeners for a session
   * @param {Object} session - Session object
   */
  setupEventListeners(session) {
    const { client, eventHandler } = session;

    // QR Code
    client.on("qr", (qr) => {
      logger.info(`📱 QR Code for session ${session.id}`);
      eventHandler.onQR(qr);
    });

    // Ready
    client.on("ready", async () => {
      session.isReady = true;
      session.readyAt = new Date();
      logger.success(`✅ Session ${session.id} is ready`);
      await eventHandler.onReady();
    });

    // Authentication
    client.on("authenticated", () => {
      logger.success(`🔐 Session ${session.id} authenticated`);
      eventHandler.onAuthenticated();
    });

    // Loading screen
    client.on("loading_screen", (percent, message) => {
      logger.debug(`Session ${session.id} loading: ${percent}%`);
      eventHandler.onLoadingScreen(percent, message);
    });

    // Auth failure
    client.on("auth_failure", (msg) => {
      logger.error(`❌ Session ${session.id} auth failure:`, msg);
      eventHandler.onAuthFailure(msg);
    });

    // Disconnected
    client.on("disconnected", async (reason) => {
      session.isReady = false;
      logger.warn(`⚠️ Session ${session.id} disconnected:`, reason);
      
      try {
        eventHandler.onDisconnected(reason);
      } catch (error) {
        logger.warn(`Error in disconnect handler for ${session.id}:`, error.message);
      }
      
      // If logout and auto-cleanup is enabled, cleanup session gracefully
      if (reason === "LOGOUT" && config.features.autoCleanupOnLogout) {
        logger.info(`🗑️ Auto-cleaning session ${session.id} after logout...`);
        setTimeout(async () => {
          try {
            await this.cleanupSession(session.id);
          } catch (error) {
            logger.error(`Failed to cleanup session ${session.id}:`, error.message);
            // Force remove from map even if cleanup fails
            this.sessions.delete(session.id);
          }
        }, 5000); // Wait 5 seconds before cleanup to let all operations finish
      }
    });

    // Remote session saved
    client.on("remote_session_saved", () => {
      logger.info(`💾 Session ${session.id} saved remotely`);
      eventHandler.onRemoteSessionSaved();
    });

    // Messages
    client.on("message", async (message) => {
      logger.debug(`📩 Message received on session ${session.id}`);
      await messageHandler.handle(message);
    });
  }

  /**
   * Get a session by ID
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Session object or null
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get session info (without client internals)
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} Session info
   */
  getSessionInfo(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      id: session.id,
      isReady: session.isReady,
      createdAt: session.createdAt,
      readyAt: session.readyAt || null,
      options: session.options,
    };
  }

  /**
   * Get all sessions info
   * @returns {Array} Array of session info objects
   */
  getAllSessions() {
    return Array.from(this.sessions.keys()).map(id => this.getSessionInfo(id));
  }

  /**
   * Cleanup session (internal method for graceful cleanup after disconnect)
   * @param {string} sessionId - Session identifier
   * @returns {Promise<boolean>} Success status
   */
  async cleanupSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      logger.warn(`Session ${sessionId} already removed`);
      return true;
    }

    logger.info(`🧹 Cleaning up session: ${sessionId}`);

    try {
      if (session.client) {
        try {
          // Step 1: Close all Puppeteer pages first to stop pending operations
          logger.debug(`Closing Puppeteer pages for session ${sessionId}...`);
          const pupPage = await session.client.pupPage?.catch(() => null);
          if (pupPage) {
            await pupPage.close().catch(() => null);
          }
          
          // Step 2: Close the browser
          const pupBrowser = await session.client.pupBrowser?.catch(() => null);
          if (pupBrowser) {
            await pupBrowser.close().catch(() => null);
          }
          
          // Step 3: Destroy the client with timeout
          logger.debug(`Destroying client for session ${sessionId}...`);
          const destroyPromise = session.client.destroy();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Destroy timeout after 10s')), 10000)
          );
          
          await Promise.race([destroyPromise, timeoutPromise]).catch(error => {
            logger.warn(`Warning during client destroy for ${sessionId}:`, error.message);
          });
        } catch (error) {
          // Silently catch all errors during cleanup
          logger.warn(`Warning during cleanup for ${sessionId}:`, error.message);
        }
      }

      // Remove from map
      this.sessions.delete(sessionId);
      logger.success(`✅ Session ${sessionId} cleaned up successfully`);
      return true;
    } catch (error) {
      logger.error(`Error during cleanup of session ${sessionId}:`, error.message);
      // Force remove from map to prevent memory leaks
      this.sessions.delete(sessionId);
      return false;
    }
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session identifier
   * @returns {Promise<boolean>} Success status
   */
  async deleteSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    logger.info(`🗑️ Deleting session: ${sessionId}`);

    try {
      // Try to logout first
      if (session.client && session.isReady) {
        try {
          await session.client.logout();
        } catch (logoutError) {
          logger.warn(`Logout error (continuing with deletion):`, logoutError.message);
        }
      }

      // Destroy client
      if (session.client) {
        try {
          await session.client.destroy();
        } catch (destroyError) {
          logger.warn(`Destroy error (continuing with deletion):`, destroyError.message);
        }
      }

      // Remove from map
      this.sessions.delete(sessionId);
      logger.success(`✅ Session ${sessionId} deleted`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete session ${sessionId}:`, error.message);
      // Remove from map anyway
      this.sessions.delete(sessionId);
      throw error;
    }
  }

  /**
   * Send message through a specific session
   * @param {string} sessionId - Session identifier
   * @param {string} phoneNumber - Phone number to send to
   * @param {string} message - Message content
   * @returns {Promise<boolean>} Success status
   */
  async sendMessage(sessionId, phoneNumber, message) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    if (!session.isReady) {
      throw new Error(`Session ${sessionId} is not ready`);
    }

    try {
      await session.client.sendMessage(phoneNumber, message);
      logger.success(`✅ Message sent via session ${sessionId} to ${phoneNumber}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send message via session ${sessionId}:`, error.message);
      throw error;
    }
  }

  /**
   * Check if a session is ready
   * @param {string} sessionId - Session identifier
   * @returns {boolean} Ready status
   */
  isSessionReady(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.isReady : false;
  }

  /**
   * Get session client (for advanced usage)
   * @param {string} sessionId - Session identifier
   * @returns {Client|null} WhatsApp client or null
   */
  getClient(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? session.client : null;
  }
}

module.exports = new SessionManager();
