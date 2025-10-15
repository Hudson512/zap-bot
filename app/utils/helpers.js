/**
 * Format phone number to WhatsApp ID format
 * @param {string} phoneNumber - Phone number (e.g., "244929782402" or "+244929782402")
 * @returns {string} - Formatted WhatsApp ID (e.g., "244929782402@c.us")
 */
function formatPhoneNumber(phoneNumber) {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");
  return `${cleaned}@c.us`;
}

/**
 * Check if message is a command
 * @param {string} text - Message text
 * @returns {boolean}
 */
function isCommand(text) {
  return text.trim().startsWith("!");
}

/**
 * Parse command from message
 * @param {string} text - Message text
 * @returns {Object} - { command, args }
 */
function parseCommand(text) {
  const parts = text.trim().split(/\s+/);
  const command = parts[0].substring(1).toLowerCase(); // Remove '!' and lowercase
  const args = parts.slice(1);

  return { command, args };
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sanitize message text
 * @param {string} text - Message text
 * @returns {string}
 */
function sanitizeText(text) {
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Check if message is from a private chat (individual contact)
 * @param {string} chatId - WhatsApp chat ID
 * @returns {boolean}
 */
function isPrivateChat(chatId) {
  // Private chats end with @c.us
  return chatId.endsWith("@c.us");
}

/**
 * Check if message is from a group
 * @param {string} chatId - WhatsApp chat ID
 * @returns {boolean}
 */
function isGroupChat(chatId) {
  // Group chats end with @g.us
  return chatId.endsWith("@g.us");
}

/**
 * Check if message is from status/story (broadcast)
 * @param {string} chatId - WhatsApp chat ID
 * @returns {boolean}
 */
function isStatusBroadcast(chatId) {
  // Status messages come from 'status@broadcast'
  return chatId === "status@broadcast";
}

/**
 * Check if message is from newsletter
 * @param {string} chatId - WhatsApp chat ID
 * @returns {boolean}
 */
function isNewsletter(chatId) {
  // Newsletter messages end with @newsletter
  return chatId.endsWith("@newsletter");
}

/**
 * Check if message should be ignored
 * @param {string} chatId - WhatsApp chat ID
 * @returns {boolean}
 */
function shouldIgnoreMessage(chatId) {
  return (
    isGroupChat(chatId) ||
    isStatusBroadcast(chatId) ||
    isNewsletter(chatId)
  );
}

module.exports = {
  formatPhoneNumber,
  isCommand,
  parseCommand,
  sleep,
  sanitizeText,
  isPrivateChat,
  isGroupChat,
  isStatusBroadcast,
  isNewsletter,
  shouldIgnoreMessage,
};
