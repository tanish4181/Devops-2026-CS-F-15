import { NavLink, Outlet, Link } from "react-router-dom";
import { useTheme } from "../../lib/theme";
import { getSession, logout } from "../../lib/auth";
import { useState } from "react";

export default function AdminLayout() {
  const { dark, toggle } = useTheme();
  const [user] = useState(getSession());

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="admin">
      <header className="admin-bar">
        <Link to="/admin" className="logo">
          <span className="logo-mark">◈</span> BugPilot{" "}
          <span className="admin-tag">Admin</span>
        </Link>
        <div className="admin-bar-right">
          <button
            className="icon-btn"
            onClick={toggle}
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {dark ? (
              <i className="fa-solid fa-sun"></i>
            ) : (
              <i className="fa-solid fa-moon"></i>
            )}
          </button>
          {user && <span className="user-email">{user.email}</span>}
          <button className="btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-side">
          <h3>Console</h3>
          <nav>
            <NavLink
              to="/admin/forms"
              className={({ isActive }) =>
                `admin-tab ${isActive ? "on" : ""}`
              }
            >
              <i className="fa-solid fa-file-lines"></i>
              Feedback Forms
            </NavLink>
            <NavLink
              to="/admin/bugs"
              className={({ isActive }) =>
                `admin-tab ${isActive ? "on" : ""}`
              }
            >
              <i className="fa-solid fa-bug"></i>
              Bug Dashboard
            </NavLink>
            <NavLink
              to="/admin/submissions"
              className={({ isActive }) =>
                `admin-tab ${isActive ? "on" : ""}`
              }
            >
              <i className="fa-solid fa-inbox"></i>
              Submissions
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                `admin-tab ${isActive ? "on" : ""}`
              }
            >
              <i className="fa-solid fa-chart-bar"></i>
              Analytics
            </NavLink>
          </nav>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
