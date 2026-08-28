import { useState, useEffect, useCallback } from "react";
import {
  getBugs,
  updateBug,
  type Bug,
  type BugFilters,
} from "../../lib/api";
import {
  BUG_TYPES,
  SEVERITIES,
  PRIORITIES,
  BUG_STATUSES,
  type BugStatus,
} from "../../lib/forms";

export default function BugDashboard() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BugFilters>({});
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const loadBugs = useCallback(async () => {
    try {
      const data = await getBugs({ ...filters, search: search || undefined });
      setBugs(data);
    } catch (err) {
      console.error("Failed to load bugs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  const handleStatusChange = async (formId: string, status: BugStatus) => {
    try {
      const updated = await updateBug(formId, { status });
      setBugs((prev) => prev.map((b) => (b.formId === formId ? updated : b)));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const toggleSelect = (formId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(formId)) {
        next.delete(formId);
      } else {
        next.add(formId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === bugs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(bugs.map((b) => b.formId)));
    }
  };

  const bulkStatusChange = async (status: BugStatus) => {
    for (const formId of selected) {
      try {
        const updated = await updateBug(formId, { status });
        setBugs((prev) =>
          prev.map((b) => (b.formId === formId ? updated : b))
        );
      } catch (err) {
        console.error(`Failed to update ${formId}:`, err);
      }
    }
    setSelected(new Set());
  };

  const openCount = bugs.filter((b) => b.status === "Open").length;
  const inProgressCount = bugs.filter(
    (b) => b.status === "In Progress"
  ).length;
  const criticalCount = bugs.filter(
    (b) => b.severity === "Critical"
  ).length;
  const fixedCount = bugs.filter((b) => b.status === "Fixed").length;

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading bugs...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Bug Dashboard</h1>
          <p>Track and manage all reported bugs.</p>
        </div>
        <span className="count">{bugs.length} bugs</span>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fa-solid fa-bug"></i>
          </div>
          <div className="stat-value">{bugs.length}</div>
          <div className="stat-label">Total Bugs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#1565c0" }}>
            <i className="fa-solid fa-circle-dot"></i>
          </div>
          <div className="stat-value">{openCount}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#9a7d0a" }}>
            <i className="fa-solid fa-spinner"></i>
          </div>
          <div className="stat-value">{inProgressCount}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#c0392b" }}>
            <i className="fa-solid fa-fire"></i>
          </div>
          <div className="stat-value">{criticalCount}</div>
          <div className="stat-label">Critical</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: "#2e7d32" }}>
            <i className="fa-solid fa-check-circle"></i>
          </div>
          <div className="stat-value">{fixedCount}</div>
          <div className="stat-label">Fixed</div>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search bugs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filters.status || ""}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value || undefined }))
          }
        >
          <option value="">All Status</option>
          {BUG_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.severity || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              severity: e.target.value || undefined,
            }))
          }
        >
          <option value="">All Severity</option>
          {SEVERITIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.priority || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              priority: e.target.value || undefined,
            }))
          }
        >
          <option value="">All Priority</option>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select
          value={filters.bugType || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              bugType: e.target.value || undefined,
            }))
          }
        >
          <option value="">All Types</option>
          {BUG_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {selected.size > 0 && (
        <div className="filter-bar">
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            {selected.size} selected
          </span>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                bulkStatusChange(e.target.value as BugStatus);
              }
            }}
          >
            <option value="">Bulk change status...</option>
            {BUG_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {bugs.length === 0 ? (
        <div className="empty-state">
          <i className="fa-solid fa-bug"></i>
          <h3>No bugs found</h3>
          <p>Create a feedback form to start collecting bugs.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selected.size === bugs.length && bugs.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Priority</th>
                <th>Type</th>
                <th>Assignee</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((b) => (
                <tr key={b.formId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(b.formId)}
                      onChange={() => toggleSelect(b.formId)}
                    />
                  </td>
                  <td>
                    <code style={{ fontSize: "12px" }}>{b.formId}</code>
                  </td>
                  <td>
                    <strong>{b.title}</strong>
                    {b.tags.length > 0 && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--faint)",
                          marginTop: "2px",
                        }}
                      >
                        {b.tags.map((t) => `#${t}`).join(" ")}
                      </div>
                    )}
                  </td>
                  <td>
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(
                          b.formId,
                          e.target.value as BugStatus
                        )
                      }
                    >
                      {BUG_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span
                      className={`badge sev-${b.severity.toLowerCase()}`}
                    >
                      {b.severity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${b.priority.toLowerCase()}`}>
                      {b.priority}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-type">{b.bugType}</span>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{b.assignee}</td>
                  <td style={{ fontSize: "12px", color: "var(--faint)" }}>
                    {new Date(b.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
