import express from "express";
import { requireUser } from "../middleware/auth.js";
import { getSettings, updateSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/", requireUser, getSettings);
router.put("/", requireUser, updateSettings);

export default router;
