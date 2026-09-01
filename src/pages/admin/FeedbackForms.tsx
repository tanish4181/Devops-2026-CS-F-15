import { useState, useEffect, useCallback } from "react";
import {
  getBugs,
  createBug,
  deleteBug,
  updateBug,
  type Bug,
  type CreateBugPayload,
} from "../../lib/api";
import {
  BUG_TYPES,
  SEVERITIES,
  PRIORITIES,
  BUG_STATUSES,
  type BugType,
  type Severity,
  type Priority,
  type BugStatus,
} from "../../lib/forms";

const emptyForm: CreateBugPayload = {
  title: "",
  description: "",
  bugType: "UI",
  severity: "Medium",
  priority: "P2",
  assignee: "",
  reporter: "",
  environment: "",
  tags: [],
};

export default function FeedbackForms() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [draft, setDraft] = useState<CreateBugPayload>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [active, setActive] = useState<Bug | null>(null);
  const [editingBug, setEditingBug] = useState<Bug | null>(null);
  const [editTagInput, setEditTagInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const loadBugs = useCallback(async () => {
    try {
      const data = await getBugs();
      setBugs(data);
    } catch (err) {
      console.error("Failed to load bugs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBugs();
  }, [loadBugs]);

  const addBug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || submitting) return;

    setSubmitting(true);
    try {
      const newBug = await createBug({
        ...draft,
        title: draft.title.trim(),
        description: draft.description?.trim() || "",
        assignee: draft.assignee?.trim() || "Unassigned",
        tags: tagInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setBugs((prev) => [newBug, ...prev]);
      setDraft(emptyForm);
      setTagInput("");
    } catch (err) {
      console.error("Failed to create bug:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (bug: Bug) => {
    setEditingBug({ ...bug });
    setEditTagInput((bug.tags || []).join(", "));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBug || !editingBug.title.trim() || savingEdit) return;

    setSavingEdit(true);
    try {
      const updatedTags = editTagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const updated = await updateBug(editingBug.formId, {
        title: editingBug.title.trim(),
        description: editingBug.description || "",
        bugType: editingBug.bugType,
        severity: editingBug.severity,
        priority: editingBug.priority,
        status: editingBug.status,
        assignee: editingBug.assignee || "Unassigned",
        environment: editingBug.environment || "",
        tags: updatedTags,
      });

      setBugs((prev) =>
        prev.map((b) => (b.formId === editingBug.formId ? updated : b))
      );
      if (active?.formId === editingBug.formId) {
        setActive(updated);
      }
      setEditingBug(null);
    } catch (err) {
      console.error("Failed to update bug form:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  const removeBug = async (formId: string) => {
    if (!window.confirm("Are you sure you want to delete this feedback form?")) return;
    try {
      await deleteBug(formId);
      setBugs((prev) => prev.filter((b) => b.formId !== formId));
      if (active?.formId === formId) setActive(null);
      if (editingBug?.formId === formId) setEditingBug(null);
    } catch (err) {
      console.error("Failed to delete bug:", err);
    }
  };

  const handleStatusChange = async (formId: string, status: BugStatus) => {
    try {
      const updated = await updateBug(formId, { status });
      setBugs((prev) => prev.map((b) => (b.formId === formId ? updated : b)));
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const copyLink = (formId: string) => {
    const url = `${window.location.origin}/#/feedback/${formId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(formId);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const update = <K extends keyof CreateBugPayload>(
    key: K,
    value: CreateBugPayload[K]
  ) => setDraft((d) => ({ ...d, [key]: value }));

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading forms...</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Feedback forms</h1>
          <p>Create and customize forms to collect bug and feedback info from your users.</p>
        </div>
        <span className="count">{bugs.length} forms</span>
      </div>

      <div className="admin-grid">
        {/* New Form Builder */}
        <form className="form-builder" onSubmit={addBug}>
          <h2>New feedback form</h2>
          <label>
            <span>Form Title *</span>
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Checkout bug report, Customer Feedback"
              required
            />
          </label>
          <label>
            <span>Description / Instructions</span>
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Explain to users what details to provide..."
              rows={3}
            />
          </label>
          <div className="two-col">
            <label>
              <span>Default Bug type</span>
              <select
                value={draft.bugType}
                onChange={(e) => update("bugType", e.target.value as BugType)}
              >
                {BUG_TYPES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Default Severity</span>
              <select
                value={draft.severity}
                onChange={(e) =>
                  update("severity", e.target.value as Severity)
                }
              >
                {SEVERITIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="two-col">
            <label>
              <span>Priority</span>
              <select
                value={draft.priority}
                onChange={(e) =>
                  update("priority", e.target.value as Priority)
                }
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Target Environment</span>
              <input
                value={draft.environment}
                onChange={(e) => update("environment", e.target.value)}
                placeholder="e.g. Production, Staging"
              />
            </label>
          </div>
          <label>
            <span>Assignee / Team</span>
            <input
              value={draft.assignee}
              onChange={(e) => update("assignee", e.target.value)}
              placeholder="e.g. Frontend Team"
            />
          </label>
          <label>
            <span>Tags (comma separated)</span>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ui, payment, checkout"
            />
          </label>
          <button
            className="btn primary lg block"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "+ Create form"}
          </button>
        </form>

        {/* Forms List */}
        <div className="form-list">
          <h2>Created forms</h2>
          {bugs.length === 0 && (
            <p className="empty">
              No forms yet. Create your first one using the builder on the left.
            </p>
          )}
          {bugs.map((b) => (
            <div className="form-item" key={b.formId}>
              <div className="fi-top">
                <h3>{b.title}</h3>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    className="linkish"
                    onClick={() => startEditing(b)}
                    style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 600 }}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Edit
                  </button>
                  <button
                    className="linkish danger"
                    onClick={() => removeBug(b.formId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p>{b.description || "No description provided."}</p>
              <div className="fi-meta">
                <span
                  className={`badge sev-${b.severity.toLowerCase()}`}
                >
                  {b.severity}
                </span>
                <span className="badge badge-type">{b.bugType}</span>
                <span className="badge badge-priority">
                  {b.priority}
                </span>
                <span
                  className={`badge status-${b.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {b.status}
                </span>
                <span className="fi-assignee">{b.assignee}</span>
              </div>
              {b.tags && b.tags.length > 0 && (
                <div className="fi-tags">
                  {b.tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>
              )}
              <div className="fi-actions">
                <button
                  className="btn sm btn-copy"
                  onClick={() => copyLink(b.formId)}
                >
                  {copySuccess === b.formId
                    ? "✓ Copied!"
                    : "Copy link"}
                </button>
                <a
                  href={`/#/feedback/${b.formId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn sm ghost"
                >
                  Open form ↗
                </a>
                <button
                  className="btn sm ghost"
                  onClick={() => setActive(b)}
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Form Modal */}
      {editingBug && (
        <div className="modal" onClick={() => setEditingBug(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: "600px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-x"
              onClick={() => setEditingBug(null)}
            >
              ✕
            </button>
            <span className="eyebrow">{editingBug.formId}</span>
            <h2 style={{ marginBottom: "16px" }}>Edit Feedback Form</h2>

            <form onSubmit={handleSaveEdit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>Form Title *</span>
                <input
                  value={editingBug.title}
                  onChange={(e) =>
                    setEditingBug({ ...editingBug, title: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>Description / Subtitle</span>
                <textarea
                  value={editingBug.description}
                  onChange={(e) =>
                    setEditingBug({ ...editingBug, description: e.target.value })
                  }
                  rows={3}
                />
              </label>

              <div className="two-col">
                <label>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Bug Type</span>
                  <select
                    value={editingBug.bugType}
                    onChange={(e) =>
                      setEditingBug({
                        ...editingBug,
                        bugType: e.target.value as BugType,
                      })
                    }
                  >
                    {BUG_TYPES.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Severity</span>
                  <select
                    value={editingBug.severity}
                    onChange={(e) =>
                      setEditingBug({
                        ...editingBug,
                        severity: e.target.value as Severity,
                      })
                    }
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="two-col">
                <label>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Priority</span>
                  <select
                    value={editingBug.priority}
                    onChange={(e) =>
                      setEditingBug({
                        ...editingBug,
                        priority: e.target.value as Priority,
                      })
                    }
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Status</span>
                  <select
                    value={editingBug.status}
                    onChange={(e) =>
                      setEditingBug({
                        ...editingBug,
                        status: e.target.value as BugStatus,
                      })
                    }
                  >
                    {BUG_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="two-col">
                <label>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Assignee / Team</span>
                  <input
                    value={editingBug.assignee}
                    onChange={(e) =>
                      setEditingBug({ ...editingBug, assignee: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>Target Environment</span>
                  <input
                    value={editingBug.environment || ""}
                    onChange={(e) =>
                      setEditingBug({ ...editingBug, environment: e.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                <span style={{ fontWeight: 600, fontSize: "13px" }}>Tags (comma separated)</span>
                <input
                  value={editTagInput}
                  onChange={(e) => setEditTagInput(e.target.value)}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setEditingBug(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {active && (
        <div className="modal" onClick={() => setActive(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-x"
              onClick={() => setActive(null)}
            >
              ✕
            </button>
            <span className="eyebrow">
              {active.formId}
            </span>
            <h2>{active.title}</h2>
            <p>{active.description || "No description provided."}</p>

            <div className="modal-meta">
              <div className="two-col">
                <label>
                  <span>Status</span>
                  <select
                    value={active.status}
                    onChange={(e) =>
                      handleStatusChange(
                        active.formId,
                        e.target.value as BugStatus
                      )
                    }
                  >
                    {BUG_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Assignee</span>
                  <input
                    value={active.assignee}
                    onChange={(e) => {
                      const updated = {
                        ...active,
                        assignee: e.target.value,
                      };
                      setActive(updated);
                    }}
                    onBlur={() =>
                      updateBug(active.formId, {
                        assignee: active.assignee,
                      })
                    }
                  />
                </label>
              </div>
              <div className="fi-meta">
                <span
                  className={`badge sev-${active.severity.toLowerCase()}`}
                >
                  {active.severity}
                </span>
                <span className="badge badge-type">
                  {active.bugType}
                </span>
                <span className="badge badge-priority">
                  {active.priority}
                </span>
              </div>
              {active.tags && active.tags.length > 0 && (
                <label>
                  <span>Tags</span>
                  <div className="fi-tags">
                    {active.tags.map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                </label>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                className="btn sm btn-copy"
                onClick={() => copyLink(active.formId)}
              >
                {copySuccess === active.formId
                  ? "✓ Copied!"
                  : "Copy shareable link"}
              </button>
              <button
                className="btn sm ghost"
                onClick={() => {
                  const target = active;
                  setActive(null);
                  startEditing(target);
                }}
              >
                <i className="fa-solid fa-pen-to-square"></i> Edit Full Form
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
