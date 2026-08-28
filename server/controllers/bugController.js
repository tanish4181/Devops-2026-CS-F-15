import FeedbackForm from "../models/FeedbackForm.js";
import Submission from "../models/Submission.js";

export async function getBugs(req, res) {
  try {
    const { status, severity, priority, bugType, search } = req.query;
    const filter = { userId: req.userId };

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;
    if (bugType) filter.bugType = bugType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { assignee: { $regex: search, $options: "i" } },
      ];
    }

    const bugs = await FeedbackForm.find(filter).sort({ updatedAt: -1 });
    res.json(bugs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createBug(req, res) {
  try {
    const {
      title,
      description,
      bugType,
      severity,
      priority,
      assignee,
      reporter,
      environment,
      tags,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const formId = `BUG-${Date.now()}`;

    const bug = await FeedbackForm.create({
      userId: req.userId,
      formId,
      title: title.trim(),
      description: description || "",
      bugType: bugType || "UI",
      severity: severity || "Medium",
      priority: priority || "P2",
      status: "Open",
      assignee: (assignee && assignee.trim()) || "Unassigned",
      reporter: reporter || "",
      environment: environment || "",
      tags: tags || [],
    });

    res.status(201).json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateBug(req, res) {
  try {
    const { formId } = req.params;
    const updates = req.body;

    const bug = await FeedbackForm.findOneAndUpdate(
      { formId, userId: req.userId },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );

    if (!bug) {
      return res.status(404).json({ error: "Bug not found" });
    }

    res.json(bug);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteBug(req, res) {
  try {
    const { formId } = req.params;
    const bug = await FeedbackForm.findOneAndDelete({
      formId,
      userId: req.userId,
    });

    if (!bug) {
      return res.status(404).json({ error: "Bug not found" });
    }

    await Submission.deleteMany({ formId: bug._id, userId: req.userId });

    res.json({ message: "Bug deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getPublicForm(req, res) {
  try {
    const { formId } = req.params;
    const form = await FeedbackForm.findOne({ formId, isPublic: true });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    res.json({
      formId: form.formId,
      title: form.title,
      description: form.description,
      bugType: form.bugType,
      severity: form.severity,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitFeedback(req, res) {
  try {
    const { formId } = req.params;
    const { bugDescription, stepsToReproduce, environment, reporterEmail } =
      req.body;

    if (!bugDescription || !bugDescription.trim()) {
      return res
        .status(400)
        .json({ error: "Bug description is required" });
    }

    const form = await FeedbackForm.findOne({ formId });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    const submission = await Submission.create({
      userId: form.userId,
      formId: form._id,
      formTitle: form.title,
      bugDescription: bugDescription.trim(),
      stepsToReproduce: stepsToReproduce || "",
      environment: environment || "",
      reporterEmail: reporterEmail || "",
      status: "New",
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      id: submission._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
