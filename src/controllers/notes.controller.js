const notesDAO = require("../dao/notes.dao");
const userDAO = require("../dao/user.dao");

const PAGE_LIMIT = 10;

function formatNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getAll(req, res) {
  const pageNum = parseInt(req.query.page) || 1;

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ message: "Page must be a positive integer" });
  }

  try {
    const offset = (pageNum - 1) * PAGE_LIMIT;

    const [notes, total] = await Promise.all([
      notesDAO.findByOwner(req.user.id, PAGE_LIMIT, offset),
      notesDAO.countByOwner(req.user.id),
    ]);

    const totalPages = Math.ceil(total / PAGE_LIMIT) || 0;

    return res.status(200).json({
      notes: notes.map(formatNote),
      pagination: {
        page: pageNum,
        limit: PAGE_LIMIT,
        total: total,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error("Get all notes error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function getOne(req, res) {
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    const note = await notesDAO.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // If the caller is not the owner, check if the note was shared with them
    if (note.owner_id !== userId) {
      const hasSharedAccess = await notesDAO.findShare(noteId, userId);
      if (!hasSharedAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    return res.status(200).json(formatNote(note));
  } catch (err) {
    console.error("Get note error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function create(req, res) {
  const title = req.body.title;
  const content = req.body.content;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  if (!title.trim() || !content.trim()) {
    return res
      .status(400)
      .json({ message: "Title and content cannot be empty" });
  }

  try {
    const note = await notesDAO.create(
      title.trim(),
      content.trim(),
      req.user.id,
    );
    return res.status(201).json(formatNote(note));
  } catch (err) {
    console.error("Create note error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// PUT /notes/:id
async function update(req, res) {
  const title = req.body.title;
  const content = req.body.content;

  if (!title || !content || !title.trim() || !content.trim()) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    // The DAO query includes "AND owner_id = ?" so shared users naturally get null back
    const note = await notesDAO.update(
      req.params.id,
      req.user.id,
      title.trim(),
      content.trim(),
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(200).json(formatNote(note));
  } catch (err) {
    console.error("Update note error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// DELETE /notes/:id
async function remove(req, res) {
  try {
    // The DAO query includes "AND owner_id = ?" so only the owner can delete
    const deletedCount = await notesDAO.delete(req.params.id, req.user.id);

    if (!deletedCount) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Delete note error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

// POST /notes/:id/share
async function share(req, res) {
  const shareWithEmail = req.body.share_with_email;

  if (!shareWithEmail) {
    return res.status(400).json({ message: "share_with_email is required" });
  }

  try {
    // Only the owner can share — this also confirms the note exists
    const note = await notesDAO.findByIdAndOwner(req.params.id, req.user.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Find the user we want to share with
    const targetUser = await userDAO.findByEmail(shareWithEmail);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // A user cannot share a note with themselves
    if (targetUser.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "Cannot share a note with yourself" });
    }

    // Insert the share record — safe to call multiple times (idempotent)
    await notesDAO.createShare(note.id, targetUser.id);

    return res.status(200).json({
      message: "Note shared with " + shareWithEmail + " successfully",
    });
  } catch (err) {
    console.error("Share note error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function search(req, res) {
  const q = req.query.q;

  if (!q || !q.trim()) {
    return res.status(400).json({ message: "q is required" });
  }

  try {
    const notes = await notesDAO.search(req.user.id, q.trim());
    return res.status(200).json({ notes: notes.map(formatNote) });
  } catch (err) {
    console.error("Search notes error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { getAll, getOne, create, update, remove, share, search };
