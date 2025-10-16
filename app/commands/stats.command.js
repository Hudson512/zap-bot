const db = require("../services/database.service");
const logger = require("../utils/logger");

module.exports = {
  name: "stats",
  description: "Show database statistics",
  usage: "!stats",

  async execute(message, args) {
    try {
      // Get database statistics
      const stats = db.getStats();

      // Format response
      const response = `
📊 *ZapNode Statistics*

*Database:*
• Total Sessions: ${stats.totalSessions}
• Active Sessions: ${stats.activeSessions}
• Database Size: ${stats.databaseSize}

*Messages:*
• Total Messages: ${stats.totalMessages}
• Messages Today: ${stats.messagesToday}

*Contacts:*
• Total Contacts: ${stats.totalContacts}

*Commands:*
• Total Executed: ${stats.totalCommands}
      `.trim();

      await message.reply(response);
      logger.success(`Stats command executed by ${message.from}`);
      return true;
    } catch (error) {
      logger.error("Error executing stats command:", error.message);
      await message.reply("❌ Error getting statistics. Please try again.");
      return false;
    }
  },
};
