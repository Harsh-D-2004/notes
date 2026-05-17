const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  return sequelize.define(
    "NotesGroup",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      note_ids: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: "notes_groups",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [{ fields: ["owner_id"] }],
    },
  );
};