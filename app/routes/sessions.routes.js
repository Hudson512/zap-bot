const express = require("express");
const sessionManager = require("../services/session.manager");
const logger = require("../utils/logger");
const helpers = require("../utils/helpers");

const router = express.Router();

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: List all WhatsApp sessions
 *     description: Returns a list of all active and inactive WhatsApp sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 sessions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 */
router.get("/", (req, res) => {
  try {
    const sessions = sessionManager.getAllSessions();
    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    logger.error("Error listing sessions:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new WhatsApp session
 *     description: Creates a new WhatsApp session with the specified configuration
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Unique identifier for the session
 *                 example: customer-abc
 *               chromePath:
 *                 type: string
 *                 description: Path to Chrome executable (optional)
 *               headless:
 *                 type: boolean
 *                 description: Run Chrome in headless mode (optional)
 *                 default: false
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 session:
 *                   $ref: '#/components/schemas/Session'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", async (req, res) => {
  try {
    const { sessionId, chromePath, headless } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "sessionId is required",
      });
    }

    const options = {};
    if (chromePath) options.chromePath = chromePath;
    if (headless !== undefined) options.headless = headless;

    const sessionInfo = await sessionManager.createSession(sessionId, options);

    res.status(201).json({
      success: true,
      message: "Session created successfully",
      session: sessionInfo,
    });
  } catch (error) {
    logger.error("Error creating session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /sessions/:sessionId
 * Get session info
 */
router.get("/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionInfo = sessionManager.getSessionInfo(sessionId);

    if (!sessionInfo) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      session: sessionInfo,
    });
  } catch (error) {
    logger.error("Error getting session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /sessions/:sessionId
 * Delete a session
 */
router.delete("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    await sessionManager.deleteSession(sessionId);

    res.json({
      success: true,
      message: `Session ${sessionId} deleted successfully`,
    });
  } catch (error) {
    logger.error("Error deleting session:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /sessions/:sessionId/send
 * Send message through a specific session
 * Body: { phoneNumber, message }
 */
router.post("/:sessionId/send", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: "phoneNumber and message are required",
      });
    }

    // Format phone number
    const chatId = helpers.formatPhoneNumber(phoneNumber);

    // Send message
    await sessionManager.sendMessage(sessionId, chatId, message);

    res.json({
      success: true,
      message: "Message sent successfully",
      sessionId,
      to: phoneNumber,
    });
  } catch (error) {
    logger.error("Error sending message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /sessions/:sessionId/status
 * Check session status
 */
router.get("/:sessionId/status", (req, res) => {
  try {
    const { sessionId } = req.params;
    const isReady = sessionManager.isSessionReady(sessionId);
    const sessionInfo = sessionManager.getSessionInfo(sessionId);

    if (!sessionInfo) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      sessionId,
      isReady,
      status: isReady ? "ready" : "not_ready",
    });
  } catch (error) {
    logger.error("Error checking session status:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
