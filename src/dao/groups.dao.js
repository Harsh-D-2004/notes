const { QueryTypes } = require("sequelize");
const { sequelize, NotesGroup } = require("../models");

async function create(name, ownerId, noteIds) {
  const group = await NotesGroup.create({
    name,
    owner_id: ownerId,
    note_ids: noteIds,
  });
  return group.get({ plain: true });
}

async function findByOwner(ownerId) {
  return await NotesGroup.findAll({
    where: { owner_id: ownerId },
    order: [["created_at", "DESC"]],
    raw: true,
  });
}

async function findByIdAndOwner(id, ownerId) {
  return await NotesGroup.findOne({
    where: { id, owner_id: ownerId },
    raw: true,
  });
}

async function update(id, ownerId, name, noteIds) {
  const [count] = await NotesGroup.update(
    { name, note_ids: noteIds },
    { where: { id, owner_id: ownerId } },
  );
  if (count === 0) return null;
  return await NotesGroup.findByPk(id, { raw: true });
}

async function findNotesByIds(userId, noteIds) {
  if (noteIds.length === 0) return [];
  return await sequelize.query(
    `SELECT * FROM (
       SELECT * FROM notes WHERE owner_id = $1
       UNION
       SELECT n.* FROM notes n
       INNER JOIN note_shares ns ON n.id = ns.note_id
       WHERE ns.shared_with_user_id = $1
     ) AS accessible
     WHERE id = ANY($2)
     ORDER BY created_at DESC`,
    { bind: [userId, noteIds], type: QueryTypes.SELECT },
  );
}

module.exports = {
  create,
  findByOwner,
  findByIdAndOwner,
  update,
  findNotesByIds,
};
