const express = require("express");
const router = express.Router();
const db = require("../services/database.service");
const logger = require("../utils/logger");

/**
 * @swagger
 * /database/stats:
 *   get:
 *     summary: Get database statistics
 *     description: Returns overall statistics about the database including sessions, messages, contacts, and commands
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSessions:
 *                       type: integer
 *                     activeSessions:
 *                       type: integer
 *                     totalMessages:
 *                       type: integer
 *                     totalContacts:
 *                       type: integer
 *                     totalCommands:
 *                       type: integer
 *                     messagesToday:
 *                       type: integer
 *                     databaseSize:
 *                       type: string
 */
router.get("/stats", (req, res) => {
  try {
    const stats = db.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error("Error getting database stats:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /database/sessions - Get all sessions from database
 */
router.get("/sessions", (req, res) => {
  try {
    const sessions = db.getAllSessions();
    res.json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    logger.error("Error getting sessions from database:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /database/sessions/:id - Get specific session
 */
router.get("/sessions/:id", (req, res) => {
  try {
    const { id } = req.params;
    const session = db.getSession(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found"
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error("Error getting session:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /database/messages:
 *   get:
 *     summary: Get messages with filters
 *     description: Retrieve messages filtered by session or chat with pagination
 *     tags: [Database]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *           default: default
 *         description: Session ID to filter messages (optional, defaults to "default")
 *       - in: query
 *         name: chatId
 *         schema:
 *           type: string
 *         description: Chat ID to filter messages (optional, overrides sessionId)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of messages to skip (for pagination)
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 */
router.get("/messages", (req, res) => {
  try {
    const { sessionId = "default", chatId, limit = 50, offset = 0 } = req.query;

    let messages;

    if (chatId) {
      messages = db.getMessagesByChat(chatId, parseInt(limit), parseInt(offset));
    } else {
      // Use sessionId (default or provided)
      messages = db.getMessagesBySession(sessionId, parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      sessionId: chatId ? undefined : sessionId,
      count: messages.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: messages
    });
  } catch (error) {
    logger.error("Error getting messages:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /database/messages/search - Search messages
 * Query params: query, sessionId, limit
 */
router.get("/messages/search", (req, res) => {
  try {
    const { query, sessionId, limit = 50 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter is required"
      });
    }

    const messages = db.searchMessages(query, sessionId || null, parseInt(limit));

    res.json({
      success: true,
      query,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    logger.error("Error searching messages:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /database/contacts:
 *   get:
 *     summary: Get contacts for a session
 *     description: Retrieve all contacts associated with a session
 *     tags: [Database]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *           default: default
 *         description: Session ID (optional, defaults to "default")
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of contacts to return
 *     responses:
 *       200:
 *         description: List of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 sessionId:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contact'
 */
router.get("/contacts", (req, res) => {
  try {
    const { sessionId = "default", limit = 100 } = req.query;

    const contacts = db.getContactsBySession(sessionId, parseInt(limit));

    res.json({
      success: true,
      sessionId,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    logger.error("Error getting contacts:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /database/contacts/top - Get top contacts by message count
 * Query params: sessionId (optional, defaults to "default"), limit
 */
router.get("/contacts/top", (req, res) => {
  try {
    const { sessionId = "default", limit = 10 } = req.query;

    const contacts = db.getTopContacts(sessionId, parseInt(limit));

    res.json({
      success: true,
      sessionId,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    logger.error("Error getting top contacts:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /database/commands/stats - Get command usage statistics
 * Query params: sessionId, limit
 */
router.get("/commands/stats", (req, res) => {
  try {
    const { sessionId, limit = 10 } = req.query;

    const stats = db.getCommandStats(sessionId || null, parseInt(limit));

    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    logger.error("Error getting command stats:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /database/cleanup - Cleanup old data
 * Body: { daysToKeep: 30 }
 */
router.post("/cleanup", (req, res) => {
  try {
    const { daysToKeep = 30 } = req.body;

    const result = db.cleanupOldData(parseInt(daysToKeep));

    res.json({
      success: true,
      message: `Cleaned up data older than ${daysToKeep} days`,
      data: result
    });
  } catch (error) {
    logger.error("Error cleaning up database:", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
