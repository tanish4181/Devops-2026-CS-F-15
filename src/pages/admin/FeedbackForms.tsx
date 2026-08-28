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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const removeBug = async (formId: string) => {
    try {
      await deleteBug(formId);
      setBugs((prev) => prev.filter((b) => b.formId !== formId));
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
          <p>Create forms to collect bug and feedback info from your users.</p>
        </div>
        <span className="count">{bugs.length} forms</span>
      </div>

      <div className="admin-grid">
        <form className="form-builder" onSubmit={addBug}>
          <h2>New feedback form</h2>
          <label>
            <span>Title</span>
            <input
              value={draft.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Checkout bug report"
              required
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="What info do you want to collect?"
              rows={3}
            />
          </label>
          <div className="two-col">
            <label>
              <span>Bug type</span>
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
              <span>Severity</span>
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
              <span>Environment</span>
              <input
                value={draft.environment}
                onChange={(e) => update("environment", e.target.value)}
                placeholder="e.g. Production"
              />
            </label>
          </div>
          <label>
            <span>Assignee / Team</span>
            <input
              value={draft.assignee}
              onChange={(e) => update("assignee", e.target.value)}
              placeholder="e.g. Frontend"
            />
          </label>
          <label>
            <span>Tags (comma separated)</span>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ui, crash"
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

        <div className="form-list">
          <h2>Created forms</h2>
          {bugs.length === 0 && (
            <p className="empty">
              No forms yet. Create your first one.
            </p>
          )}
          {bugs.map((b) => (
            <div className="form-item" key={b.formId}>
              <div className="fi-top">
                <h3>{b.title}</h3>
                <button
                  className="linkish danger"
                  onClick={() => removeBug(b.formId)}
                >
                  Delete
                </button>
              </div>
              <p>{b.description || "No description."}</p>
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
              <div className="fi-tags">
                {b.tags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </div>
              <div className="fi-actions">
                <button
                  className="btn sm btn-copy"
                  onClick={() => copyLink(b.formId)}
                >
                  {copySuccess === b.formId
                    ? "Copied!"
                    : "Copy link"}
                </button>
                <a
                  href={`/#/feedback/${b.formId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn sm ghost"
                >
                  Open form
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
            <p>{active.description}</p>
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
              <label>
                <span>Tags</span>
                <div className="fi-tags">
                  {active.tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>
              </label>
            </div>
            <button
              className="btn sm btn-copy"
              onClick={() => copyLink(active.formId)}
            >
              {copySuccess === active.formId
                ? "Copied!"
                : "Copy shareable link"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
