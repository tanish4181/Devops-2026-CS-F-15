import express from "express";
import { requireUser } from "../middleware/auth.js";
import {
  getSubmissions,
  updateSubmission,
} from "../controllers/submissionController.js";

const router = express.Router();

router.get("/", requireUser, getSubmissions);
router.put("/:id", requireUser, updateSubmission);

export default router;
