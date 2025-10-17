const express = require("express");
const router = express.Router();
const db = require("../services/database.service");
const logger = require("../utils/logger");

// GET /database/stats - Get database statistics
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

// GET /database/sessions - Get all sessions from database
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

// GET /database/sessions/:id - Get specific session
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

// GET /database/messages - Get messages with filters
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

// GET /database/messages/search - Search messages
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

// GET /database/contacts - Get contacts for a session
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

// GET /database/contacts/top - Get top contacts by message count
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

// GET /database/commands/stats - Get command usage statistics
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

// POST /database/cleanup - Cleanup old data
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
