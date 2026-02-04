import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Built-in validator
    trim: true, // Setter option
    unique: true,
  },
  description: {
    type: String,
    required: true,
    unique: true,   // Ensures unique values (creates a unique index)
    lowercase: true // Setter
  },
  deadline: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true }); // Option to automatically add createdAt and updatedAt fields

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;