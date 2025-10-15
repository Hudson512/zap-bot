const logger = require("../utils/logger");

module.exports = {
  name: "ping",
  description: "Test bot responsiveness",
  usage: "!ping",
  
  async execute(message, args) {
    try {
      const start = Date.now();
      await message.reply("🏓 Pong!");
      const latency = Date.now() - start;
      
      logger.success(`Ping command executed in ${latency}ms`);
      return true;
    } catch (error) {
      logger.error("Error executing ping command:", error.message);
      return false;
    }
  },
};
