import { useState } from "react";
import { getSession, logout } from "../../lib/auth";
import { useTheme } from "../../lib/theme";

const ADMIN_EMAILS = [
  {
    email: "Tanish4181@gmail.com",
    role: "Primary Administrator",
    name: "Tanish",
  },
  {
    email: "sajalsinghal62650@gmail.com",
    role: "Administrator",
    name: "Sajal Singhal",
  },
];

export default function Settings() {
  const { dark, toggle } = useTheme();
  const sessionUser = getSession();
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const currentUserEmail = sessionUser?.email || "Tanish4181@gmail.com";

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to sign out of BugPilot?")) {
      await logout();
      window.location.href = "/#/auth";
    }
  };

  return (
    <>
      {/* Header */}
      <div className="admin-head">
        <div>
          <h1>Settings</h1>
          <p>View your profile, administrator accounts, theme preferences, and session controls.</p>
        </div>
      </div>

      <div className="simple-settings-container">
        {/* 1. Profile Email ID */}
        <div className="simple-settings-card">
          <div className="simple-card-header">
            <div className="simple-card-title">
              <i className="fa-solid fa-circle-user"></i>
              <h3>Your Profile</h3>
            </div>
            <span className="badge badge-priority">Active Session</span>
          </div>

          <div className="simple-profile-box">
            <div className="simple-avatar">
              {currentUserEmail.charAt(0).toUpperCase()}
            </div>
            <div className="simple-profile-details">
              <span className="simple-label">Logged In Email ID</span>
              <div className="simple-email-row">
                <strong className="simple-email-text">{currentUserEmail}</strong>
                <button
                  type="button"
                  className="simple-copy-btn"
                  onClick={() => handleCopy(currentUserEmail)}
                  title="Copy email address"
                >
                  {copiedEmail === currentUserEmail ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <span className="simple-role-tag">
                <i className="fa-solid fa-shield-halved"></i> Administrator
              </span>
            </div>
          </div>
        </div>

        {/* 2. Administrator Emails */}
        <div className="simple-settings-card">
          <div className="simple-card-header">
            <div className="simple-card-title">
              <i className="fa-solid fa-users-gear"></i>
              <h3>Administrator Emails</h3>
            </div>
            <span className="badge badge-type">{ADMIN_EMAILS.length} Administrators</span>
          </div>

          <p className="simple-desc">
            Authorized administrator accounts with full permissions to manage forms, bugs, and system settings.
          </p>

          <div className="simple-admin-list">
            {ADMIN_EMAILS.map((admin) => (
              <div key={admin.email} className="simple-admin-item">
                <div className="simple-admin-avatar">
                  <i className="fa-solid fa-user-shield"></i>
                </div>
                <div className="simple-admin-info">
                  <div className="simple-admin-top">
                    <h4>{admin.name}</h4>
                    <span className="badge" style={{ background: "var(--primary-subtle)", color: "var(--primary)", fontSize: "11px" }}>
                      {admin.role}
                    </span>
                  </div>
                  <div className="simple-email-row">
                    <code className="simple-code-email">{admin.email}</code>
                    <button
                      type="button"
                      className="simple-copy-btn"
                      onClick={() => handleCopy(admin.email)}
                      title="Copy administrator email"
                    >
                      {copiedEmail === admin.email ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Dark and Light Mode Switch */}
        <div className="simple-settings-card">
          <div className="simple-card-header">
            <div className="simple-card-title">
              <i className="fa-solid fa-circle-half-stroke"></i>
              <h3>Theme Preferences</h3>
            </div>
            <span className="badge" style={{ fontSize: "12px" }}>
              {dark ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </span>
          </div>

          <p className="simple-desc">
            Toggle between light and dark appearance for your workspace.
          </p>

          <div className="simple-theme-toggle-row">
            <button
              type="button"
              className={`simple-theme-btn ${!dark ? "active" : ""}`}
              onClick={() => {
                if (dark) toggle();
              }}
            >
              <div className="simple-theme-btn-icon light">
                <i className="fa-solid fa-sun"></i>
              </div>
              <div className="simple-theme-btn-text">
                <strong>Light Mode</strong>
                <small>Clean, high-contrast daytime interface</small>
              </div>
              {!dark && (
                <i className="fa-solid fa-circle-check simple-check-icon"></i>
              )}
            </button>

            <button
              type="button"
              className={`simple-theme-btn ${dark ? "active" : ""}`}
              onClick={() => {
                if (!dark) toggle();
              }}
            >
              <div className="simple-theme-btn-icon dark">
                <i className="fa-solid fa-moon"></i>
              </div>
              <div className="simple-theme-btn-text">
                <strong>Dark Mode</strong>
                <small>Sleek dark look, comfortable for low light</small>
              </div>
              {dark && (
                <i className="fa-solid fa-circle-check simple-check-icon"></i>
              )}
            </button>
          </div>
        </div>

        {/* 4. Sign Out Option */}
        <div className="simple-settings-card simple-danger-card">
          <div className="simple-card-header">
            <div className="simple-card-title" style={{ color: "#ef4444" }}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <h3>Account Session</h3>
            </div>
          </div>

          <div className="simple-signout-row">
            <div>
              <strong style={{ fontSize: "14.5px", display: "block", color: "var(--text)" }}>
                Sign Out of Your Account
              </strong>
              <span className="simple-desc" style={{ marginTop: "2px", display: "block" }}>
                Safely disconnect and exit your current session on this browser.
              </span>
            </div>

            <button
              type="button"
              className="simple-signout-btn"
              onClick={handleSignOut}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
