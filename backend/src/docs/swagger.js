import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Artisan Marketplace API',
      version: '1.0.0',
      description: 'REST API for artisan marketplace (Phase 2)'
    },
    servers: [{ url: '/api/v1' }],
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            details: { type: 'object', nullable: true }
          }
        },
        AuthPayload: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string', enum: ['admin', 'artisan', 'user'] }
              }
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            artisanId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Healthcheck API',
          responses: {
            200: {
              description: 'API healthy'
            }
          }
        }
      },
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    role: { type: 'string', enum: ['artisan', 'user'] }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'User registered' },
            409: { description: 'Email already in use' }
          }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Authenticated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/AuthPayload' }
                    }
                  }
                }
              }
            },
            401: { description: 'Invalid credentials' }
          }
        }
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Current user profile' },
            401: { description: 'Unauthorized' }
          }
        }
      },
      '/artisans': {
        get: {
          tags: ['Artisans'],
          summary: 'List artisans',
          responses: { 200: { description: 'Artisan list' } }
        }
      },
      '/artisan/{id}': {
        get: {
          tags: ['Artisans'],
          summary: 'Get artisan details',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Artisan details' },
            404: { description: 'Artisan not found' }
          }
        }
      },
      '/artisan/profile': {
        post: {
          tags: ['Artisans'],
          summary: 'Create artisan profile',
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Profile created' },
            403: { description: 'Forbidden' }
          }
        },
        put: {
          tags: ['Artisans'],
          summary: 'Update artisan profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Profile updated' },
            404: { description: 'Profile not found' }
          }
        }
      },
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List products',
          responses: { 200: { description: 'Paginated product list' } }
        },
        post: {
          tags: ['Products'],
          summary: 'Create product (artisan)',
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Product created' },
            403: { description: 'Forbidden' }
          }
        }
      },
      '/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by id',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: {
              description: 'Product details',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            },
            404: { description: 'Product not found' }
          }
        },
        put: {
          tags: ['Products'],
          summary: 'Update product (owner/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Product updated' },
            403: { description: 'Forbidden' }
          }
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product (owner/admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Product deleted' },
            403: { description: 'Forbidden' }
          }
        }
      },
      '/ratings': {
        post: {
          tags: ['Ratings'],
          summary: 'Create rating for artisan',
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: 'Rating created' },
            409: { description: 'Duplicate rating' }
          }
        }
      },
      '/artisan/{id}/ratings': {
        get: {
          tags: ['Ratings'],
          summary: 'List ratings for artisan',
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: { 200: { description: 'Ratings list' } }
        }
      },
      '/admin/artisans': {
        get: {
          tags: ['Admin'],
          summary: 'Admin list artisans',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'query',
              name: 'page',
              required: false,
              schema: { type: 'integer', minimum: 1, default: 1 }
            },
            {
              in: 'query',
              name: 'limit',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
            },
            {
              in: 'query',
              name: 'search',
              required: false,
              schema: { type: 'string' },
              description: 'Search artisan by name or email'
            }
          ],
          responses: {
            200: { description: 'Artisan moderation list' },
            403: { description: 'Forbidden' }
          }
        }
      },
      '/admin/artisan/{id}': {
        delete: {
          tags: ['Admin'],
          summary: 'Admin delete artisan and related resources',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Artisan deleted' },
            404: { description: 'Artisan not found' }
          }
        }
      },
      '/admin/product/{id}': {
        delete: {
          tags: ['Admin'],
          summary: 'Admin delete product',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'id',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            200: { description: 'Product deleted' },
            404: { description: 'Product not found' }
          }
        }
      }
    }
  },
  apis: []
});

export function mountSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
