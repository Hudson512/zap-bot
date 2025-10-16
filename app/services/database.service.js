const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger");
const config = require("../config");

class DatabaseService {
  constructor() {
    this.db = null;
    this.dbPath = path.join(process.cwd(), "data", "zapnode.db");
  }

  /**
   * Initialize database connection and create tables
   */
  initialize() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        logger.info("📁 Created data directory");
      }

      // Connect to database
      this.db = new Database(this.dbPath);
      logger.success(`✅ Connected to database: ${this.dbPath}`);

      // Enable foreign keys
      this.db.pragma("foreign_keys = ON");

      // Create tables
      this.createTables();

      logger.success("✅ Database initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize database:", error.message);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  createTables() {
    // Sessions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        phone_number TEXT,
        status TEXT NOT NULL DEFAULT 'disconnected',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        connected_at DATETIME,
        disconnected_at DATETIME,
        last_seen DATETIME,
        whatsapp_version TEXT,
        options TEXT
      )
    `);

    // Messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        from_number TEXT NOT NULL,
        to_number TEXT,
        chat_id TEXT NOT NULL,
        chat_type TEXT NOT NULL,
        body TEXT,
        message_type TEXT NOT NULL,
        has_media BOOLEAN DEFAULT 0,
        timestamp DATETIME NOT NULL,
        is_forwarded BOOLEAN DEFAULT 0,
        is_status BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // Contacts table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        name TEXT,
        push_name TEXT,
        is_business BOOLEAN DEFAULT 0,
        is_group BOOLEAN DEFAULT 0,
        first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_count INTEGER DEFAULT 0,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        UNIQUE(session_id, phone_number)
      )
    `);

    // Commands usage table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS command_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        command_name TEXT NOT NULL,
        from_number TEXT NOT NULL,
        chat_id TEXT NOT NULL,
        arguments TEXT,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_contacts_session ON contacts(session_id);
      CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number);
      CREATE INDEX IF NOT EXISTS idx_command_usage_session ON command_usage(session_id);
      CREATE INDEX IF NOT EXISTS idx_command_usage_command ON command_usage(command_name);
    `);

    logger.success("✅ Database tables created/verified");
  }

  // ==================== SESSION METHODS ====================

  /**
   * Save or update session
   */
  saveSession(sessionId, data = {}) {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, phone_number, status, whatsapp_version, options)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        phone_number = COALESCE(?, phone_number),
        status = COALESCE(?, status),
        whatsapp_version = COALESCE(?, whatsapp_version),
        options = COALESCE(?, options),
        last_seen = CURRENT_TIMESTAMP
    `);

    stmt.run(
      sessionId,
      data.phoneNumber || null,
      data.status || "disconnected",
      data.whatsappVersion || null,
      data.options ? JSON.stringify(data.options) : null,
      data.phoneNumber || null,
      data.status || null,
      data.whatsappVersion || null,
      data.options ? JSON.stringify(data.options) : null
    );

    logger.debug(`💾 Saved session: ${sessionId}`);
  }

  /**
   * Update session status
   */
  updateSessionStatus(sessionId, status, timestamp = null) {
    const field = status === "connected" ? "connected_at" : "disconnected_at";
    const stmt = this.db.prepare(`
      UPDATE sessions 
      SET status = ?, ${field} = ?, last_seen = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(status, timestamp || new Date().toISOString(), sessionId);
    logger.debug(`🔄 Session ${sessionId} status: ${status}`);
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    const stmt = this.db.prepare("SELECT * FROM sessions WHERE id = ?");
    const session = stmt.get(sessionId);
    
    if (session && session.options) {
      session.options = JSON.parse(session.options);
    }
    
    return session;
  }

  /**
   * Get all sessions
   */
  getAllSessions() {
    const stmt = this.db.prepare("SELECT * FROM sessions ORDER BY created_at DESC");
    const sessions = stmt.all();
    
    return sessions.map(session => {
      if (session.options) {
        session.options = JSON.parse(session.options);
      }
      return session;
    });
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    const stmt = this.db.prepare("DELETE FROM sessions WHERE id = ?");
    const result = stmt.run(sessionId);
    logger.debug(`🗑️ Deleted session: ${sessionId}`);
    return result.changes > 0;
  }

  // ==================== MESSAGE METHODS ====================

  /**
   * Save message
   */
  saveMessage(message, sessionId = "default") {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO messages (
          id, session_id, from_number, to_number, chat_id, chat_type,
          body, message_type, has_media, timestamp, is_forwarded, is_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
      `);

      const chatType = message.from.includes("@g.us") ? "group" 
                     : message.from.includes("@broadcast") ? "broadcast"
                     : message.from.includes("@newsletter") ? "newsletter"
                     : "private";

      stmt.run(
        message.id._serialized,
        sessionId,
        message.from,
        message.to || null,
        message.from,
        chatType,
        message.body || null,
        message.type || "chat",
        message.hasMedia ? 1 : 0,
        new Date(message.timestamp * 1000).toISOString(),
        message.isForwarded ? 1 : 0,
        message.isStatus ? 1 : 0
      );

      // Update contact
      this.updateContact(message.from, sessionId);

      logger.debug(`💾 Saved message: ${message.id._serialized}`);
    } catch (error) {
      logger.warn("Failed to save message:", error.message);
    }
  }

  /**
   * Get messages by chat ID
   */
  getMessagesByChat(chatId, limit = 50, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE chat_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `);
    
    return stmt.all(chatId, limit, offset);
  }

  /**
   * Get messages by session
   */
  getMessagesBySession(sessionId, limit = 100, offset = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM messages 
      WHERE session_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `);
    
    return stmt.all(sessionId, limit, offset);
  }

  /**
   * Search messages
   */
  searchMessages(query, sessionId = null, limit = 50) {
    let sql = `
      SELECT * FROM messages 
      WHERE body LIKE ?
    `;
    
    const params = [`%${query}%`];
    
    if (sessionId) {
      sql += " AND session_id = ?";
      params.push(sessionId);
    }
    
    sql += " ORDER BY timestamp DESC LIMIT ?";
    params.push(limit);
    
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  // ==================== CONTACT METHODS ====================

  /**
   * Update or create contact
   */
  updateContact(phoneNumber, sessionId, name = null) {
    const stmt = this.db.prepare(`
      INSERT INTO contacts (id, session_id, phone_number, name, message_count)
      VALUES (?, ?, ?, ?, 1)
      ON CONFLICT(session_id, phone_number) DO UPDATE SET
        name = COALESCE(?, name),
        last_seen = CURRENT_TIMESTAMP,
        message_count = message_count + 1
    `);

    const contactId = `${sessionId}-${phoneNumber}`;
    stmt.run(contactId, sessionId, phoneNumber, name, name);
  }

  /**
   * Get contact
   */
  getContact(phoneNumber, sessionId) {
    const stmt = this.db.prepare(`
      SELECT * FROM contacts 
      WHERE session_id = ? AND phone_number = ?
    `);
    
    return stmt.get(sessionId, phoneNumber);
  }

  /**
   * Get all contacts for session
   */
  getContactsBySession(sessionId, limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM contacts 
      WHERE session_id = ? 
      ORDER BY last_seen DESC 
      LIMIT ?
    `);
    
    return stmt.all(sessionId, limit);
  }

  /**
   * Get top contacts (by message count)
   */
  getTopContacts(sessionId, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM contacts 
      WHERE session_id = ? 
      ORDER BY message_count DESC 
      LIMIT ?
    `);
    
    return stmt.all(sessionId, limit);
  }

  // ==================== COMMAND USAGE METHODS ====================

  /**
   * Log command usage
   */
  logCommandUsage(sessionId, commandName, fromNumber, chatId, args = null, success = true, error = null) {
    const stmt = this.db.prepare(`
      INSERT INTO command_usage (
        session_id, command_name, from_number, chat_id, 
        arguments, success, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      sessionId,
      commandName,
      fromNumber,
      chatId,
      args ? JSON.stringify(args) : null,
      success ? 1 : 0,
      error || null
    );

    logger.debug(`📊 Logged command usage: ${commandName}`);
  }

  /**
   * Get command statistics
   */
  getCommandStats(sessionId = null, limit = 10) {
    let sql = `
      SELECT 
        command_name,
        COUNT(*) as usage_count,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as error_count
      FROM command_usage
    `;
    
    const params = [];
    
    if (sessionId) {
      sql += " WHERE session_id = ?";
      params.push(sessionId);
    }
    
    sql += " GROUP BY command_name ORDER BY usage_count DESC LIMIT ?";
    params.push(limit);
    
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  // ==================== STATISTICS METHODS ====================

  /**
   * Get database statistics
   */
  getStats() {
    const stats = {};

    // Total sessions
    stats.totalSessions = this.db.prepare("SELECT COUNT(*) as count FROM sessions").get().count;
    
    // Active sessions
    stats.activeSessions = this.db.prepare(
      "SELECT COUNT(*) as count FROM sessions WHERE status = 'connected'"
    ).get().count;

    // Total messages
    stats.totalMessages = this.db.prepare("SELECT COUNT(*) as count FROM messages").get().count;

    // Total contacts
    stats.totalContacts = this.db.prepare("SELECT COUNT(*) as count FROM contacts").get().count;

    // Total commands executed
    stats.totalCommands = this.db.prepare("SELECT COUNT(*) as count FROM command_usage").get().count;

    // Messages today
    stats.messagesToday = this.db.prepare(`
      SELECT COUNT(*) as count FROM messages 
      WHERE DATE(timestamp) = DATE('now')
    `).get().count;

    // Database size
    const dbStats = fs.statSync(this.dbPath);
    stats.databaseSize = `${(dbStats.size / 1024 / 1024).toFixed(2)} MB`;

    return stats;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      logger.info("📦 Database connection closed");
    }
  }

  /**
   * Cleanup old data (optional maintenance)
   */
  cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Delete old messages
    const messagesDeleted = this.db.prepare(`
      DELETE FROM messages WHERE timestamp < ?
    `).run(cutoffDate.toISOString()).changes;

    // Delete old command logs
    const commandsDeleted = this.db.prepare(`
      DELETE FROM command_usage WHERE executed_at < ?
    `).run(cutoffDate.toISOString()).changes;

    logger.info(`🧹 Cleaned up ${messagesDeleted} old messages and ${commandsDeleted} old command logs`);
    
    // Run VACUUM to reclaim space
    this.db.exec("VACUUM");
    
    return { messagesDeleted, commandsDeleted };
  }
}

// Export singleton instance
module.exports = new DatabaseService();
