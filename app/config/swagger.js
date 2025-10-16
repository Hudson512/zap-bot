const swaggerJsdoc = require("swagger-jsdoc");
const config = require("./index");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ZapNode API",
      version: "1.0.0",
      description: "WhatsApp Integration API with Multi-Session Support and Database Persistence",
      contact: {
        name: "ZapNode",
        url: "https://github.com/Hudson512/zapnode",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: "Development server",
      },
      {
        url: "https://api.zapnode.com",
        description: "Production server (if applicable)",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Health check endpoints",
      },
      {
        name: "Sessions",
        description: "WhatsApp session management",
      },
      {
        name: "Database",
        description: "Database queries and statistics",
      },
      {
        name: "Webhook",
        description: "External message integration",
      },
    ],
    components: {
      schemas: {
        Session: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Session identifier",
              example: "default",
            },
            isReady: {
              type: "boolean",
              description: "Whether the session is ready",
              example: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Session creation timestamp",
            },
            readyAt: {
              type: "string",
              format: "date-time",
              description: "When session became ready",
            },
            options: {
              type: "object",
              description: "Session configuration options",
            },
          },
        },
        Message: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Message ID",
            },
            session_id: {
              type: "string",
              description: "Associated session ID",
            },
            from_number: {
              type: "string",
              description: "Sender phone number",
            },
            chat_id: {
              type: "string",
              description: "Chat identifier",
            },
            chat_type: {
              type: "string",
              enum: ["private", "group", "broadcast", "newsletter"],
              description: "Type of chat",
            },
            body: {
              type: "string",
              description: "Message content",
            },
            message_type: {
              type: "string",
              description: "Message type (chat, image, video, etc)",
            },
            has_media: {
              type: "boolean",
              description: "Whether message contains media",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Message timestamp",
            },
          },
        },
        Contact: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Contact ID",
            },
            session_id: {
              type: "string",
              description: "Associated session ID",
            },
            phone_number: {
              type: "string",
              description: "Contact phone number",
            },
            name: {
              type: "string",
              description: "Contact name",
            },
            message_count: {
              type: "integer",
              description: "Total messages from this contact",
            },
            first_seen: {
              type: "string",
              format: "date-time",
            },
            last_seen: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
  },
  apis: ["./app/server.js", "./app/routes/*.js", "./app/webhook.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
