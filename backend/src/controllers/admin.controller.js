import User from "../models/user.model.js";
import Todo from "../models/todo.model.js";
import Workspace from "../models/workspace.model.js";
import MemberNote from "../models/memberNote.model.js";

export const getUsersWithTodos = async (req, res) => {
  try {
    if (!req.user.workspace) {
      return res.json({ success: true, data: [] });
    }

    const userSortField = ["name", "role", "createdAt"].includes(req.query.userSort)
      ? req.query.userSort
      : "createdAt";
    const userSortOrder = req.query.userOrder === "asc" ? 1 : -1;

    const todoSortField = ["createdAt", "deadline", "completed"].includes(req.query.todoSort)
      ? req.query.todoSort
      : "createdAt";
    const todoSortOrder = req.query.todoOrder === "asc" ? 1 : -1;

    const users = await User.find({ workspace: req.user.workspace })
      .select("-password")
      .sort({ [userSortField]: userSortOrder });

    const notes = await MemberNote.find({ workspace: req.user.workspace })
      .populate("authorUser", "name email role")
      .lean();

    const notesByTarget = new Map();
    for (const note of notes) {
      const key = note.targetUser.toString();
      if (!notesByTarget.has(key)) {
        notesByTarget.set(key, []);
      }
      notesByTarget.get(key).push(note);
    }

    const usersWithTodos = await Promise.all(
      users.map(async (user) => {
        const todos = await Todo.find({
          user: user._id,
          archived: { $ne: true },
          $or: [
            { visibility: "workspace" },
            { visibility: { $exists: false }, shared: true },
          ],
        }).sort({ [todoSortField]: todoSortOrder });
        return {
          ...user.toObject(),
          todos,
          notes: notesByTarget.get(user._id.toString()) || [],
        };
      })
    );

    res.json({
      success: true,
      data: usersWithTodos,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin data",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const allowed = ["user", "manager", "admin"];

    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.user.workspace || target.workspace?.toString() !== req.user.workspace.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.createdBy?.toString() === target._id.toString() && role !== "admin") {
      return res.status(403).json({ message: "Original admin cannot be demoted" });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!req.user.workspace || target.workspace?.toString() !== req.user.workspace.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.createdBy?.toString() === target._id.toString()) {
      return res.status(403).json({ message: "Original admin cannot be removed" });
    }

    if (req.user.role === "manager" && target.role === "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await User.findByIdAndUpdate(id, { workspace: null, role: "user" });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Failed to remove member" });
  }
};

export const upsertMemberNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!req.user.workspace) {
      return res.status(400).json({ message: "No workspace" });
    }

    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot add note to self" });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target.workspace?.toString() !== req.user.workspace.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const note = await MemberNote.findOneAndUpdate(
      {
        workspace: req.user.workspace,
        targetUser: target._id,
        authorUser: req.user._id,
      },
      { text: text.trim() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("authorUser", "name email role");

    return res.json({ success: true, data: note });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save note" });
  }
};
