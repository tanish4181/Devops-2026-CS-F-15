import FeedbackForm from "../models/FeedbackForm.js";
import Submission from "../models/Submission.js";

export async function getStats(req, res) {
  try {
    const userId = req.userId;

    const [
      totalBugs,
      bugsByStatus,
      bugsBySeverity,
      bugsByType,
      bugsByPriority,
      totalSubmissions,
      submissionsByStatus,
    ] = await Promise.all([
      FeedbackForm.countDocuments({ userId }),
      FeedbackForm.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      FeedbackForm.aggregate([
        { $match: { userId } },
        { $group: { _id: "$severity", count: { $sum: 1 } } },
      ]),
      FeedbackForm.aggregate([
        { $match: { userId } },
        { $group: { _id: "$bugType", count: { $sum: 1 } } },
      ]),
      FeedbackForm.aggregate([
        { $match: { userId } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Submission.countDocuments({ userId }),
      Submission.aggregate([
        { $match: { userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const openBugs = bugsByStatus.find((s) => s._id === "Open")?.count || 0;
    const inProgressBugs =
      bugsByStatus.find((s) => s._id === "In Progress")?.count || 0;
    const criticalBugs =
      bugsBySeverity.find((s) => s._id === "Critical")?.count || 0;

    const acceptanceRate =
      totalSubmissions > 0
        ? Math.round(
            ((submissionsByStatus.find((s) => s._id === "Accepted")?.count ||
              0) /
              totalSubmissions) *
              100
          )
        : 0;

    res.json({
      overview: {
        totalBugs,
        openBugs,
        inProgressBugs,
        criticalBugs,
        totalSubmissions,
        acceptanceRate,
      },
      bugsByStatus: bugsByStatus.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {}
      ),
      bugsBySeverity: bugsBySeverity.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {}
      ),
      bugsByType: bugsByType.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {}
      ),
      bugsByPriority: bugsByPriority.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {}
      ),
      submissionsByStatus: submissionsByStatus.reduce(
        (acc, s) => ({ ...acc, [s._id]: s.count }),
        {}
      ),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
