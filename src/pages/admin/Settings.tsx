import { useState, useEffect } from "react";
import { getSettings, updateSettings, type SettingsPayload } from "../../lib/api";
import { getSession } from "../../lib/auth";
import { useTheme } from "../../lib/theme";

export default function Settings() {
  const { dark, toggle: toggleThemeMode } = useTheme();
  const [sessionUser] = useState(getSession());
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [settings, setSettings] = useState<SettingsPayload>({
    newBugNotifications: false,
    statusChangeNotifications: false,
    notificationEmail: "",
    applicationName: "BugPilot",
    supportEmail: "support@bugpilot.com",
    theme: "System",
    primaryColor: "#7c3aed",
  });

  useEffect(() => {
    getSettings()
      .then((data) => {
        // Fallback notification email to session user email if not set
        const defaultNotificationEmail = data.notificationEmail || (sessionUser?.email || "");
        setSettings({
          ...data,
          notificationEmail: defaultNotificationEmail,
        });

        // Apply primary color to root if present
        if (data.primaryColor) {
          document.documentElement.style.setProperty("--primary", data.primaryColor);
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setErrorMsg("Failed to load settings. Please refresh the page.");
      })
      .finally(() => setLoading(false));
  }, [sessionUser]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (settings.notificationEmail && !emailRegex.test(settings.notificationEmail)) {
      setErrorMsg("Notification email format is invalid.");
      return;
    }
    if (settings.supportEmail && !emailRegex.test(settings.supportEmail)) {
      setErrorMsg("Support email format is invalid.");
      return;
    }

    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setSuccessMsg("Settings saved successfully");

      // Apply appearance settings immediately
      if (updated.theme) {
        if (updated.theme === "Dark" && !dark) {
          toggleThemeMode();
        } else if (updated.theme === "Light" && dark) {
          toggleThemeMode();
        } else if (updated.theme === "System") {
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
          if (prefersDark !== dark) {
            toggleThemeMode();
          }
        }
      }

      if (updated.primaryColor) {
        document.documentElement.style.setProperty("--primary", updated.primaryColor);
      }

      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to save settings. Please try again.");
    }
  };

  const updateField = <K extends keyof SettingsPayload>(key: K, value: SettingsPayload[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Settings</h1>
          <p>Manage your application preferences and account settings.</p>
        </div>
      </div>

      {successMsg && (
        <div className="settings-alert success">
          <i className="fa-solid fa-circle-check"></i> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="settings-alert error">
          <i className="fa-solid fa-circle-exclamation"></i> {errorMsg}
        </div>
      )}

      <div className="settings-grid">
        <form onSubmit={handleSave} className="saas-form">
          {/* Card 1: General Settings */}
          <div className="saas-card saas-card-settings">
            <div className="saas-card-header">
              <h3>General Settings</h3>
              <p className="saas-helper">Update your application name and contact email.</p>
            </div>
            <div className="saas-grid-2">
              <div className="saas-field full-width">
                <label className="saas-label">Application Name</label>
                <input
                  type="text"
                  className="saas-input"
                  value={settings.applicationName}
                  onChange={(e) => updateField("applicationName", e.target.value)}
                  placeholder="Application Name"
                  required
                />
              </div>
              <div className="saas-field full-width">
                <label className="saas-label">Support Email</label>
                <input
                  type="email"
                  className="saas-input"
                  value={settings.supportEmail}
                  onChange={(e) => updateField("supportEmail", e.target.value)}
                  placeholder="support@bugpilot.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Notifications */}
          <div className="saas-card saas-card-settings" style={{ marginTop: "28px" }}>
            <div className="saas-card-header">
              <h3>Notifications</h3>
              <p className="saas-helper">Configure email notifications.</p>
            </div>
            <div className="saas-notification-item">
              <div>
                <h4 className="saas-notification-title">Email notifications for new bugs</h4>
                <p className="saas-helper">Receive an email when a new bug is submitted.</p>
              </div>
              <div
                className={`saas-toggle-switch ${settings.newBugNotifications ? "active" : ""}`}
                onClick={() => updateField("newBugNotifications", !settings.newBugNotifications)}
              >
                <div className="saas-toggle-knob"></div>
              </div>
            </div>

            <div className="saas-notification-item">
              <div>
                <h4 className="saas-notification-title">Email notifications for status changes</h4>
                <p className="saas-helper">Receive an email when bug status is updated.</p>
              </div>
              <div
                className={`saas-toggle-switch ${settings.statusChangeNotifications ? "active" : ""}`}
                onClick={() => updateField("statusChangeNotifications", !settings.statusChangeNotifications)}
              >
                <div className="saas-toggle-knob"></div>
              </div>
            </div>

            <div className="saas-field full-width" style={{ marginTop: "20px" }}>
              <label className="saas-label">Notification Email</label>
              <input
                type="email"
                className="saas-input"
                value={settings.notificationEmail}
                onChange={(e) => updateField("notificationEmail", e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Card 3: Appearance */}
          <div className="saas-card saas-card-settings" style={{ marginTop: "28px" }}>
            <div className="saas-card-header">
              <h3>Appearance</h3>
              <p className="saas-helper">Customize the appearance of the dashboard.</p>
            </div>
            <div className="saas-grid-2">
              <div className="saas-field">
                <label className="saas-label">Theme</label>
                <select
                  className="saas-select"
                  value={settings.theme}
                  onChange={(e) => updateField("theme", e.target.value as any)}
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                  <option value="System">System</option>
                </select>
              </div>
              <div className="saas-field">
                <label className="saas-label">Primary Color</label>
                <input
                  type="color"
                  className="saas-input saas-input-color"
                  style={{ height: "48px", padding: "4px" }}
                  value={settings.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="settings-action-btn-container" style={{ marginTop: "28px" }}>
            <button type="submit" className="saas-btn primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
