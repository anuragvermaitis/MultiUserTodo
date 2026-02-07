import express from "express";
import { signup, login, getMe } from "../controllers/auth.controller.js";
import { optionalProtect } from "../middlewares/firebase.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", optionalProtect, getMe);

export default router;
