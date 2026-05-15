/**
 * OpenAPI 3.0 specification — served at GET /openapi.json
 */
const spec = {
  openapi: '3.0.0',
  info: {
    title: 'NoteVault API',
    version: '1.0.0',
    description:
      'Multi-user notes REST API. JWT authentication, MongoDB backend, smart note organisation (pin / colour / tag).',
    contact: { name: 'Vedant Deshpande', email: 'abc844023@gmail.com' },
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Local development' },
    { url: 'https://your-app.onrender.com', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Note: {
        type: 'object',
        properties: {
          id:          { type: 'string' },
          title:       { type: 'string' },
          content:     { type: 'string' },
          owner_id:    { type: 'string' },
          owner_email: { type: 'string' },
          owner_name:  { type: 'string', nullable: true },
          is_pinned:   { type: 'boolean' },
          color:       { type: 'string', enum: ['default','red','orange','yellow','green','blue','purple','pink'] },
          tag:         { type: 'string', nullable: true },
          is_shared:   { type: 'boolean' },
          created_at:  { type: 'string', format: 'date-time' },
          updated_at:  { type: 'string', format: 'date-time' },
        },
      },
      NoteInput: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title:     { type: 'string', maxLength: 255 },
          content:   { type: 'string', maxLength: 50000 },
          color:     { type: 'string', enum: ['default','red','orange','yellow','green','blue','purple','pink'] },
          tag:       { type: 'string', maxLength: 50, nullable: true },
          is_pinned: { type: 'boolean' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page:  { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          pages: { type: 'integer' },
        },
      },
    },
  },
  paths: {
    '/register': {
      post: {
        tags: ['Auth'], summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 }, name: { type: 'string' } } } } },
        },
        responses: { 201: { description: 'Registered' }, 400: { description: 'Validation error' }, 409: { description: 'Email taken' } },
      },
    },
    '/login': {
      post: {
        tags: ['Auth'], summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string' }, password: { type: 'string' } } } } },
        },
        responses: {
          200: { description: 'Login OK', content: { 'application/json': { schema: { type: 'object', properties: { access_token: { type: 'string' }, user: { type: 'object' } } } } } },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/notes': {
      get: {
        tags: ['Notes'], summary: 'Get all notes (owned + shared)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'q',     in: 'query', schema: { type: 'string' } },
          { name: 'tag',   in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Notes list', content: { 'application/json': { schema: { type: 'object', properties: { notes: { type: 'array', items: { $ref: '#/components/schemas/Note' } }, pagination: { $ref: '#/components/schemas/Pagination' } } } } } },
          401: { description: 'Unauthorised' },
        },
      },
      post: {
        tags: ['Notes'], summary: 'Create a note',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/NoteInput' } } } },
        responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } }, 401: { description: 'Unauthorised' } },
      },
    },
    '/notes/{id}': {
      get: {
        tags: ['Notes'], summary: 'Get note by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Note', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Notes'], summary: 'Update note (owner only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/NoteInput' } } } },
        responses: { 200: { description: 'Updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Notes'], summary: 'Delete note (owner only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/notes/{id}/share': {
      post: {
        tags: ['Notes'], summary: 'Share a note with another user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['share_with_email'], properties: { share_with_email: { type: 'string', format: 'email' } } } } } },
        responses: { 200: { description: 'Shared' }, 404: { description: 'Note or user not found' }, 409: { description: 'Already shared' } },
      },
    },
    '/search': {
      get: {
        tags: ['Notes'], summary: 'Full-text search across notes',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'q',     in: 'query', required: true, schema: { type: 'string' } },
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Results' }, 400: { description: 'q required' } },
      },
    },
    '/about':        { get: { tags: ['Meta'], summary: 'Developer info', responses: { 200: { description: 'OK' } } } },
    '/openapi.json': { get: { tags: ['Meta'], summary: 'This spec',      responses: { 200: { description: 'OK' } } } },
    '/health':       { get: { tags: ['Meta'], summary: 'Health check',   responses: { 200: { description: 'OK' } } } },
  },
};

export default spec;
