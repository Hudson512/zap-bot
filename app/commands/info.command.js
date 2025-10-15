const logger = require("../utils/logger");
const config = require("../config");
const helpers = require("../utils/helpers");

module.exports = {
  name: "info",
  description: "Show bot information and settings",
  usage: "!info",
  
  async execute(message, args) {
    try {
      const chat = await message.getChat();
      const contact = await message.getContact();
      
      let infoText = "🤖 *ZapNode Bot Info*\n\n";
      
      // Bot features
      infoText += "⚙️ *Features:*\n";
      infoText += `• Auto Reply: ${config.features.autoReply ? "✅" : "❌"}\n`;
      infoText += `• Welcome Message: ${config.features.welcomeMessage ? "✅" : "❌"}\n\n`;
      
      // Message filters
      infoText += "🔍 *Message Filters:*\n";
      infoText += `• Ignore Groups: ${config.features.ignoreGroups ? "✅" : "❌"}\n`;
      infoText += `• Ignore Status: ${config.features.ignoreStatus ? "✅" : "❌"}\n`;
      infoText += `• Ignore Newsletters: ${config.features.ignoreNewsletters ? "✅" : "❌"}\n\n`;
      
      // Chat info
      infoText += "💬 *Chat Info:*\n";
      infoText += `• Type: ${helpers.isPrivateChat(message.from) ? "Private" : "Other"}\n`;
      infoText += `• Contact: ${contact.pushname || contact.number}\n`;
      infoText += `• Chat ID: ${message.from}\n\n`;
      
      infoText += "📝 Use *!help* to see available commands";
      
      await message.reply(infoText);
      
      logger.success("Info command executed");
      return true;
    } catch (error) {
      logger.error("Error executing info command:", error.message);
      return false;
    }
  },
};
