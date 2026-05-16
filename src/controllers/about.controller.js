function about(req, res) {
  return res.status(200).json({
    name:  'Harsh',
    email: 'harsh@outoftheblue.ai',
    'my features': {
      'JWT Authentication':    'Stateless HS256 JWT with email and password hash in payload. Tokens auto-invalidate when password changes.',
      'Note Sharing':          'Share notes by email. Shared users get read-only access via GET /notes/:id.',
      'ENV-based DB switching':'Single codebase targets local or Render DB by reading the ENV variable.',
      'Layered Architecture':  'Routes → Controllers (business logic) → DAO (SQL only) → DB. Each layer has one clear job.',
      'Pagination':            'GET /notes supports page-based pagination. Fixed 10 notes per page.'
    }
  });
}

module.exports = { about };
