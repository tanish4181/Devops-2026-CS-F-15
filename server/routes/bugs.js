import express from "express";
import { requireUser } from "../middleware/auth.js";
import {
  getBugs,
  createBug,
  updateBug,
  deleteBug,
  getPublicForm,
  submitFeedback,
} from "../controllers/bugController.js";

const router = express.Router();

router.get("/", requireUser, getBugs);
router.post("/", requireUser, createBug);
router.put("/:formId", requireUser, updateBug);
router.delete("/:formId", requireUser, deleteBug);

router.get("/public/:formId", getPublicForm);
router.post("/public/:formId/submit", submitFeedback);

export default router;
