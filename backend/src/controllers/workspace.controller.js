import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import Todo from "../models/todo.model.js";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const createUniqueCode = async () => {
  let code = generateCode();
  let exists = await Workspace.findOne({ code });
  while (exists) {
    code = generateCode();
    exists = await Workspace.findOne({ code });
  }
  return code;
};

export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    if (req.user.workspace) {
      return res.status(400).json({ message: "Already in a workspace" });
    }

    const code = await createUniqueCode();
    const workspace = await Workspace.create({
      name: name.trim(),
      code,
      createdBy: req.user._id,
    });

    req.user.workspace = workspace._id;
    req.user.role = "admin";
    await req.user.save();

    return res.status(201).json({
      success: true,
      data: {
        id: workspace._id,
        name: workspace.name,
        code: workspace.code,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create workspace" });
  }
};

export const joinWorkspace = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Invite code is required" });
    }

    if (req.user.workspace) {
      return res.status(400).json({ message: "Already in a workspace" });
    }

    const workspace = await Workspace.findOne({ code: code.toUpperCase().trim() });
    if (!workspace) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    req.user.workspace = workspace._id;
    req.user.role = "user";
    await req.user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: workspace._id,
        name: workspace.name,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to join workspace" });
  }
};

export const getWorkspace = async (req, res) => {
  try {
    if (!req.user.workspace) {
      return res.status(200).json({ data: null });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const members = await User.find({ workspace: workspace._id })
      .select("name email role")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: {
        id: workspace._id,
        name: workspace.name,
        code: workspace.code,
        createdBy: workspace.createdBy,
        members,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load workspace" });
  }
};

export const refreshInviteCode = async (req, res) => {
  try {
    if (!req.user.workspace) {
      return res.status(400).json({ message: "No workspace" });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const code = await createUniqueCode();
    workspace.code = code;
    await workspace.save();

    return res.json({
      success: true,
      data: {
        id: workspace._id,
        name: workspace.name,
        code: workspace.code,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to refresh invite code" });
  }
};

export const updateWorkspaceName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!req.user.workspace) {
      return res.status(400).json({ message: "No workspace" });
    }

    if (!name?.trim()) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    workspace.name = name.trim();
    await workspace.save();

    return res.json({
      success: true,
      data: {
        id: workspace._id,
        name: workspace.name,
        code: workspace.code,
        createdBy: workspace.createdBy,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update workspace name" });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    if (!req.user.workspace) {
      return res.status(400).json({ message: "No workspace" });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    await User.updateMany(
      { workspace: workspace._id },
      { $set: { workspace: null, role: "user" } }
    );

    await Todo.updateMany(
      { workspace: workspace._id },
      { $set: { workspace: null, visibility: "private", shared: false } }
    );

    await Workspace.findByIdAndDelete(workspace._id);

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete workspace" });
  }
};

export const leaveWorkspace = async (req, res) => {
  try {
    if (!req.user.workspace) {
      return res.status(400).json({ message: "No workspace" });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const membersCount = await User.countDocuments({ workspace: workspace._id });
    const isOriginalAdmin = workspace.createdBy?.toString() === req.user._id.toString();

    if (isOriginalAdmin && membersCount > 1) {
      return res.status(403).json({ message: "Transfer admin before leaving" });
    }

    if (membersCount <= 1) {
      await User.updateMany(
        { workspace: workspace._id },
        { $set: { workspace: null, role: "user" } }
      );

      await Todo.updateMany(
        { workspace: workspace._id },
        { $set: { workspace: null, visibility: "private", shared: false } }
      );

      await Workspace.findByIdAndDelete(workspace._id);
    } else {
      await User.findByIdAndUpdate(req.user._id, { workspace: null, role: "user" });
    }

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: "Failed to leave workspace" });
  }
};

export const transferWorkspaceOwner = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.user.workspace) {
      return res.status(400).json({ message: "No workspace" });
    }

    const workspace = await Workspace.findById(req.user.workspace);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.createdBy?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the original admin can transfer ownership" });
    }

    if (!userId) {
      return res.status(400).json({ message: "Target user is required" });
    }

    const target = await User.findById(userId);
    if (!target || target.workspace?.toString() !== workspace._id.toString()) {
      return res.status(404).json({ message: "User not found in workspace" });
    }

    workspace.createdBy = target._id;
    await workspace.save();
    if (target.role !== "admin") {
      await User.findByIdAndUpdate(target._id, { role: "admin" });
    }

    return res.json({
      success: true,
      data: {
        id: workspace._id,
        createdBy: workspace.createdBy,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to transfer ownership" });
  }
};
