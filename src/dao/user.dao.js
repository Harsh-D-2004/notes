const { User } = require("../models");

async function findByEmail(email) {
  return await User.findOne({ where: { email }, raw: true });
}

async function findById(id) {
  return await User.findByPk(id, { raw: true });
}

async function create(email, passwordHash) {
  await User.create({ email, password_hash: passwordHash });
}

module.exports = { findByEmail, findById, create };