/**
 * Swagger Documentation for Database Routes
 * 
 * This file contains all OpenAPI 3.0 documentation for /database endpoints.
 * Import this in swagger.js to keep route files clean.
 */

module.exports = {
  paths: {
    '/database/stats': {
      get: {
        tags: ['Database'],
        summary: 'Get database statistics',
        description: 'Returns overall statistics about the database including sessions, messages, contacts, and commands',
        responses: {
          200: {
            description: 'Database statistics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      type: 'object',
                      properties: {
                        totalSessions: {
                          type: 'integer',
                          description: 'Total number of sessions in database',
                          example: 5
                        },
                        activeSessions: {
                          type: 'integer',
                          description: 'Number of currently connected sessions',
                          example: 2
                        },
                        totalMessages: {
                          type: 'integer',
                          description: 'Total number of messages stored',
                          example: 1523
                        },
                        totalContacts: {
                          type: 'integer',
                          description: 'Total number of contacts',
                          example: 145
                        },
                        totalCommands: {
                          type: 'integer',
                          description: 'Total number of commands executed',
                          example: 78
                        },
                        messagesToday: {
                          type: 'integer',
                          description: 'Number of messages received today',
                          example: 34
                        },
                        databaseSize: {
                          type: 'string',
                          description: 'Database file size',
                          example: '2.45 MB'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/sessions': {
      get: {
        tags: ['Database'],
        summary: 'Get all sessions from database',
        description: 'Returns a list of all sessions stored in the database with their metadata',
        responses: {
          200: {
            description: 'List of sessions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of sessions returned',
                      example: 3
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'string',
                            description: 'Session ID',
                            example: 'default'
                          },
                          phone_number: {
                            type: 'string',
                            description: 'WhatsApp phone number',
                            example: '244929782402'
                          },
                          status: {
                            type: 'string',
                            enum: ['connected', 'disconnected'],
                            description: 'Current session status',
                            example: 'connected'
                          },
                          created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Session creation timestamp',
                            example: '2025-10-15T10:30:00.000Z'
                          },
                          connected_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last connection timestamp',
                            example: '2025-10-15T10:31:00.000Z'
                          },
                          disconnected_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last disconnection timestamp',
                            nullable: true
                          },
                          last_seen: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last activity timestamp',
                            example: '2025-10-17T14:20:00.000Z'
                          },
                          whatsapp_version: {
                            type: 'string',
                            description: 'WhatsApp Web version',
                            example: '2.3000.1028452502'
                          },
                          options: {
                            type: 'object',
                            description: 'Session configuration options',
                            nullable: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/sessions/{id}': {
      get: {
        tags: ['Database'],
        summary: 'Get specific session from database',
        description: 'Returns detailed information about a specific session by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Session ID',
            schema: {
              type: 'string',
              example: 'default'
            }
          }
        ],
        responses: {
          200: {
            description: 'Session retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          example: 'default'
                        },
                        phone_number: {
                          type: 'string',
                          example: '244929782402'
                        },
                        status: {
                          type: 'string',
                          enum: ['connected', 'disconnected'],
                          example: 'connected'
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-10-15T10:30:00.000Z'
                        },
                        connected_at: {
                          type: 'string',
                          format: 'date-time',
                          example: '2025-10-15T10:31:00.000Z'
                        },
                        whatsapp_version: {
                          type: 'string',
                          example: '2.3000.1028452502'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          404: {
            description: 'Session not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    error: {
                      type: 'string',
                      example: 'Session not found'
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/messages': {
      get: {
        tags: ['Database'],
        summary: 'Get messages with filters',
        description: 'Retrieve messages filtered by session or chat with pagination support',
        parameters: [
          {
            name: 'sessionId',
            in: 'query',
            required: false,
            description: 'Session ID to filter messages (defaults to "default")',
            schema: {
              type: 'string',
              default: 'default',
              example: 'default'
            }
          },
          {
            name: 'chatId',
            in: 'query',
            required: false,
            description: 'Chat ID to filter messages (overrides sessionId if provided)',
            schema: {
              type: 'string',
              example: '244929782402@c.us'
            }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of messages to return',
            schema: {
              type: 'integer',
              default: 50,
              minimum: 1,
              maximum: 1000,
              example: 50
            }
          },
          {
            name: 'offset',
            in: 'query',
            required: false,
            description: 'Number of messages to skip for pagination',
            schema: {
              type: 'integer',
              default: 0,
              minimum: 0,
              example: 0
            }
          }
        ],
        responses: {
          200: {
            description: 'Messages retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    sessionId: {
                      type: 'string',
                      description: 'Session ID used for filtering (only present when filtering by session)',
                      example: 'default'
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of messages returned',
                      example: 50
                    },
                    limit: {
                      type: 'integer',
                      description: 'Maximum messages per page',
                      example: 50
                    },
                    offset: {
                      type: 'integer',
                      description: 'Current offset for pagination',
                      example: 0
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Message'
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/messages/search': {
      get: {
        tags: ['Database'],
        summary: 'Search messages by content',
        description: 'Search messages by text content with optional session filter',
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            description: 'Search term to find in message bodies',
            schema: {
              type: 'string',
              example: 'hello'
            }
          },
          {
            name: 'sessionId',
            in: 'query',
            required: false,
            description: 'Filter results by session ID',
            schema: {
              type: 'string',
              example: 'default'
            }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of results to return',
            schema: {
              type: 'integer',
              default: 50,
              minimum: 1,
              maximum: 1000,
              example: 50
            }
          }
        ],
        responses: {
          200: {
            description: 'Search results retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    query: {
                      type: 'string',
                      description: 'Search term used',
                      example: 'hello'
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of messages found',
                      example: 12
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Message'
                      }
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Missing required parameter',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: false
                    },
                    error: {
                      type: 'string',
                      example: 'Query parameter is required'
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/contacts': {
      get: {
        tags: ['Database'],
        summary: 'Get contacts for a session',
        description: 'Retrieve all contacts associated with a session, sorted by last activity',
        parameters: [
          {
            name: 'sessionId',
            in: 'query',
            required: false,
            description: 'Session ID (defaults to "default")',
            schema: {
              type: 'string',
              default: 'default',
              example: 'default'
            }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of contacts to return',
            schema: {
              type: 'integer',
              default: 100,
              minimum: 1,
              maximum: 1000,
              example: 100
            }
          }
        ],
        responses: {
          200: {
            description: 'Contacts retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    sessionId: {
                      type: 'string',
                      description: 'Session ID used',
                      example: 'default'
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of contacts returned',
                      example: 25
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Contact'
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/contacts/top': {
      get: {
        tags: ['Database'],
        summary: 'Get top contacts by message count',
        description: 'Returns contacts sorted by number of messages (most active first)',
        parameters: [
          {
            name: 'sessionId',
            in: 'query',
            required: false,
            description: 'Session ID (defaults to "default")',
            schema: {
              type: 'string',
              default: 'default',
              example: 'default'
            }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of contacts to return',
            schema: {
              type: 'integer',
              default: 10,
              minimum: 1,
              maximum: 100,
              example: 10
            }
          }
        ],
        responses: {
          200: {
            description: 'Top contacts retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    sessionId: {
                      type: 'string',
                      example: 'default'
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of contacts returned',
                      example: 10
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Contact'
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/commands/stats': {
      get: {
        tags: ['Database'],
        summary: 'Get command usage statistics',
        description: 'Returns statistics about command usage including total executions, success rate, and errors',
        parameters: [
          {
            name: 'sessionId',
            in: 'query',
            required: false,
            description: 'Filter by session ID (returns stats for all sessions if not provided)',
            schema: {
              type: 'string',
              example: 'default'
            }
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Maximum number of commands to return',
            schema: {
              type: 'integer',
              default: 10,
              minimum: 1,
              maximum: 100,
              example: 10
            }
          }
        ],
        responses: {
          200: {
            description: 'Command statistics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of commands returned',
                      example: 5
                    },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          command_name: {
                            type: 'string',
                            description: 'Command name (without ! prefix)',
                            example: 'ping'
                          },
                          usage_count: {
                            type: 'integer',
                            description: 'Total number of times executed',
                            example: 45
                          },
                          success_count: {
                            type: 'integer',
                            description: 'Number of successful executions',
                            example: 45
                          },
                          error_count: {
                            type: 'integer',
                            description: 'Number of failed executions',
                            example: 0
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/database/cleanup': {
      post: {
        tags: ['Database'],
        summary: 'Cleanup old database data',
        description: 'Deletes messages and command logs older than the specified number of days. Also runs VACUUM to reclaim disk space.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  daysToKeep: {
                    type: 'integer',
                    description: 'Number of days of data to keep (older data will be deleted)',
                    default: 30,
                    minimum: 1,
                    example: 30
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Cleanup completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    message: {
                      type: 'string',
                      example: 'Cleaned up data older than 30 days'
                    },
                    data: {
                      type: 'object',
                      properties: {
                        messagesDeleted: {
                          type: 'integer',
                          description: 'Number of messages deleted',
                          example: 523
                        },
                        commandsDeleted: {
                          type: 'integer',
                          description: 'Number of command logs deleted',
                          example: 145
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
};
