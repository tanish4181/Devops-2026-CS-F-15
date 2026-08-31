import Settings from "../models/Settings.js";

export async function getSettings(req, res) {
  try {
    let settings = await Settings.findOne({ userId: req.userId });
    if (!settings) {
      // Return defaults if not saved yet
      settings = {
        userId: req.userId,
        newBugNotifications: false,
        statusChangeNotifications: false,
        notificationEmail: "",
        applicationName: "BugPilot",
        supportEmail: "support@bugpilot.com",
        theme: "System",
        primaryColor: "#7c3aed",
      };
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateSettings(req, res) {
  try {
    const {
      newBugNotifications,
      statusChangeNotifications,
      notificationEmail,
      applicationName,
      supportEmail,
      theme,
      primaryColor,
    } = req.body;

    // Validate email if present
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (notificationEmail && !emailRegex.test(notificationEmail)) {
      return res.status(400).json({ error: "Invalid notification email address" });
    }
    if (supportEmail && !emailRegex.test(supportEmail)) {
      return res.status(400).json({ error: "Invalid support email address" });
    }

    const settings = await Settings.findOneAndUpdate(
      { userId: req.userId },
      {
        newBugNotifications,
        statusChangeNotifications,
        notificationEmail,
        applicationName,
        supportEmail,
        theme,
        primaryColor,
      },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
