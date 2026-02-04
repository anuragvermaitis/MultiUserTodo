import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todo.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { authorize, protect } from "./middlewares/auth.middleware.js";
import cookieParser from "cookie-parser";
import { getAdminTodos } from "./controllers/admin.controller.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/todos", protect, todoRoutes);
app.get("/api/v1/admin/users", protect, authorize("admin"), getAdminTodos);

export default app;