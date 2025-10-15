const logger = require("../utils/logger");
const helpers = require("../utils/helpers");
const commandRegistry = require("../commands");

class MessageHandler {
  async handle(message) {
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

      // Log incoming message
      logger.message(message.from, message.body);

      // Check if it's a command
      if (helpers.isCommand(message.body)) {
        await this.handleCommand(message);
      } else {
        await this.handleRegularMessage(message);
      }
    } catch (error) {
      logger.error("Error handling message:", error.message);
    }
  }

  async handleCommand(message) {
    const { command, args } = helpers.parseCommand(message.body);

    logger.debug(`Command received: ${command}`, args);

    // Check if command exists
    if (!commandRegistry.has(command)) {
      logger.warn(`Unknown command: ${command}`);
      
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
    } catch (error) {
      logger.error(`Error executing command ${command}:`, error.message);
      await message.reply("❌ Error executing command. Please try again.");
    }
  }

  async handleRegularMessage(message) {
    // Handle regular messages here
    // You can add custom logic, AI responses, etc.
    logger.debug("Regular message received");
    
    // Example: Auto-reply feature (can be enabled/disabled in config)
    // await message.reply("Thanks for your message!");
  }
}

module.exports = new MessageHandler();
