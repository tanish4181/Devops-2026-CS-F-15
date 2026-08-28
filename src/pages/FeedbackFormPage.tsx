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
    <div className="gate">
      <Link to="/" className="auth-back">
        ← BugPilot
      </Link>

      <div className="gate-card">
        <span className="eyebrow">Bug Report</span>
        <h1>{form?.title}</h1>
        {form?.description && <p>{form.description}</p>}

        <div className="fi-meta" style={{ marginBottom: "20px" }}>
          {form?.bugType && (
            <span className="badge badge-type">{form.bugType}</span>
          )}
          {form?.severity && (
            <span className={`badge sev-${form.severity.toLowerCase()}`}>
              {form.severity}
            </span>
          )}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Describe the bug *</span>
            <textarea
              rows={4}
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              placeholder="What happened? What did you expect to happen?"
              required
            />
          </label>
          <label>
            <span>Steps to reproduce</span>
            <textarea
              rows={3}
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="1. Go to... 2. Click on... 3. See error..."
            />
          </label>
          <label>
            <span>Device / Environment</span>
            <input
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder="Browser, OS, version (e.g. Chrome 120, macOS)"
            />
          </label>
          <label>
            <span>Email (optional)</span>
            <input
              type="email"
              value={reporterEmail}
              onChange={(e) => setReporterEmail(e.target.value)}
              placeholder="For follow-up questions"
            />
          </label>

          {errorMsg && (
            <p style={{ color: "#c0392b", fontSize: "14px" }}>{errorMsg}</p>
          )}

          <button
            className="btn primary lg block"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit bug report"}
          </button>
        </form>
      </div>
    </div>
  );
}
