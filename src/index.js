require("dotenv").config();
const express = require("express");
const { initDB } = require("./db");

const authRoutes = require("./routes/auth.routes");
const notesRoutes = require("./routes/notes.routes");
const groupsRoutes = require("./routes/groups.routes");
const aboutRoutes = require("./routes/about.routes");
const openapiRoutes = require("./routes/openapi.routes");

const app = express();

app.use(express.json());

app.use(authRoutes);
app.use("/notes", notesRoutes);
app.use("/groups", groupsRoutes);
app.use(aboutRoutes);
app.use(openapiRoutes);

const PORT = process.env.PORT || 8000;

initDB()
  .then(function () {
    app.listen(PORT, function () {
      console.log(
        "Server running on port " + PORT + " [" + process.env.ENV + "]",
      );
    });
  })
  .catch(function (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
