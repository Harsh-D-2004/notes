function about(req, res) {
  return res.status(200).json({
    name: "Harsh Doshi",
    email: "doshiharsh2004@gmail.com",
    "my features": {
      "JWT Authentication":
        "Stateless HS256 JWT with email and password hash in payload. Tokens auto-invalidate when password changes.",
      Notes: "CRUD operations on notes.",
      "Note Sharing":
        "Share notes by email. Shared users get read-only access via GET /notes/:id.",
      Pagination:
        "GET /notes supports page-based pagination. Fixed 10 notes per page.",
      "Notes Groups(Custom feature)":
        "Owner can combine created and notes it has access to into custom groups for easy access.",
      Dockerize: "Whole server is dockerized and can be deployed easily",
      Search:
        "Search by keyword which can search accross notes content and notes title.",
    },
  });
}

module.exports = { about };
