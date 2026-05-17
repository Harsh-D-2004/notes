const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  return sequelize.define(
    "NoteShare",
    {
      note_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      shared_with_user_id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
    },
    {
      tableName: "note_shares",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
};