import { Moon, PiggyBank, ShieldCheck, Sun, TrendingUp, Wallet } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const FEATURES = [
  { icon: TrendingUp, text: "Visual dashboards for your monthly spending" },
  { icon: ShieldCheck, text: "Your data, secured with hashed credentials" },
  { icon: PiggyBank, text: "Track budgets and stay ahead of overspending" }
];

export default function AuthLayout({ children }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="auth-page">
      <button
        type="button"
        className="nav-icon-btn theme-toggle-floating"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="auth-shell">
        <div className="auth-brand-panel">
          <div className="nav-logo auth-logo">
            <Wallet size={22} />
          </div>
          <h2>Expense Tracker</h2>
          <p>Understand where your money goes, and take control of it.</p>

          <ul className="auth-feature-list">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-form-panel">{children}</div>
      </div>
    </div>
  );
}