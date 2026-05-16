const { pool } = require("../db");

async function findById(id) {
  const result = await pool.query("SELECT * FROM notes WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function findByOwner(userId, limit, offset) {
  const result = await pool.query(
    `SELECT * FROM (
       SELECT * FROM notes WHERE owner_id = $1
       UNION
       SELECT n.* FROM notes n
       INNER JOIN note_shares ns ON n.id = ns.note_id
       WHERE ns.shared_with_user_id = $1
     ) AS accessible
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return result.rows;
}

async function countByOwner(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS total FROM (
       SELECT id FROM notes WHERE owner_id = $1
       UNION
       SELECT n.id FROM notes n
       INNER JOIN note_shares ns ON n.id = ns.note_id
       WHERE ns.shared_with_user_id = $1
     ) AS accessible`,
    [userId],
  );
  return result.rows[0].total;
}

// Fetch a note only if the caller is the owner
// Used before write operations (PUT, DELETE, share) to confirm ownership
async function findByIdAndOwner(id, ownerId) {
  const result = await pool.query(
    "SELECT * FROM notes WHERE id = $1 AND owner_id = $2",
    [id, ownerId],
  );
  return result.rows[0] || null;
}

// Insert a new note and return the created row
async function create(title, content, ownerId) {
  const result = await pool.query(
    "INSERT INTO notes (title, content, owner_id) VALUES ($1, $2, $3) RETURNING *",
    [title, content, ownerId],
  );
  return result.rows[0];
}

async function update(id, ownerId, title, content) {
  const result = await pool.query(
    `UPDATE notes
     SET title = $1, content = $2, updated_at = NOW()
     WHERE id = $3 AND owner_id = $4
     RETURNING *`,
    [title, content, id, ownerId],
  );
  return result.rows[0] || null;
}

async function deleteNote(id, ownerId) {
  const result = await pool.query(
    "DELETE FROM notes WHERE id = $1 AND owner_id = $2",
    [id, ownerId],
  );
  return result.rowCount;
}

async function search(userId, keyword) {
  const pattern = `%${keyword}%`;
  const result = await pool.query(
    `SELECT * FROM (
       SELECT * FROM notes WHERE owner_id = $1
       UNION
       SELECT n.* FROM notes n
       INNER JOIN note_shares ns ON n.id = ns.note_id
       WHERE ns.shared_with_user_id = $1
     ) AS accessible
     WHERE title ILIKE $2 OR content ILIKE $2
     ORDER BY created_at DESC`,
    [userId, pattern],
  );
  return result.rows;
}

async function findShare(noteId, userId) {
  const result = await pool.query(
    "SELECT 1 FROM note_shares WHERE note_id = $1 AND shared_with_user_id = $2",
    [noteId, userId],
  );
  return result.rows.length > 0;
}

async function createShare(noteId, userId) {
  await pool.query(
    `INSERT INTO note_shares (note_id, shared_with_user_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [noteId, userId],
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
