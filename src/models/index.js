require("dotenv").config();
const { Sequelize } = require("sequelize");

const isProduction = process.env.ENV === "prod";
const dbUrl = isProduction
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_DEV;

if (!dbUrl) {
  console.error(
    "Missing DATABASE_URL_" + (isProduction ? "PROD" : "DEV") + " in .env",
  );
  process.exit(1);
}

const isLocalDB = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");

const sequelize = new Sequelize(dbUrl, {
  dialect: "postgres",
  logging: false,
  dialectOptions: isLocalDB ? {} : { ssl: { rejectUnauthorized: false } },
});

const User = require("./user.model")(sequelize);
const Note = require("./note.model")(sequelize);
const NoteShare = require("./note-share.model")(sequelize);
const NotesGroup = require("./notes-group.model")(sequelize);

User.hasMany(Note, { foreignKey: "owner_id", onDelete: "CASCADE" });
Note.belongsTo(User, { foreignKey: "owner_id" });

Note.hasMany(NoteShare, { foreignKey: "note_id", onDelete: "CASCADE" });
NoteShare.belongsTo(Note, { foreignKey: "note_id" });

User.hasMany(NoteShare, {
  foreignKey: "shared_with_user_id",
  onDelete: "CASCADE",
});
NoteShare.belongsTo(User, { foreignKey: "shared_with_user_id" });

User.hasMany(NotesGroup, { foreignKey: "owner_id", onDelete: "CASCADE" });
NotesGroup.belongsTo(User, { foreignKey: "owner_id" });

module.exports = { sequelize, User, Note, NoteShare, NotesGroup };
