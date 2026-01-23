import express from "express";
import {getTodos, createTodo, deleteTodo, updateTodo } from "../controllers/todo.controller.js";

const router = express.Router();

router.get("/todo", getTodos);
router.post("/todo", createTodo);
router.delete("/todo/:id", deleteTodo);
router.put("/todo/:id", updateTodo);

export default router