const groupsDAO = require("../dao/groups.dao");
const notesDAO = require("../dao/notes.dao");

function formatNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function formatGroup(group, notes) {
  return {
    id: group.id,
    name: group.name,
    created_at: group.created_at,
    notes: notes.map(formatNote),
  };
}

async function validateNoteAccess(noteIds, userId) {
  for (const noteId of noteIds) {
    const note = await notesDAO.findById(noteId);
    if (!note)
      return { valid: false, message: "Note " + noteId + " not found" };

    const isOwner = note.owner_id === userId;
    const isShared = isOwner ? true : await notesDAO.findShare(noteId, userId);
    if (!isShared) {
      return { valid: false, message: "Access denied for note " + noteId };
    }
  }
  return { valid: true };
}

async function create(req, res) {
  const name = req.body.name;
  const noteIds = req.body.note_ids || [];

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "name is required" });
  }

  if (!Array.isArray(noteIds)) {
    return res.status(400).json({ message: "note_ids must be an array" });
  }

  try {
    const check = await validateNoteAccess(noteIds, req.user.id);
    if (!check.valid) {
      return res.status(404).json({ message: check.message });
    }

    const group = await groupsDAO.create(name.trim(), req.user.id, noteIds);
    const notes = await groupsDAO.findNotesByIds(req.user.id, group.note_ids);

    return res.status(201).json(formatGroup(group, notes));
  } catch (err) {
    console.error("Create group error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function update(req, res) {
  const name = req.body.name;
  const noteIds = req.body.note_ids || [];

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "name is required" });
  }

  if (!Array.isArray(noteIds)) {
    return res.status(400).json({ message: "note_ids must be an array" });
  }

  try {
    const existing = await groupsDAO.findByIdAndOwner(
      req.params.id,
      req.user.id,
    );
    if (!existing) {
      return res.status(404).json({ message: "Group not found" });
    }

    const check = await validateNoteAccess(noteIds, req.user.id);
    if (!check.valid) {
      return res.status(404).json({ message: check.message });
    }

    const group = await groupsDAO.update(
      req.params.id,
      req.user.id,
      name.trim(),
      noteIds,
    );
    const notes = await groupsDAO.findNotesByIds(req.user.id, group.note_ids);

    return res.status(200).json(formatGroup(group, notes));
  } catch (err) {
    console.error("Update group error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// GET /groups
async function getAll(req, res) {
  try {
    const groups = await groupsDAO.findByOwner(req.user.id);

    const result = await Promise.all(
      groups.map(async function (group) {
        const notes = await groupsDAO.findNotesByIds(
          req.user.id,
          group.note_ids,
        );
        return formatGroup(group, notes);
      }),
    );

    return res.status(200).json({ groups: result });
  } catch (err) {
    console.error("Get groups error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { create, update, getAll };
