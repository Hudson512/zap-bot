const logger = require("../utils/logger");

module.exports = {
  name: "help",
  description: "Show all available commands",
  usage: "!help",
  
  async execute(message, args) {
    try {
      // Import commandRegistry here to avoid circular dependency
      const commandRegistry = require("../commands");
      const commands = commandRegistry.getAll();
      
      let helpText = "📚 *Available Commands:*\n\n";
      
      commands.forEach((cmd) => {
        helpText += `*${cmd.usage || `!${cmd.name}`}*\n`;
        helpText += `${cmd.description || "No description"}\n\n`;
      });
      
      await message.reply(helpText);
      
      logger.success("Help command executed");
      return true;
    } catch (error) {
      logger.error("Error executing help command:", error.message);
      return false;
    }
  },
};
