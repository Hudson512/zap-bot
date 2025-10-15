const config = require("../config");

class Logger {
  constructor() {
    this.enabled = config.features.logging;
  }

  info(message, ...args) {
    if (this.enabled) {
      console.log(`ℹ️  [INFO] ${message}`, ...args);
    }
  }

  success(message, ...args) {
    if (this.enabled) {
      console.log(`✅ [SUCCESS] ${message}`, ...args);
    }
  }

  error(message, ...args) {
    console.error(`❌ [ERROR] ${message}`, ...args);
  }

  warn(message, ...args) {
    if (this.enabled) {
      console.warn(`⚠️  [WARN] ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.enabled && config.server.env === "development") {
      console.log(`🐛 [DEBUG] ${message}`, ...args);
    }
  }

  message(from, body) {
    if (this.enabled) {
      console.log(`\n📩 [MESSAGE]`);
      console.log(`   From: ${from}`);
      console.log(`   Body: ${body}`);
      console.log(`   ---`);
    }
  }
}

module.exports = new Logger();
