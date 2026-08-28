import express from "express";
import { requireUser } from "../middleware/auth.js";
import { getStats } from "../controllers/statsController.js";

const router = express.Router();

router.get("/", requireUser, getStats);

export default router;
