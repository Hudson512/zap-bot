const Groq = require("groq-sdk");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Groq AI Service
 * Handles AI-powered responses using Groq's LLM models
 */
class GroqService {
  constructor() {
    this.client = null;
    this.conversationHistory = new Map(); // sessionId-contactNumber -> messages[]
    this.maxHistoryLength = 10; // Keep last 10 messages per conversation
    this.initialized = false;
  }

  /**
   * Initialize Groq client
   */
  initialize() {
    if (this.initialized) {
      logger.debug("Groq service already initialized");
      return;
    }

    if (!config.groq.apiKey) {
      logger.error("GROQ_API_KEY not found in environment variables");
      throw new Error("GROQ_API_KEY is required");
    }

    try {
      this.client = new Groq({
        apiKey: config.groq.apiKey,
      });
      this.initialized = true;
      logger.success("✅ Groq AI service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Groq service:", error.message);
      throw error;
    }
  }

  /**
   * Get conversation history for a specific chat
   * @param {string} chatId - Format: "sessionId-contactNumber@c.us"
   * @returns {Array} Array of message objects
   */
  getConversationHistory(chatId) {
    if (!this.conversationHistory.has(chatId)) {
      this.conversationHistory.set(chatId, []);
    }
    return this.conversationHistory.get(chatId);
  }

  /**
   * Add message to conversation history
   * @param {string} chatId - Format: "sessionId-contactNumber@c.us"
   * @param {string} role - "user" or "assistant"
   * @param {string} content - Message content
   */
  addToHistory(chatId, role, content) {
    const history = this.getConversationHistory(chatId);
    history.push({ role, content });

    // Keep only last N messages to avoid token limits
    if (history.length > this.maxHistoryLength) {
      history.shift(); // Remove oldest message
    }
  }

  /**
   * Clear conversation history for a specific chat
   * @param {string} chatId - Format: "sessionId-contactNumber@c.us"
   */
  clearHistory(chatId) {
    this.conversationHistory.delete(chatId);
    logger.debug(`Cleared conversation history for ${chatId}`);
  }

  /**
   * Generate AI response using Groq
   * @param {string} userMessage - User's message
   * @param {string} chatId - Format: "sessionId-contactNumber@c.us"
   * @param {string} sessionId - WhatsApp session ID
   * @returns {Promise<string>} AI-generated response
   */
  async generateResponse(userMessage, chatId, sessionId = "default") {
    if (!this.initialized) {
      logger.warn("Groq service not initialized, initializing now...");
      this.initialize();
    }

    try {
      // Add user message to history
      this.addToHistory(chatId, "user", userMessage);

      // Get conversation history
      const history = this.getConversationHistory(chatId);

      // Prepare messages with system prompt
      const messages = [
        {
          role: "system",
          content: config.groq.systemPrompt,
        },
        ...history,
      ];

      logger.debug(`Generating AI response for ${chatId} (${history.length} messages in history)`);

      // Call Groq API
      const completion = await this.client.chat.completions.create({
        model: config.groq.model,
        messages: messages,
        temperature: config.groq.temperature,
        max_tokens: config.groq.maxTokens,
        top_p: 1,
        stream: false,
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error("Empty response from Groq API");
      }

      // Add AI response to history
      this.addToHistory(chatId, "assistant", aiResponse);

      logger.success(`AI response generated successfully for ${chatId}`);
      return aiResponse;
    } catch (error) {
      logger.error("Error generating AI response:", error.message);

      // Return friendly error message
      if (error.message.includes("rate limit")) {
        return "Desculpe, estou recebendo muitas solicitações no momento. Por favor, tente novamente em alguns instantes. ⏳";
      } else if (error.message.includes("API key")) {
        return "Desculpe, há um problema com minha configuração. Por favor, contate o administrador. 🔧";
      } else {
        return "Desculpe, não consegui processar sua mensagem no momento. Por favor, tente novamente. ❌";
      }
    }
  }

  /**
   * Check if Groq service is ready
   * @returns {boolean}
   */
  isReady() {
    return this.initialized && this.client !== null;
  }

  /**
   * Get service statistics
   * @returns {Object}
   */
  getStats() {
    return {
      initialized: this.initialized,
      activeConversations: this.conversationHistory.size,
      maxHistoryLength: this.maxHistoryLength,
      model: config.groq.model,
    };
  }
}

// Export singleton instance
module.exports = new GroqService();
