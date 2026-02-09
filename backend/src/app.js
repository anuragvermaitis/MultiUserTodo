import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import { authorize, protect } from "./middlewares/firebase.middleware.js";
import cookieParser from "cookie-parser";
import { getUsersWithTodos, removeMember, updateUserRole, upsertMemberNote } from "./controllers/admin.controller.js";
import mongoose from "mongoose";

const app = express();

const corsOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
const corsOptions = {
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get(["/health", "/api/v1/health"], (req, res) => {
  const readyState = mongoose.connection.readyState;
  const isDbReady = readyState === 1;
  const status = isDbReady ? 200 : 503;
  res.status(status).json({
    ok: isDbReady,
    db: isDbReady ? "connected" : "not_ready",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/todos", protect, todoRoutes);
app.get("/api/v1/admin/users", protect, authorize("admin", "manager"), getUsersWithTodos);
app.patch("/api/v1/admin/users/:id/role", protect, authorize("admin"), updateUserRole);
app.delete("/api/v1/admin/users/:id", protect, authorize("admin", "manager"), removeMember);
app.post("/api/v1/team/users/:id/note", protect, authorize("admin", "manager"), upsertMemberNote);
app.get("/api/v1/team/users", protect, getUsersWithTodos);

export default app;
