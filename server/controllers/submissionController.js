import Submission from "../models/Submission.js";
import { sendStatusChangeEmail } from "../services/emailService.js";

export async function getSubmissions(req, res) {
  try {
    const { status } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .populate("formId", "formId title")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSubmission(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["New", "Reviewed", "Accepted", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const originalSubmission = await Submission.findOne({ _id: id, userId: req.userId });
    if (!originalSubmission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const previousStatus = originalSubmission.status;

    const submission = await Submission.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { status },
      { new: true }
    );

    if (status !== previousStatus) {
      sendStatusChangeEmail({
        userId: req.userId,
        title: submission.formTitle || "Feedback Submission",
        previousStatus,
        newStatus: submission.status,
        date: new Date().toLocaleString(),
      }).catch(err => console.error("Async submission status change email dispatch failed:", err));
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

