import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, isAdmin } from "../lib/auth";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import {
  BugType, Severity, FeedbackForm,
  loadForms, saveForms,
} from "../lib/forms";

const bugTypes: BugType[] = ["UI", "Runtime", "Performance", "Security", "API", "Other"];
const severities: Severity[] = ["Low", "Medium", "High", "Critical"];

const emptyForm: Omit<FeedbackForm, "id" | "createdAt"> = {
  title: "",
  description: "",
  bugType: "UI",
  severity: "Medium",
  priority: "P2",
  status: "Open",
  assignee: "",
  reporter: "",
  environment: "",
  tags: [],
  updatedAt: new Date().toISOString(),
};

export default function Admin() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (user !== undefined && !isAdmin(user)) {
      window.location.replace("/auth");
    }
  }, [user]);

  if (user === undefined) {
    return <div className="gate"><p>Checking admin access...</p></div>;
  }

  if (!isAdmin(user)) {
    return (
      <div className="gate">
        <span className="logo-mark">◈</span>
        <h1>Admin console</h1>
        <p>Your account is not authorized to access this console.</p>
        <Link to="/" className="linkish">Back to home</Link>
      </div>
    );
  }

  return <DashBoard />;
}

function DashBoard() {
  const [forms, setForms] = useState<FeedbackForm[]>(() => loadForms());
  const [draft, setDraft] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [active, setActive] = useState<FeedbackForm | null>(null);

  const persist = (next: FeedbackForm[]) => {
    setForms(next);
    saveForms(next);
  };

  const addForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    const form: FeedbackForm = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee.trim() || "Unassigned",
      tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
      id: `f-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    persist([form, ...forms]);
    setDraft(emptyForm);
    setTagInput("");
  };

  const removeForm = (id: string) => persist(forms.filter((f) => f.id !== id));

  const update = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="admin">
      <header className="admin-bar">
        <Link to="/" className="logo">
          <span className="logo-mark">◈</span> BugPilot <span className="admin-tag">Admin</span>
        </Link>
        <Link to="/" className="btn ghost">Exit</Link>
      </header>

      <div className="admin-body">
        <aside className="admin-side">
          <h3>Console</h3>
          <ul>
            <li className="on">Feedback Forms</li>
            <li>Submissions</li>
            <li>Agents</li>
            <li>Settings</li>
          </ul>
        </aside>

        <main className="admin-main">
          <div className="admin-head">
            <div>
              <h1>Feedback forms</h1>
              <p>Create forms to collect bug and feedback info from your users.</p>
            </div>
            <span className="count">{forms.length} forms</span>
          </div>

          <div className="admin-grid">
            <form className="form-builder" onSubmit={addForm}>
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
                  <select value={draft.bugType} onChange={(e) => update("bugType", e.target.value as BugType)}>
                    {bugTypes.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </label>
                <label>
                  <span>Severity</span>
                  <select value={draft.severity} onChange={(e) => update("severity", e.target.value as Severity)}>
                    {severities.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
              </div>
              <label>
                <span>Assignee / Team</span>
                <input value={draft.assignee} onChange={(e) => update("assignee", e.target.value)} placeholder="e.g. Frontend" />
              </label>
              <label>
                <span>Tags (comma separated)</span>
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="ui, crash" />
              </label>
              <button className="btn primary lg block" type="submit">+ Create form</button>
            </form>

            <div className="form-list">
              <h2>Created forms</h2>
              {forms.length === 0 && <p className="empty">No forms yet. Create your first one.</p>}
              {forms.map((f) => (
                <div className="form-item" key={f.id}>
                  <div className="fi-top">
                    <h3>{f.title}</h3>
                    <button className="linkish danger" onClick={() => removeForm(f.id)}>Delete</button>
                  </div>
                  <p>{f.description || "No description."}</p>
                  <div className="fi-meta">
                    <span className={`pill sev-${f.severity.toLowerCase()}`}>{f.severity}</span>
                    <span className="pill">{f.bugType}</span>
                    <span className="fi-assignee">{f.assignee}</span>
                  </div>
                  <div className="fi-tags">
                    {f.tags.map((t) => <span key={t}>#{t}</span>)}
                  </div>
                  <button className="btn ghost" onClick={() => setActive(f)}>View form</button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {active && (
        <div className="modal" onClick={() => setActive(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-x" onClick={() => setActive(null)}>✕</button>
            <span className="eyebrow">Shareable feedback form</span>
            <h2>{active.title}</h2>
            <p>{active.description}</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <label>
                <span>Describe the bug</span>
                <textarea rows={3} placeholder="What happened? What did you expect?" />
              </label>
              <label>
                <span>Device / Environment</span>
                <input placeholder="Browser, OS, version" />
              </label>
              <button className="btn primary lg block">Submit feedback (demo)</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export type { BugType, Severity, FeedbackForm };