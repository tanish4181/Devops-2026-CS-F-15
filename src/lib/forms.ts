export type BugType =
  | "UI"
  | "Runtime"
  | "Performance"
  | "Security"
  | "API"
  | "Other";

export type Severity = "Low" | "Medium" | "High" | "Critical";

export type BugStatus =
  | "Open"
  | "Triaged"
  | "Assigned"
  | "In Progress"
  | "Fixed"
  | "Retest"
  | "Closed"
  | "Reopened";

export type Priority = "P0" | "P1" | "P2" | "P3";

export interface FeedbackForm {
  id: string;
  title: string;
  description: string;
  bugType: BugType;
  severity: Severity;
  priority: Priority;
  status: BugStatus;
  assignee: string;
  reporter: string;
  environment: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const FORMS_KEY = "bugpilot-forms";

export const initialForms: FeedbackForm[] = [
  {
    id: "BUG-1001",
    title: "Landing page crash report",
    description:
      "Application shows a white screen when users open the landing page.",
    bugType: "Runtime",
    severity: "Critical",
    priority: "P0",
    status: "Open",
    assignee: "Team Alpha",
    reporter: "Admin",
    environment: "Production",
    tags: ["crash", "landing"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "BUG-1002",
    title: "Checkout API latency",
    description:
      "Checkout API takes more than 5 seconds to return a response.",
    bugType: "Performance",
    severity: "High",
    priority: "P1",
    status: "In Progress",
    assignee: "Backend",
    reporter: "Admin",
    environment: "Production",
    tags: ["api", "latency"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function loadForms(): FeedbackForm[] {
  try {
    const stored = localStorage.getItem(FORMS_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        return parsed as FeedbackForm[];
      }
    }
  } catch {
    // Ignore invalid localStorage data
  }

  localStorage.setItem(FORMS_KEY, JSON.stringify(initialForms));

  return initialForms;
}

export function saveForms(forms: FeedbackForm[]) {
  localStorage.setItem(FORMS_KEY, JSON.stringify(forms));
}