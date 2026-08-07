export interface User {
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

const USERS_KEY = "bugpilot-users";
const SESSION_KEY = "bugpilot-session";
const ADMIN_KEY = "bugpilot-admin";

export function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as User[];
  } catch {
    return [];
  }
}

export function getSession(): User | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function register(name: string, email: string, password: string): User {
  const user: User = { name, email, password, createdAt: new Date().toISOString() };
  const users = getUsers().filter((u) => u.email !== email);
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function login(email: string, password: string): User {
  const existing = getUsers().find((u) => u.email === email && u.password === password);
  const user: User =
    existing ?? { name: email.split("@")[0] || "User", email, password, createdAt: new Date().toISOString() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAdmin(): boolean {
  return localStorage.getItem(ADMIN_KEY) === "granted";
}

export function grantAdmin() {
  localStorage.setItem(ADMIN_KEY, "granted");
}
