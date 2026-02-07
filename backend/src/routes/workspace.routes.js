import express from "express";
import { authorize, protect } from "../middlewares/firebase.middleware.js";
import { createWorkspace, deleteWorkspace, getWorkspace, joinWorkspace, leaveWorkspace, refreshInviteCode, transferWorkspaceOwner, updateWorkspaceName } from "../controllers/workspace.controller.js";

const router = express.Router();

router.post("/", protect, createWorkspace);
router.get("/me", protect, getWorkspace);
router.post("/join", protect, joinWorkspace);
router.post("/invite", protect, authorize("admin", "manager"), refreshInviteCode);
router.delete("/", protect, authorize("admin"), deleteWorkspace);
router.post("/leave", protect, leaveWorkspace);
router.post("/transfer", protect, authorize("admin"), transferWorkspaceOwner);
router.patch("/", protect, authorize("admin"), updateWorkspaceName);

export default router;
