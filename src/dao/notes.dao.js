const { QueryTypes } = require("sequelize");
const { sequelize, Note, NoteShare } = require("../models");

async function findById(id) {
  return await Note.findByPk(id, { raw: true });
}

async function findByOwner(userId, limit, offset) {
  return await sequelize.query(
    `SELECT * FROM (
       SELECT * FROM notes WHERE owner_id = $1
       UNION
       SELECT n.* FROM notes n
       INNER JOIN note_shares ns ON n.id = ns.note_id
       WHERE ns.shared_with_user_id = $1
     ) AS accessible
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    { bind: [userId, limit, offset], type: QueryTypes.SELECT },
  );
}

async function countByOwner(userId) {
  const rows = await sequelize.query(
    `SELECT COUNT(*)::int AS total FROM (
       SELECT id FROM notes WHERE owner_id = $1
       UNION
       SELECT n.id FROM notes n
       INNER JOIN note_shares ns ON n.id = ns.note_id
       WHERE ns.shared_with_user_id = $1
     ) AS accessible`,
    { bind: [userId], type: QueryTypes.SELECT },
  );
  return rows[0].total;
}

async function findByIdAndOwner(id, ownerId) {
  return await Note.findOne({ where: { id, owner_id: ownerId }, raw: true });
}

async function create(title, content, ownerId) {
  const note = await Note.create({ title, content, owner_id: ownerId });
  return note.get({ plain: true });
}

async function update(id, ownerId, title, content) {
  const [count] = await Note.update(
    { title, content },
    { where: { id, owner_id: ownerId } },
  );
  if (count === 0) return null;
  return await Note.findByPk(id, { raw: true });
}

async function deleteNote(id, ownerId) {
  return await Note.destroy({ where: { id, owner_id: ownerId } });
}

async function findShare(noteId, userId) {
  const share = await NoteShare.findOne({
    where: { note_id: noteId, shared_with_user_id: userId },
  });
  return share !== null;
}

async function createShare(noteId, userId) {
  await NoteShare.findOrCreate({
    where: { note_id: noteId, shared_with_user_id: userId },
  });
}

async function search(userId, keyword) {
  const pattern = `%${keyword}%`;
  return await sequelize.query(
    `SELECT * FROM (
       SELECT * FROM notes WHERE owner_id = $1
       UNION
       SELECT n.* FROM notes n
       INNER JOIN note_shares ns ON n.id = ns.note_id
       WHERE ns.shared_with_user_id = $1
     ) AS accessible
     WHERE title ILIKE $2 OR content ILIKE $2
     ORDER BY created_at DESC`,
    { bind: [userId, pattern], type: QueryTypes.SELECT },
  );
}

module.exports = {
  findById,
  findByOwner,
  countByOwner,
  findByIdAndOwner,
  search,
  create,
  update,
  delete: deleteNote,
  findShare,
  createShare,
};