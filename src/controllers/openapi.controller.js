function openapi(req, res) {
  const spec = {
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description:
        "Multi-user notes service with authentication, CRUD, and note sharing.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Note: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            content: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/register": {
        post: {
          summary: "Register a new user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/login": {
        post: {
          summary: "Login and receive a JWT token",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      access_token: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/notes": {
        get: {
          summary: "Get all notes accessible to the authenticated user (paginated)",
          tags: ["Notes"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              description: "Page number — 10 notes per page. Defaults to 1.",
              schema: { type: "integer", default: 1 },
            },
          ],
          responses: {
            "200": {
              description: "Paginated list of notes owned by or shared with the user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      notes: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Note" },
                      },
                      pagination: {
                        type: "object",
                        properties: {
                          page: { type: "integer" },
                          limit: { type: "integer" },
                          total: { type: "integer" },
                          totalPages: { type: "integer" },
                          hasNextPage: { type: "boolean" },
                          hasPrevPage: { type: "boolean" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create a new note",
          tags: ["Notes"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Note created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Note" },
                },
              },
            },
          },
        },
      },

      "/notes/search": {
        get: {
          summary: "Search notes by keyword — searches title and content",
          tags: ["Notes"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "q",
              in: "query",
              required: true,
              description: "Keyword to search for in note title or content (case-insensitive)",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "All matching notes accessible to the user (owned + shared)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      notes: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Note" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/notes/{id}": {
        get: {
          summary: "Get a note by ID — accessible by owner or shared user",
          tags: ["Notes"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "200": {
              description: "Note data",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Note" },
                },
              },
            },
          },
        },
        put: {
          summary: "Update a note — owner only",
          tags: ["Notes"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated note",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Note" },
                },
              },
            },
          },
        },
        delete: {
          summary: "Delete a note — owner only",
          tags: ["Notes"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          responses: {
            "204": { description: "Note deleted" },
          },
        },
      },

      "/notes/{id}/share": {
        post: {
          summary: "Share a note with another user — owner only",
          tags: ["Notes"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["share_with_email"],
                  properties: {
                    share_with_email: { type: "string", format: "email" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Note shared successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/groups": {
        get: {
          summary: "Get all groups for the authenticated user with their notes",
          tags: ["Groups"],
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "List of groups, each containing its full note objects",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      groups: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", format: "uuid" },
                            name: { type: "string" },
                            created_at: { type: "string", format: "date-time" },
                            notes: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Note" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create a new group with a name and list of note IDs",
          tags: ["Groups"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                    note_ids: {
                      type: "array",
                      items: { type: "string", format: "uuid" },
                      description: "IDs of notes to include — must be owned by or shared with the caller",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Group created with full note objects",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      created_at: { type: "string", format: "date-time" },
                      notes: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Note" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/groups/{id}": {
        put: {
          summary: "Update a group's name and note list — owner only",
          tags: ["Groups"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string", format: "uuid" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                    note_ids: {
                      type: "array",
                      items: { type: "string", format: "uuid" },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Updated group with full note objects",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      name: { type: "string" },
                      created_at: { type: "string", format: "date-time" },
                      notes: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Note" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/about": {
        get: {
          summary: "About this API",
          tags: ["Info"],
          responses: {
            "200": {
              description: "Developer info and feature descriptions",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string", format: "email" },
                      "my features": {
                        type: "object",
                        additionalProperties: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      "/openapi.json": {
        get: {
          summary: "OpenAPI 3.0 specification",
          tags: ["Info"],
          responses: {
            "200": { description: "Full API spec in OpenAPI 3.0 format" },
          },
        },
      },
    },
  };

  return res.status(200).json(spec);
}

module.exports = { openapi };
