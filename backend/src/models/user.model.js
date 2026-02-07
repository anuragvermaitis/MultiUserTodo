import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,   
    lowercase: true,
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ["user", "manager", "admin"],
    default: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    default: null,
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
