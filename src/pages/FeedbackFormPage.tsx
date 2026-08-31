import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicForm, submitFeedback, type PublicForm } from "../lib/api";

type FormState = "loading" | "form" | "success" | "error" | "not-found";

export default function FeedbackFormPage() {
  const { formId } = useParams<{ formId: string }>();
  const [state, setState] = useState<FormState>("loading");
  const [form, setForm] = useState<PublicForm | null>(null);
  const [bugDescription, setBugDescription] = useState("");
  const [stepsToReproduce, setStepsToReproduce] = useState("");
  const [environment, setEnvironment] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!formId) return;

    getPublicForm(formId)
      .then((data) => {
        setForm(data);
        setState("form");
      })
      .catch(() => {
        setState("not-found");
      });
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !bugDescription.trim() || submitting) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      await submitFeedback(formId, {
        bugDescription: bugDescription.trim(),
        stepsToReproduce: stepsToReproduce.trim(),
        environment: environment.trim(),
        reporterEmail: reporterEmail.trim(),
      });
      setState("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Local state for Severity selection
  const [severity, setSeverity] = useState(form?.severity || "Medium");
  const [bugTitle, setBugTitle] = useState("");

  // Sync default severity when form loads
  useEffect(() => {
    if (form?.severity) {
      setSeverity(form.severity);
    }
    if (form?.title) {
      setBugTitle(form.title);
    }
  }, [form]);

  if (state === "loading") {
    return (
      <div className="gate">
        <span className="logo-mark">◈</span>
        <p>Loading form...</p>
      </div>
    );
  }

  if (state === "not-found") {
    return (
      <div className="gate">
        <span className="logo-mark">◈</span>
        <h1>Form not found</h1>
        <p>
          This feedback form doesn't exist or is no longer active.
        </p>
        <Link to="/" className="btn primary lg">
          Go home
        </Link>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="gate">
        <span className="logo-mark" style={{ color: "#2e7d32" }}>✓</span>
        <h1>Thank you!</h1>
        <p>
          Your bug report has been submitted successfully. The team will
          review it shortly.
        </p>
        <Link to="/" className="btn primary lg">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="saas-container">
      <div className="saas-card">
        <div className="saas-header">
          <span className="saas-badge">BUG REPORT</span>
          <h1 className="saas-title">Submit a bug report</h1>
          <p className="saas-subtitle">
            Help us squash bugs by providing clear and detailed information.
          </p>
        </div>

        <form className="saas-form" onSubmit={handleSubmit}>
          <div className="saas-grid-2">
            {/* Title Column */}
            <div className="saas-field">
              <label className="saas-label">
                <span>Title *</span>
              </label>
              <input
                type="text"
                className="saas-input"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                placeholder="Short, descriptive title of the bug"
                required
              />
              <span className="saas-helper">
                A clear title helps others understand the issue quickly.
              </span>
            </div>

            {/* Severity Column */}
            <div className="saas-field">
              <label className="saas-label">
                <span>Severity *</span>
              </label>
              <select
                className="saas-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <span className="saas-helper">How severe is this issue?</span>
            </div>

            {/* Describe the Bug Column */}
            <div className="saas-field full-width">
              <label className="saas-label">
                <span>Describe the bug *</span>
                <span className="saas-char-counter">
                  {bugDescription.length} / 1000
                </span>
              </label>
              <textarea
                className="saas-textarea"
                rows={5}
                maxLength={1000}
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                placeholder="What happened? What did you expect to happen?"
                required
              />
            </div>

            {/* Steps to reproduce Column */}
            <div className="saas-field full-width">
              <label className="saas-label">
                <span>Steps to reproduce *</span>
              </label>
              <textarea
                className="saas-textarea"
                rows={4}
                value={stepsToReproduce}
                onChange={(e) => setStepsToReproduce(e.target.value)}
                placeholder="1. Go to...  2. Click on...  3. See error..."
                required
              />
              <span className="saas-helper">
                List step-by-step instructions to reproduce the issue.
              </span>
            </div>

            {/* Device / Environment Column */}
            <div className="saas-field">
              <label className="saas-label">
                <span>Device / Environment</span>
              </label>
              <input
                type="text"
                className="saas-input"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Browser, OS, version (e.g. Chrome 122, Windows 11)"
              />
              <span className="saas-helper">Add details about your environment.</span>
            </div>

            {/* Email Column */}
            <div className="saas-field">
              <label className="saas-label">
                <span>Email (optional)</span>
              </label>
              <input
                type="email"
                className="saas-input"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="name@example.com"
              />
              <span className="saas-helper">We'll reach out if we need more info.</span>
            </div>

            {/* Attachments Column */}
            <div className="saas-field full-width">
              <label className="saas-label">
                <span>Attachments (optional)</span>
              </label>
              <div className="saas-upload-area">
                <i className="fa-solid fa-cloud-arrow-up saas-upload-icon"></i>
                <div className="saas-upload-title">
                  Drag and drop files here, or <span>click to browse</span>
                </div>
                <div className="saas-upload-subtitle">
                  Screenshots, recordings, or any relevant files (max 10MB each)
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <p style={{ color: "#c0392b", fontSize: "14px", marginTop: "10px" }}>
              {errorMsg}
            </p>
          )}

          <div className="saas-actions">
            <Link to="/" className="saas-btn secondary">
              Cancel
            </Link>

            <button
              className="saas-btn primary"
              type="submit"
              disabled={submitting}
            >
              <i className="fa-solid fa-bug"></i>
              {submitting ? "Submitting..." : "Submit bug report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

