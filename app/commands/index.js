const logger = require("../utils/logger");

class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    // Load all commands
    const pingCommand = require("./ping.command");
    const helpCommand = require("./help.command");
    const infoCommand = require("./info.command");
    const statsCommand = require("./stats.command");
    const aiCommand = require("./ai.command");
    
    this.register(pingCommand);
    this.register(helpCommand);
    this.register(infoCommand);
    this.register(statsCommand);
    this.register(aiCommand);
    
    logger.info(`Loaded ${this.commands.size} command(s)`);
  }

  register(command) {
    if (!command.name || !command.execute) {
      logger.error("Invalid command structure");
      return;
    }

    this.commands.set(command.name, command);
    logger.debug(`Registered command: ${command.name}`);
  }

  get(commandName) {
    return this.commands.get(commandName);
  }

  has(commandName) {
    return this.commands.has(commandName);
  }

  getAll() {
    return Array.from(this.commands.values());
  }
}

module.exports = new CommandRegistry();
