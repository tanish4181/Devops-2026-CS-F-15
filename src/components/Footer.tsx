import { Link } from "react-router-dom";

const links = ["Features", "Pricing", "About", "Contact"];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-mark">◈</span>
          <span>BugPilot</span>
        </div>
        <ul className="footer-links">
          {links.map((l) => (
            <li key={l}>
              <Link to="/">{l}</Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="footer-copy">
        © {new Date().getFullYear()} BugPilot. Made by developers, for developers.
      </p>
    </footer>
  );
}