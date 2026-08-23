import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const features = [
  {
    title: "Detect",
    desc: "AI agents watch your logs and errors, then surface the root cause automatically.",
  },
  {
    title: "Reproduce",
    desc: "Every issue ships with steps to reproduce and the exact environment context.",
  },
  {
    title: "Resolve",
    desc: "Smart severity scoring routes each bug to the right developer, faster.",
  },
];

export default function Landing() {
  return (
    <div className="page">
      <Navbar />

      <section className="hero">
        <h1 className="hero-title">
          Bug tracking,
          <br />
          <em className="accent-line">without the triage.</em>
        </h1>
        <p className="hero-sub">
          BugPilot detects, reproduces and resolves software bugs with AI agents,
          so your developers ship what matters.
        </p>
        <div className="hero-cta">
          <Link to="/admin" className="btn primary lg">
            Try the console
          </Link>
        </div>
        <p className="hero-note">Sign in to open your BugPilot console</p>
      </section>

      <section id="features" className="features">
        <div className="feature-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>Have a project to track?</h2>
        <div className="hero-cta">
          <Link to="/auth" className="btn primary lg">
            Log in to BugPilot
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}