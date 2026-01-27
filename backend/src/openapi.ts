/**
 * OpenAPI 3.0 specification for Clawban API
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Clawban API',
    version: '1.0.0',
    description: 'Task management API for AI agents and humans',
    contact: {
      name: 'GitHub',
      url: 'https://github.com/jbmatlick/clawban',
    },
  },
  servers: [
    {
      url: 'https://clawban-production.up.railway.app',
      description: 'Production',
    },
    {
      url: 'http://localhost:3001',
      description: 'Local development',
    },
  ],
  tags: [
    {
      name: 'Tasks',
      description: 'Task management operations',
    },
    {
      name: 'Tags',
      description: 'Tag operations',
    },
    {
      name: 'Gateway',
      description: 'Clawdbot gateway integration',
    },
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Basic health check endpoint (no auth required)',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List all tasks',
        description: 'Get all tasks with optional filters',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter by status',
            schema: {
              type: 'string',
              enum: ['new', 'approved', 'in-progress', 'complete'],
            },
          },
          {
            name: 'assignee',
            in: 'query',
            description: 'Filter by assignee (use "null" for unassigned)',
            schema: {
              type: 'string',
            },
          },
          {
            name: 'tag',
            in: 'query',
            description: 'Filter by tag name',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'List of tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        tasks: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Task' },
                        },
                        total: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create a new task',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTaskRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by ID',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Task details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update a task',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTaskRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Task updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete a task',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Task deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'null' },
                  },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/tasks/{id}/move': {
      post: {
        tags: ['Tasks'],
        summary: 'Move task to different column',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['new', 'approved', 'in-progress', 'complete'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Task moved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/api/tags': {
      get: {
        tags: ['Tags'],
        summary: 'List all tags',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        responses: {
          200: {
            description: 'List of tags',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Tag' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/gateway/health': {
      get: {
        tags: ['Gateway'],
        summary: 'Check Clawdbot gateway health',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        responses: {
          200: {
            description: 'Gateway health status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    healthy: { type: 'boolean' },
                    timestamp: { type: 'string', format: 'date-time' },
                    gateway: { type: 'string' },
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/gateway/restart': {
      post: {
        tags: ['Gateway'],
        summary: 'Restart Clawdbot gateway',
        security: [{ BearerAuth: [] }, { ApiKeyAuth: [] }],
        responses: {
          200: {
            description: 'Gateway restart initiated',
          },
          500: {
            description: 'Restart failed',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supabase JWT token (for human users)',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key for AI agents',
      },
    },
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          description: { type: 'string' },
          model_strategy: {
            type: 'string',
            enum: ['opus-planning', 'opus-coding', 'sonnet-coding', 'mixed'],
          },
          estimated_token_cost: { type: 'number' },
          estimated_dollar_cost: { type: 'number' },
          status: {
            type: 'string',
            enum: ['new', 'approved', 'in-progress', 'complete'],
          },
          assignee: { type: 'string', nullable: true },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          completed_at: { type: 'string', format: 'date-time', nullable: true },
          llm_usage: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                model: { type: 'string' },
                tokens_in: { type: 'number' },
                tokens_out: { type: 'number' },
                cost: { type: 'number' },
                timestamp: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      CreateTaskRequest: {
        type: 'object',
        required: ['title', 'model_strategy', 'estimated_token_cost', 'estimated_dollar_cost'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string' },
          model_strategy: {
            type: 'string',
            enum: ['opus-planning', 'opus-coding', 'sonnet-coding', 'mixed'],
          },
          estimated_token_cost: { type: 'number', minimum: 0 },
          estimated_dollar_cost: { type: 'number', minimum: 0 },
          assignee: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      UpdateTaskRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200 },
          description: { type: 'string' },
          model_strategy: {
            type: 'string',
            enum: ['opus-planning', 'opus-coding', 'sonnet-coding', 'mixed'],
          },
          estimated_token_cost: { type: 'number', minimum: 0 },
          estimated_dollar_cost: { type: 'number', minimum: 0 },
          status: {
            type: 'string',
            enum: ['new', 'approved', 'in-progress', 'complete'],
          },
          assignee: { type: 'string', nullable: true },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          color: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          task_count: { type: 'number' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Invalid or expired token' },
              },
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Validation failed' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'Task not found' },
              },
            },
          },
        },
      },
    },
  },
};
