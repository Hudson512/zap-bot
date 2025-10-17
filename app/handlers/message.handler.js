const logger = require("../utils/logger");
const helpers = require("../utils/helpers");
const commandRegistry = require("../commands");
const db = require("../services/database.service");
const groqService = require("../services/groq.service");
const config = require("../config");

class MessageHandler {
  async handle(message, sessionId = "default") {
    try {
      const chatId = message.from;

      // Ignore messages from groups, status, and newsletters
      if (helpers.shouldIgnoreMessage(chatId)) {
        logger.debug(`Ignoring message from: ${chatId}`);
        return;
      }

      // Only process private chat messages (ending with @c.us)
      if (!helpers.isPrivateChat(chatId)) {
        logger.debug(`Non-private chat ignored: ${chatId}`);
        return;
      }

      // Save ONLY private messages to database
      try {
        db.saveMessage(message, sessionId);
      } catch (dbError) {
        logger.warn("Failed to save message to database:", dbError.message);
      }

      // Log incoming message
      logger.message(message.from, message.body);

      // Check if it's a command
      if (helpers.isCommand(message.body)) {
        await this.handleCommand(message, sessionId);
      } else {
        await this.handleRegularMessage(message, sessionId);
      }
    } catch (error) {
      logger.error("Error handling message:", error.message);
    }
  }

  async handleCommand(message, sessionId = "default") {
    const { command, args } = helpers.parseCommand(message.body);

    logger.debug(`Command received: ${command}`, args);

    // Check if command exists
    if (!commandRegistry.has(command)) {
      logger.warn(`Unknown command: ${command}`);
      
      // Log failed command
      try {
        db.logCommandUsage(
          sessionId,
          command,
          message.from,
          message.from,
          args,
          false,
          "Unknown command"
        );
      } catch (dbError) {
        logger.warn("Failed to log command usage:", dbError.message);
      }
      
      // Optionally send help message
      if (command === "help") {
        await message.reply(commandRegistry.getHelp());
      }
      return;
    }

    // Execute command
    const cmd = commandRegistry.get(command);
    try {
      await cmd.execute(message, args);
      
      // Log successful command
      try {
        db.logCommandUsage(
          sessionId,
          command,
          message.from,
          message.from,
          args,
          true,
          null
        );
      } catch (dbError) {
        logger.warn("Failed to log command usage:", dbError.message);
      }
    } catch (error) {
      logger.error(`Error executing command ${command}:`, error.message);
      
      // Log failed command
      try {
        db.logCommandUsage(
          sessionId,
          command,
          message.from,
          message.from,
          args,
          false,
          error.message
        );
      } catch (dbError) {
        logger.warn("Failed to log command usage:", dbError.message);
      }
      
      await message.reply("❌ Error executing command. Please try again.");
    }
  }

  async handleRegularMessage(message, sessionId = "default") {
    // Handle regular messages here
    logger.debug("Regular message received");
    
    // Check if AI responses are enabled
    if (!config.features.aiResponses) {
      logger.debug("AI responses disabled in config");
      return;
    }

    // Generate chat ID for conversation context
    const contactNumber = message.from;
    const chatId = `${sessionId}-${contactNumber}`;

    try {
      // Generate AI response using Groq
      const aiResponse = await groqService.generateResponse(
        message.body,
        chatId,
        sessionId
      );

      // Send AI response back to user
      await message.reply(aiResponse);

      logger.success(`AI response sent to ${contactNumber}`);
    } catch (error) {
      logger.error("Error sending AI response:", error.message);
    }
  }
}

module.exports = new MessageHandler();
