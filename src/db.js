const { sequelize } = require("./models");

async function initDB() {
  await sequelize.authenticate();
  await sequelize.sync();
  const isProduction = process.env.ENV === "prod";
  console.log("Database ready [" + (isProduction ? "prod" : "dev") + "]");
}

module.exports = { sequelize, initDB };
