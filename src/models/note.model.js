const { DataTypes } = require("sequelize");

module.exports = function (sequelize) {
  return sequelize.define(
    "Note",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "notes",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [{ fields: ["owner_id"] }],
    },
  );
};