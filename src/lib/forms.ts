export type BugType = "UI" | "Runtime" | "Performance" | "Security" | "API" | "Other";
export type Severity = "Low" | "Medium" | "High" | "Critical";

export interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  bugType: BugType;
  severity: Severity;
  assignee: string;
  tags: string[];
  createdAt: string;
}

const FORMS_KEY = "bugpilot-forms";

export const initialForms: FeedbackForm[] = [
  {
    id: "f-1001",
    title: "Landing page crash report",
    description: "Collect crash logs and reproduction steps from users experiencing the landing page white screen issue.",
    bugType: "Runtime",
    severity: "Critical",
    assignee: "Team Alpha",
    tags: ["crash", "landing"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "f-1002",
    title: "Checkout API latency",
    description: "Gather timing data and request payloads for slow checkout responses noticed in production.",
    bugType: "Performance",
    severity: "High",
    assignee: "Backend",
    tags: ["api", "latency"],
    createdAt: new Date().toISOString(),
  },
];

export function loadForms(): FeedbackForm[] {
  try {
    const stored = JSON.parse(localStorage.getItem(FORMS_KEY) || "");
    if (Array.isArray(stored)) return stored as FeedbackForm[];
  } catch {
    localStorage.setItem(FORMS_KEY, JSON.stringify(initialForms));
  }
  return initialForms;
}

export function saveForms(forms: FeedbackForm[]) {
  localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
}