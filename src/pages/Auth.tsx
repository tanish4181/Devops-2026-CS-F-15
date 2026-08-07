import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { register, login, getSession } from "../lib/auth";

type Mode = "login" | "signup";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getSession()) navigate("/admin");
  }, [navigate]);

  const switchMode = (m: Mode) => {
    setMode(m);
    navigate(`/auth?mode=${m}`, { replace: true });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") register(name, email, password);
    else login(email, password);
    navigate("/admin");
  };

  return (
    <div className="auth-page">
      <div className="auth-art" aria-hidden>
        <div className="art-quote">
          <span className="logo-mark">◈</span>
          <h2>BugPilot</h2>
          <p>
            “We cut our bug triage time by 80%. BugPilot finds the root cause
            before our coffee gets cold.”
          </p>
          <span className="art-author">Priya, Engineering Lead</span>
        </div>
      </div>

      <div className="auth-panel">
        <Link to="/" className="auth-back">← Back to home</Link>
        <div className="auth-card">
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="auth-sub">
            {mode === "login"
              ? "Log in to continue tracking your bugs."
              : "Start your free BugPilot workspace."}
          </p>

          <div className="seg">
            <button className={mode === "login" ? "seg-btn active" : "seg-btn"} onClick={() => switchMode("login")}>
              Login
            </button>
            <button className={mode === "signup" ? "seg-btn active" : "seg-btn"} onClick={() => switchMode("signup")}>
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === "signup" && (
              <label>
                <span>Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" required />
              </label>
            )}
            <label>
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </label>
            <label>
              <span>Password</span>
              <div className="pw">
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" className="pw-toggle" onClick={() => setShowPw((s) => !s)}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </label>
            {mode === "login" && (
              <div className="auth-row">
                <label className="check">
                  <input type="checkbox" defaultChecked /> Remember me
                </label>
                <button type="button" className="linkish" onClick={() => alert("Password reset coming soon.")}>
                  Forgot password?
                </button>
              </div>
            )}

            <button className="btn primary lg block" type="submit">
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="auth-foot">
            {mode === "login" ? "No account yet? " : "Already have an account? "}
            <button className="linkish" onClick={() => switchMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
            <br />
            Authentication is a demo. Any credentials will let you in.
          </p>
        </div>
      </div>
    </div>
  );
}