/**
 * Swagger Documentation for Sessions Routes
 * 
 * This file contains all OpenAPI 3.0 documentation for /sessions endpoints.
 * Import this in swagger.js to keep route files clean.
 */

module.exports = {
  paths: {
    '/sessions': {
      get: {
        tags: ['Sessions'],
        summary: 'List all WhatsApp sessions',
        description: 'Returns a list of all active and inactive WhatsApp sessions managed by the application',
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
                      description: 'Total number of sessions',
                      example: 3
                    },
                    sessions: {
                      type: 'array',
                      description: 'Array of session objects',
                      items: {
                        $ref: '#/components/schemas/Session'
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
      },
      post: {
        tags: ['Sessions'],
        summary: 'Create a new WhatsApp session',
        description: 'Creates a new WhatsApp session with the specified configuration. Each session represents a separate WhatsApp connection.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sessionId'],
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Unique identifier for the session',
                    example: 'customer-abc'
                  },
                  chromePath: {
                    type: 'string',
                    description: 'Path to Chrome executable (optional, uses system default if not provided)',
                    example: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                  },
                  headless: {
                    type: 'boolean',
                    description: 'Run Chrome in headless mode (optional)',
                    default: false,
                    example: false
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Session created successfully',
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
                      example: 'Session created successfully'
                    },
                    session: {
                      $ref: '#/components/schemas/Session'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid request - sessionId is required',
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
                      example: 'sessionId is required'
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
    '/sessions/{sessionId}': {
      get: {
        tags: ['Sessions'],
        summary: 'Get session information',
        description: 'Retrieves detailed information about a specific WhatsApp session',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            description: 'Unique session identifier',
            schema: {
              type: 'string',
              example: 'default'
            }
          }
        ],
        responses: {
          200: {
            description: 'Session information retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    session: {
                      $ref: '#/components/schemas/Session'
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
      },
      delete: {
        tags: ['Sessions'],
        summary: 'Delete a session',
        description: 'Deletes a WhatsApp session, disconnecting it and removing all associated data',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            description: 'Unique session identifier',
            schema: {
              type: 'string',
              example: 'default'
            }
          }
        ],
        responses: {
          200: {
            description: 'Session deleted successfully',
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
                      example: 'Session default deleted successfully'
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
    '/sessions/{sessionId}/send': {
      post: {
        tags: ['Sessions'],
        summary: 'Send message through a specific session',
        description: 'Sends a WhatsApp message to a phone number using the specified session',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            description: 'Session ID to use for sending the message',
            schema: {
              type: 'string',
              example: 'default'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phoneNumber', 'message'],
                properties: {
                  phoneNumber: {
                    type: 'string',
                    description: 'Recipient phone number (with or without country code)',
                    example: '244929782402'
                  },
                  message: {
                    type: 'string',
                    description: 'Message text to send',
                    example: 'Hello from ZapNode!'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Message sent successfully',
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
                      example: 'Message sent successfully'
                    },
                    sessionId: {
                      type: 'string',
                      description: 'Session ID used',
                      example: 'default'
                    },
                    to: {
                      type: 'string',
                      description: 'Recipient phone number',
                      example: '244929782402'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid request - phoneNumber and message are required',
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
                      example: 'phoneNumber and message are required'
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
    '/sessions/{sessionId}/status': {
      get: {
        tags: ['Sessions'],
        summary: 'Check session status',
        description: 'Checks if a WhatsApp session is ready to send and receive messages',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            description: 'Session ID to check',
            schema: {
              type: 'string',
              example: 'default'
            }
          }
        ],
        responses: {
          200: {
            description: 'Session status retrieved successfully',
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
                      description: 'Session ID',
                      example: 'default'
                    },
                    isReady: {
                      type: 'boolean',
                      description: 'Whether the session is ready',
                      example: true
                    },
                    status: {
                      type: 'string',
                      enum: ['ready', 'not_ready'],
                      description: 'Human-readable status',
                      example: 'ready'
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
    }
  }
};
