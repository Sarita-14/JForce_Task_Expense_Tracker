import { useState } from "react";
import {
  LayoutDashboard,
  ListPlus,
  ListChecks,
  LogOut,
  Menu,
  Moon,
  Sun,
  Wallet,
  X
} from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "add", label: "Add Expense", icon: ListPlus },
  { id: "list", label: "Expense List", icon: ListChecks }
];

export default function Navbar({ page, onNavigate, user, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.fullName || user?.username || "?")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleNavigate(id) {
    onNavigate(id);
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-logo">
          <Wallet size={20} />
        </span>
        <span className="nav-title">Expense Tracker</span>
      </div>

      <button
        className="nav-menu-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${page === item.id ? "active" : ""}`}
            onClick={() => handleNavigate(item.id)}
          >
            <item.icon size={17} />
            {item.label}
          </button>
        ))}

        <div className="nav-divider" />

        <button
          className="nav-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="nav-user" title={user?.fullName}>
          <span className="nav-avatar">{initials}</span>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
}