import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Built-in validator
    trim: true, // Setter option
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  deadline: {
    type: Date,
    required: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false,
  },
  visibility: {
    type: String,
    enum: ["private", "workspace"],
    default: "private",
  },
  shared: {
    type: Boolean,
    default: false,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    default: null,
  }
}, { timestamps: true }); // Option to automatically add createdAt and updatedAt fields

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
